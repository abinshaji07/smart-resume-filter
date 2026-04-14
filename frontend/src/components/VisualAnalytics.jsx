import React from 'react';
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
import { Radar, Doughnut } from 'react-chartjs-2';


ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);


export default function VisualAnalytics({ analysis }) {
  // 1. Radar Chart Data: Shows the "Skill Shape"
  const radarData = {
    labels: [...analysis.matched_skills, ...analysis.missing_skills].slice(0, 8), // Limit to 8 for clarity
    datasets: [{
      label: 'Candidate Competency',
      data: [
        ...analysis.matched_skills.map(() => 100), 
        ...analysis.missing_skills.map(() => 20)
      ].slice(0, 8),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
    }]
  };


  // 2. Donut Chart Data: Shows the Overall Score
  const donutData = {
    labels: ['Match', 'Gap'],
    datasets: [{
      data: [analysis.score, 100 - analysis.score],
      backgroundColor: ['#4caf50', '#e0e0e0'],
      hoverBackgroundColor: ['#45a049', '#bdbdbd'],
      borderWidth: 0,
    }]
  };


  return (
    <div className="visuals-grid" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      <div style={{ width: '300px' }}>
        <h4>Match Score</h4>
        <Doughnut data={donutData} options={{ cutout: '70%' }} />
        <p style={{ textAlign: 'center', marginTop: '-60px', fontWeight: 'bold' }}>{analysis.score}%</p>
      </div>
      
      <div style={{ width: '400px' }}>
        <h4>Skill Gap Analysis</h4>
        <Radar data={radarData} />
      </div>
    </div>
  );
}



