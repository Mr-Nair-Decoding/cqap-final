import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import questionsData from '../data/questions.json';
import { Clock, AlertCircle, ShieldAlert } from 'lucide-react';
import './Quiz.css';

// Fisher-Yates shuffle
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const Quiz = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { saveScore } = useContext(AuthContext);
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Anti-cheat: Listen for window focus/blur and PrintScreen/Snipping shortcuts
  useEffect(() => {
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);
    
    const handleKeyDown = (e) => {
      // Instantly blank screen on Meta (Windows key) to preempt Win+Shift+S snipping tool
      if (e.key === 'Meta' || e.metaKey || e.key === 'PrintScreen') {
        setIsFocused(false);
        navigator.clipboard.writeText(''); // Attempt to clear clipboard
        alert('Security Alert: Screenshots and Snipping Tools are strictly disabled.');
      }
    };
    
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        setIsFocused(false);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let topicQuestions = [];
    let customTopicQuestions = [];
    
    if (questionsData[topic]) {
      topicQuestions = [...questionsData[topic]];
    }

    try {
      const saved = localStorage.getItem('customQuestions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[topic]) {
          customTopicQuestions = [...parsed[topic]];
        }
      }
    } catch (e) {
      console.error("Error loading custom questions", e);
    }

    if (topicQuestions.length > 0 || customTopicQuestions.length > 0) {
      // 1. Shuffle base questions
      const shuffledBase = shuffleArray(topicQuestions);
      
      // 2. Prioritize custom questions: Take ALL custom questions, fill the rest (up to 50) with base questions
      const neededFromBase = Math.max(0, 50 - customTopicQuestions.length);
      const combined = [...customTopicQuestions, ...shuffledBase.slice(0, neededFromBase)];

      // 3. Shuffle the combined selected 50 questions so custom questions appear at random spots
      const selectedQuestions = shuffleArray(combined);

      // 4. Shuffle options for each question
      const fullyRandomized = selectedQuestions.map(q => {
        const correctText = q.options[q.correct];
        const shuffledOptions = shuffleArray(q.options);
        const newCorrectIndex = shuffledOptions.indexOf(correctText);
        
        return {
          ...q,
          options: shuffledOptions,
          correct: newCorrectIndex
        };
      });

      setQuestions(fullyRandomized);
      setTimeLeft(fullyRandomized.length * 30); // Strictly 30 seconds per question
    } else {
      navigate('/dashboard'); 
    }
  }, [topic, navigate]);

  const handleFinish = useCallback((finalAnswers = answers) => {
    setIsFinished(true);
    const score = finalAnswers.filter(a => a.isCorrect).length;
    saveScore(topic, score, questions.length);
    localStorage.setItem('currentQuizAttempt', JSON.stringify({
      topic,
      score,
      total: questions.length,
      answers: finalAnswers
    }));
    navigate(`/results/${topic}`);
  }, [answers, navigate, questions.length, saveScore, topic]);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished && questions.length > 0) {
      handleFinish();
      return;
    }
    
    if (!isFinished && questions.length > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, isFinished, questions.length, handleFinish]);

  const handleNext = () => {
    const currentAnswer = {
      questionId: questions[currentIdx].id,
      selected: selectedOption,
      isCorrect: selectedOption === questions[currentIdx].correct,
      questionText: questions[currentIdx].question,
      options: questions[currentIdx].options,
      correctOption: questions[currentIdx].correct,
      explanation: questions[currentIdx].explanation
    };
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const preventCheating = (e) => {
    e.preventDefault();
  };

  if (questions.length === 0) return <div className="loading">Loading...</div>;

  if (!isFocused) {
    return (
      <div className="security-lockout">
        <ShieldAlert size={64} className="lockout-icon" />
        <h2>SECURITY WARNING</h2>
        <p>The test has been hidden because the window lost focus.</p>
        <p>Switching tabs, using Snipping Tools, or opening other applications is strictly prohibited.</p>
        <p>Please click back into this window to resume the test.</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div 
      className="quiz-container secure-mode"
      onCopy={preventCheating}
      onCut={preventCheating}
      onPaste={preventCheating}
      onContextMenu={preventCheating}
    >
      <div className="quiz-header">
        <div className="quiz-progress">
          Question {currentIdx + 1} of {questions.length}
        </div>
        <div className={`quiz-timer ${timeLeft < 15 ? 'warning' : ''}`}>
          <Clock size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="quiz-card">
        <h3 className="question-text noselect">{currentQ.question}</h3>
        
        <div className="options-container noselect">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedOption === idx ? 'selected' : ''}`}
              onClick={() => setSelectedOption(idx)}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>

        <div className="quiz-actions">
          <button 
            className="btn-primary"
            disabled={selectedOption === null}
            onClick={handleNext}
          >
            {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
      
      <div className="quiz-footer">
        <AlertCircle size={16} />
        <p>Answer carefully. You cannot go back. Secure Mode: Copy/Paste disabled.</p>
      </div>
    </div>
  );
};

export default Quiz;
