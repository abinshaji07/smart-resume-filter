// File: frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import RecruiterView from './pages/RecruiterView';
import JobSeekerView from './pages/JobSeekerView';

// A simple component for our homepage
function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to the Smart Resume Filter & Career Recommendation System</h1>
      <p>Please select your role to begin:</p>
      <div className="role-selection">
        <Link to="/recruiter" className="role-button">I'm a Recruiter</Link>
        <Link to="/job-seeker" className="role-button">I'm a Job Seeker</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recruiter" element={<RecruiterView />} />
        <Route path="/job-seeker" element={<JobSeekerView />} />
      </Routes>
    </div>
  );
}

export default App;


