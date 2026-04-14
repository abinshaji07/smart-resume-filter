import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// 1. Register ChartJS components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement);

// --- Sub-Component: Seeker AI Assistant ---
function SeekerAssistant({ cvFilename, cvFullText }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    setAnswer("");
    try {
      const formData = new FormData();
      formData.append('candidate', cvFilename);
      formData.append('question', query);
      formData.append('cv_text', cvFullText); // Passes full context for precise feedback
     
      const res = await axios.post('http://127.0.0.1:8000/ask-assistant/', formData);
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("AI Assistant unavailable. Check your connection.");
    }
    setLoading(false);
  };

  return (
    <div className="seeker-ai-box" style={{ marginTop: '20px', padding: '15px', background: '#1e1e1e', borderRadius: '10px', border: '1px solid #333' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>💬 Ask AI about your Analysis</h4>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="e.g., How can I improve my Python description?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '10px', background: '#252525', border: '1px solid #444', color: 'white', borderRadius: '5px' }}
        />
        <button 
          onClick={handleAsk} 
          disabled={loading}
          style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>
      {answer && (
        <div style={{ marginTop: '12px', padding: '10px', background: '#252525', borderRadius: '5px', borderLeft: '3px solid #4caf50' }}>
          <p style={{ fontSize: '0.9rem', color: '#eee', margin: 0, lineHeight: '1.4' }}>{answer}</p>
        </div>
      )}
    </div>
  );
}

const SkillList = ({ title, skills, color }) => (
  <div className="skill-category" style={{ flex: 1, minWidth: '200px' }}>
    <h3 style={{ color: color, fontSize: '1rem', borderBottom: `1px solid ${color}`, paddingBottom: '5px' }}>{title} ({skills.length})</h3>
    {skills.length > 0 ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
        {skills.map(skill => (
          <span key={skill} style={{ padding: '4px 10px', background: '#333', borderRadius: '15px', fontSize: '0.8rem' }}>{skill}</span>
        ))}
      </div>
    ) : <p style={{ color: '#666' }}>None identified</p>}
  </div>
);

function Results({ result, cvFile }) {
  // Destructure including cv_full_text provided by the updated backend
  const { score_analysis, cv_full_text, filename } = result;
  const { score, matched_skills, missing_skills, suggestions } = score_analysis;
  
  const scoreColor = score >= 75 ? '#4caf50' : score >= 50 ? '#ff9800' : '#f44336';

  const handleViewOriginal = () => {
    if (cvFile) {
      window.open(URL.createObjectURL(cvFile), '_blank');
    }
  };

  const radarData = {
    labels: [...matched_skills, ...missing_skills].slice(0, 8),
    datasets: [{
      label: 'Your Match',
      data: [...matched_skills.map(() => 100), ...missing_skills.map(() => 25)].slice(0, 8),
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      borderColor: '#4caf50',
      borderWidth: 2,
      pointRadius: 4,
    }]
  };

  return (
    <section className="results-container" style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease-in' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>Analysis for {filename}</h2>
        <button onClick={handleViewOriginal} title="View Uploaded CV" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem' }}>📄</button>
      </div>
     
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {/* Match Score Donut */}
        <div className="score-circle" style={{ 
          width: '180px', height: '180px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `radial-gradient(closest-side, #242424 82%, transparent 83% 100%), conic-gradient(${scoreColor} ${score}%, #333 ${score}%)` 
        }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: scoreColor }}>{score}%</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Match Score</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{ flex: 1, minWidth: '300px', height: '300px', background: '#1e1e1e', padding: '15px', borderRadius: '12px' }}>
          <Radar 
            data={radarData}
            options={{
              scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#333' }, pointLabels: { color: '#aaa', font: { size: 11 } } } },
              plugins: { legend: { display: false } }
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <SkillList title="✅ Matched Skills" skills={matched_skills} color="#4caf50" />
        <SkillList title="❌ Missing Skills" skills={missing_skills} color="#f44336" />
      </div>

      {/* NEW: Seeker-focused AI Assistant */}
      <SeekerAssistant cvFilename={filename} cvFullText={cv_full_text} />

      {suggestions && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#ffd700', fontSize: '1.1rem' }}>✨ personalized Improvement Roadmap</h3>
          <div style={{ background: 'linear-gradient(145deg, #1e1e1e, #181818)', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ffd700', marginTop: '10px' }}>
            {suggestions.split('\n').map((line, index) =>
              line.trim() && <p key={index} style={{ marginBottom: '12px', lineHeight: '1.6', color: '#ddd', fontSize: '0.95rem' }}>{line}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Results;


