import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import questionsData from '../data/questions.json';
import { PlusCircle, Download, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';
import './Admin.css';

const TOPICS = [
  { id: 'password_security', name: 'Password Security' },
  { id: 'phishing', name: 'Phishing Awareness' },
  { id: 'malware', name: 'Malware Protection' },
  { id: 'network_security', name: 'Network Security' },
  { id: 'safe_browsing', name: 'Safe Browsing' }
];

const Admin = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('password_security');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [customQuestions, setCustomQuestions] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Load custom questions on mount
  useEffect(() => {
    const saved = localStorage.getItem('customQuestions');
    if (saved) {
      try {
        setCustomQuestions(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing custom questions", e);
      }
    }
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!question || options.some(opt => !opt) || !explanation) {
      alert("Please fill in all fields.");
      return;
    }

    // Determine highest ID across base and custom for this topic
    const baseTopicQuestions = questionsData[topic] || [];
    const customTopicQuestions = customQuestions[topic] || [];
    const allTopicQuestions = [...baseTopicQuestions, ...customTopicQuestions];
    
    let maxId = 0;
    allTopicQuestions.forEach(q => {
      if (q.id > maxId) maxId = q.id;
    });

    const newQuestion = {
      id: maxId + 1,
      question,
      options,
      correct: parseInt(correct),
      explanation
    };

    const newCustomQuestions = {
      ...customQuestions,
      [topic]: [...customTopicQuestions, newQuestion]
    };

    setCustomQuestions(newCustomQuestions);
    localStorage.setItem('customQuestions', JSON.stringify(newCustomQuestions));
    
    setSuccessMsg('Question added successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);

    // Reset form
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrect(0);
    setExplanation('');
  };

  const handleClearCustom = () => {
    if (window.confirm("Are you sure you want to delete all custom questions? This action cannot be undone.")) {
      setCustomQuestions({});
      localStorage.removeItem('customQuestions');
      setSuccessMsg('All custom questions cleared.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleExport = () => {
    // Merge base and custom
    const merged = { ...questionsData };
    Object.keys(customQuestions).forEach(t => {
      if (!merged[t]) merged[t] = [];
      merged[t] = [...merged[t], ...customQuestions[t]];
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(merged, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "questions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const totalCustom = Object.values(customQuestions).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <h2>Question Administration</h2>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="admin-stats-card">
            <h3>Custom Questions Added</h3>
            <div className="stats-number">{totalCustom}</div>
            {Object.keys(customQuestions).map(t => (
              customQuestions[t] && customQuestions[t].length > 0 && (
                <div key={t} className="stats-topic">
                  {TOPICS.find(tp => tp.id === t)?.name || t}: {customQuestions[t].length}
                </div>
              )
            ))}
          </div>

          <div className="admin-actions">
            <button className="btn-primary" onClick={handleExport}>
              <Download size={18} /> Export questions.json
            </button>
            <p className="action-hint">Download the updated file to permanently save your questions to the source code.</p>
            
            <button className="btn-danger" onClick={handleClearCustom} disabled={totalCustom === 0}>
              <Trash2 size={18} /> Clear Custom Questions
            </button>
          </div>
        </div>

        <div className="admin-main">
          <form className="admin-form" onSubmit={handleAddQuestion}>
            <h3>Add New Question</h3>
            
            {successMsg && (
              <div className="success-banner">
                <CheckCircle size={18} /> {successMsg}
              </div>
            )}

            <div className="form-group">
              <label>Select Topic</label>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Question Text</label>
              <textarea 
                required 
                rows="3" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the question here..."
              />
            </div>

            <div className="options-group">
              <label>Options</label>
              {options.map((opt, idx) => (
                <div key={idx} className="option-input-row">
                  <span className="option-label">{String.fromCharCode(65 + idx)}.</span>
                  <input 
                    type="text" 
                    required 
                    value={opt} 
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                  />
                  <input 
                    type="radio" 
                    name="correctOption" 
                    checked={correct === idx}
                    onChange={() => setCorrect(idx)}
                    title="Mark as correct answer"
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Explanation (shown after quiz)</label>
              <textarea 
                required 
                rows="2" 
                value={explanation} 
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain why the correct answer is right..."
              />
            </div>

            <button type="submit" className="btn-submit">
              <PlusCircle size={20} /> Add Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
