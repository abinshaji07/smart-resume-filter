import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';

// 1. Register all necessary ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, RadialLinearScale,
  PointElement, LineElement, Filler, Title, Tooltip, Legend, ArcElement
);

// --- Sub-Component: HR Assistant Chat Box ---
// Updated to use full CV context for accurate persona-based answers
function HRAssistant({ cvFilename, cvFullText }) {
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
      
      // CRITICAL: We now send the full CV text to the backend
      formData.append('cv_text', cvFullText);
     
      const res = await axios.post('http://127.0.0.1:8000/ask-assistant/', formData);
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("AI Assistant is currently unavailable. Check backend connection.");
    }
    setLoading(false);
  };

  return (
    <div className="hr-chat-box" style={{ marginTop: '10px', padding: '10px', background: '#252525', borderRadius: '5px', border: '1px solid #444' }}>
      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          type="text"
          placeholder={`Ask about ${cvFilename}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '5px', background: '#333', border: '1px solid #555', color: 'white', fontSize: '0.8rem', outline: 'none' }}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '3px' }}
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>
      {answer && (
        <div style={{ marginTop: '10px', borderTop: '1px solid #444', paddingTop: '8px' }}>
          <p style={{ fontSize: '0.75rem', color: '#4caf50', lineHeight: '1.4', margin: 0 }}>
            <strong>AI Response:</strong> {answer}
          </p>
        </div>
      )}
    </div>
  );
}

function RankedResults({ results, cvFiles = [] }) {
  const validResults = results.filter(r => !r.error);

  const handleViewCV = (filename) => {
    const file = cvFiles.find(f => f.name === filename);
    if (file) {
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } else {
      alert("Local file reference lost. Please re-upload.");
    }
  };

  const avgScore = validResults.length
    ? Math.round(validResults.reduce((acc, curr) => acc + curr.score_analysis.score, 0) / validResults.length)
    : 0;
  const topMatch = validResults[0]?.score_analysis.score || 0;

  const barData = {
    labels: validResults.map(r => r.filename.split('.')[0]),
    datasets: [{
      label: 'Match Score %',
      data: validResults.map(r => r.score_analysis.score),
      backgroundColor: '#4caf50',
      borderRadius: 5,
    }]
  };

  return (
    <section className="results-container">
      {/* Batch Statistics Header */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Average Match</h4>
          <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#4caf50' }}>{avgScore}%</span>
        </div>
        <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Top Match</h4>
          <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#4caf50' }}>{topMatch}%</span>
        </div>
        <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h4 style={{ color: '#888', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Resumes</h4>
          <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#2196f3' }}>{results.length}</span>
        </div>
      </div>

      <div className="chart-section" style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #333' }}>
        <h3 style={{ color: '#fff', marginBottom: '15px' }}>Leaderboard Comparison</h3>
        <div style={{ height: '250px' }}>
          <Bar data={barData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="results-table">
        <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.2fr 1fr 1fr', gap: '15px', padding: '10px', borderBottom: '2px solid #444', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          <div>Rank</div>
          <div>Candidate & AI Assistant</div>
          <div style={{ textAlign: 'center' }}>Skill Map</div>
          <div style={{ textAlign: 'center' }}>Score</div>
          <div>Top Skills</div>
        </div>
       
        <div className="table-body">
          {results.map((item, index) => (
            <div key={item.filename || index} className="table-row" style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 1.2fr 1fr 1fr', alignItems: 'start', padding: '25px 10px', borderBottom: '1px solid #333', gap: '15px' }}>
              {item.error ? (
                <div className="error-row" style={{ gridColumn: 'span 5', color: '#ff4444', padding: '10px', background: 'rgba(255,68,68,0.1)', borderRadius: '5px' }}>
                  <strong>{item.filename}</strong> — Error: {item.error}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`rank-badge rank-${index + 1}`} style={{ background: index === 0 ? '#ffd700' : '#444', color: index === 0 ? '#000' : '#fff', padding: '5px 10px', borderRadius: '50%', fontWeight: 'bold' }}>
                      {index + 1}
                    </span>
                  </div>
                 
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.filename}</div>
                      <button onClick={() => handleViewCV(item.filename)} title="View original file" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}>📄</button>
                    </div>
                    {/* UPDATED: We now pass cv_full_text to the HRAssistant */}
                    <HRAssistant cvFilename={item.filename} cvFullText={item.cv_full_text} />
                  </div>
                 
                  <div style={{ width: '140px', height: '140px', justifySelf: 'center' }}>
                    <Radar
                      data={{
                        labels: [...item.score_analysis.matched_skills, ...item.score_analysis.missing_skills].slice(0, 6),
                        datasets: [{
                          label: 'Skills',
                          data: [...item.score_analysis.matched_skills.map(()=>100), ...item.score_analysis.missing_skills.map(()=>25)].slice(0, 6),
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          borderColor: '#4caf50',
                          borderWidth: 2,
                          pointRadius: 0
                        }]
                      }}
                      options={{
                        scales: { r: { ticks: { display: false }, grid: { color: '#444' }, angleLines: { color: '#444' }, pointLabels: { color: '#aaa', font: { size: 9 } }, min: 0, max: 100 } },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center' }}>
                    <div style={{ width: '50px', height: '50px', marginBottom: '10px' }}>
                      <Doughnut
                        data={{
                          datasets: [{
                            data: [item.score_analysis.score, 100 - item.score_analysis.score],
                            backgroundColor: [item.score_analysis.score > 70 ? '#4caf50' : '#ff9800', '#333'],
                            borderWidth: 0,
                          }]
                        }}
                        options={{ cutout: '75%', plugins: { tooltip: { enabled: false } } }}
                      />
                    </div>
                    <span className="score-value" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: item.score_analysis.score > 70 ? '#4caf50' : '#ff9800' }}>
                      {item.score_analysis.score}%
                    </span>
                  </div>

                  <div className="skill-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {item.score_analysis.matched_skills.slice(0, 4).map(skill => (
                      <span key={skill} className="skill-tag" style={{ fontSize: '0.65rem', background: '#2e7d32', color: 'white', padding: '3px 8px', borderRadius: '12px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RankedResults;


