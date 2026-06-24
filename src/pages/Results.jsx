import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, ArrowLeft } from 'lucide-react';
import './Results.css';

const Results = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('currentQuizAttempt');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.topic === topic) {
        setResultData(parsed);
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [topic, navigate]);

  if (!resultData) return <div className="loading">Loading results...</div>;

  const percentage = Math.round((resultData.score / resultData.total) * 100);
  const isPassed = percentage >= 60;

  return (
    <div className="results-container">
      <button className="btn-link back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="results-header-card">
        <div className="score-ring-container">
          <svg viewBox="0 0 36 36" className={`circular-chart ${isPassed ? 'green' : 'red'}`}>
            <path className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path className="circle"
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">{percentage}%</text>
          </svg>
        </div>
        
        <div className="score-details">
          <h2>{isPassed ? 'Congratulations!' : 'Keep Learning!'}</h2>
          <p className="score-text">You scored {resultData.score} out of {resultData.total}</p>
          
          <div className="result-actions">
            <button className="btn-primary" onClick={() => navigate(`/quiz/${topic}`)}>
              Retake Quiz
            </button>
            {isPassed && (
              <button className="btn-secondary" onClick={() => navigate(`/certificate/${topic}`)}>
                <Award size={18} /> Get Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <h3>Detailed Feedback</h3>
        <div className="answers-list">
          {resultData.answers.map((ans, idx) => (
            <div key={idx} className={`answer-card ${ans.isCorrect ? 'correct-bg' : 'incorrect-bg'}`}>
              <div className="answer-header">
                <span className="q-num">Q{idx + 1}.</span>
                <p className="q-text">{ans.questionText}</p>
                {ans.isCorrect ? 
                  <CheckCircle className="status-icon correct" /> : 
                  <XCircle className="status-icon incorrect" />
                }
              </div>
              
              <div className="answer-body">
                <div className="user-choice">
                  <strong>Your Answer:</strong> 
                  <span className={ans.isCorrect ? 'text-success' : 'text-danger'}>
                    {ans.selected !== null ? ans.options[ans.selected] : 'Not Answered'}
                  </span>
                </div>
                {!ans.isCorrect && (
                  <div className="correct-choice">
                    <strong>Correct Answer:</strong> 
                    <span className="text-success">{ans.options[ans.correctOption]}</span>
                  </div>
                )}
                <div className="explanation-box">
                  <strong>Explanation:</strong>
                  <p>{ans.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
