import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, ShieldAlert, Key, GlobeLock, Network, Settings } from 'lucide-react';
import './Dashboard.css';

const TOPICS = [
  { id: 'password_security', title: 'Password Security', icon: <Key size={24} />, description: 'Learn how to create and manage strong passwords.' },
  { id: 'phishing', title: 'Phishing', icon: <ShieldAlert size={24} />, description: 'Identify and avoid fraudulent emails and messages.' },
  { id: 'malware', title: 'Malware', icon: <BookOpen size={24} />, description: 'Understand different types of malicious software.' },
  { id: 'network_security', title: 'Network Security', icon: <Network size={24} />, description: 'Protect your data on public and private networks.' },
  { id: 'safe_browsing', title: 'Safe Browsing', icon: <GlobeLock size={24} />, description: 'Best practices for safe internet surfing.' },
];

const Dashboard = () => {
  const { user, logout, getScores } = useContext(AuthContext);
  const navigate = useNavigate();
  const scores = getScores();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const startQuiz = (topicId) => {
    navigate(`/quiz/${topicId}`);
  };

  const viewCertificate = (topicId) => {
    navigate(`/certificate/${topicId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Welcome, {user?.username}!</h2>
          <p>Select a topic to start your cybersecurity training.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            <Settings size={18} /> Admin Panel
          </button>
          <button onClick={handleLogout} className="btn-secondary logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="topics-section">
          <h3>Quiz Topics</h3>
          <div className="topics-grid">
            {TOPICS.map(topic => {
              const scoreData = scores[topic.id];
              const isCompleted = !!scoreData;
              
              return (
                <div key={topic.id} className={`topic-card ${isCompleted ? 'completed' : ''}`}>
                  <div className="topic-icon">{topic.icon}</div>
                  <h4>{topic.title}</h4>
                  <p>{topic.description}</p>
                  
                  {isCompleted ? (
                    <div className="topic-results">
                      <span className="score-badge">
                        Score: {scoreData.score}/{scoreData.total}
                      </span>
                      <div className="topic-actions">
                        <button className="btn-primary outline" onClick={() => startQuiz(topic.id)}>
                          Retake
                        </button>
                        <button className="btn-secondary" onClick={() => viewCertificate(topic.id)}>
                          Certificate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-primary" onClick={() => startQuiz(topic.id)}>
                      Start Quiz
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="performance-report">
          <h3>Final Performance Report</h3>
          {Object.keys(scores).length === 0 ? (
            <div className="empty-state">
              <p>You haven't taken any quizzes yet. Start a topic above!</p>
            </div>
          ) : (
            <div className="report-list">
              {Object.keys(scores).map(topicId => {
                const topic = TOPICS.find(t => t.id === topicId);
                const scoreData = scores[topicId];
                const percentage = (scoreData.score / scoreData.total) * 100;
                
                return (
                  <div key={topicId} className="report-item">
                    <div className="report-info">
                      <span className="report-title">{topic?.title}</span>
                      <span className="report-date">{new Date(scoreData.date).toLocaleDateString()}</span>
                    </div>
                    <div className="report-score-bar">
                      <div className="progress-bar-bg">
                        <div 
                          className={`progress-bar-fill ${percentage >= 80 ? 'good' : percentage >= 50 ? 'average' : 'poor'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="report-text">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
