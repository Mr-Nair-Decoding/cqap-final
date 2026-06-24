import { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import './Certificate.css';

const TOPIC_NAMES = {
  'password_security': 'Password Security',
  'phishing': 'Phishing Awareness',
  'malware': 'Malware Protection',
  'network_security': 'Network Security',
  'safe_browsing': 'Safe Browsing'
};

const Certificate = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { user, getScores } = useContext(AuthContext);
  const [scoreData, setScoreData] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    const scores = getScores();
    if (scores[topic]) {
      setScoreData(scores[topic]);
    } else {
      navigate('/dashboard');
    }
  }, [topic, getScores, navigate]);

  const handleDownload = async () => {
    if (certificateRef.current) {
      try {
        const canvas = await html2canvas(certificateRef.current, { scale: 2 });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${user.username}_${topic}_Certificate.png`;
        link.click();
      } catch (error) {
        console.error('Failed to generate certificate', error);
      }
    }
  };

  if (!scoreData || !user) return <div className="loading">Loading...</div>;

  const issueDate = new Date(scoreData.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="certificate-page">
      <div className="certificate-actions">
        <button className="btn-link back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button className="btn-primary" onClick={handleDownload}>
          <Download size={18} /> Download Certificate
        </button>
      </div>

      <div className="certificate-wrapper">
        <div className="certificate-container" ref={certificateRef}>
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              
              <div className="cert-header">
                <ShieldCheck size={64} className="cert-logo" />
                <h1>Certificate of Completion</h1>
              </div>

              <div className="cert-body">
                <p className="cert-subtitle">This is to certify that</p>
                <h2 className="cert-name">{user.username}</h2>
                <p className="cert-text">
                  has successfully completed the cybersecurity training module on
                </p>
                <h3 className="cert-topic">{TOPIC_NAMES[topic] || topic}</h3>
                
                <p className="cert-score">
                  Achieving a score of <strong>{scoreData.score} / {scoreData.total}</strong>
                </p>
              </div>

              <div className="cert-footer">
                <div className="cert-signature">
                  <div className="signature-line">CQAP System</div>
                  <p>Authorized Signature</p>
                </div>
                <div className="cert-date">
                  <div className="signature-line">{issueDate}</div>
                  <p>Date</p>
                </div>
              </div>

              <div className="cert-seal">
                <div className="seal-inner">CQAP Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
