import React, { useState } from 'react';
import axios from 'axios';
import Results from '../components/Results';

export default function JobSeekerView() {
  const [cvFile, setCvFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    // Stores the original file object for local viewing
    setCvFile(event.target.files[0]);
  };
 
  const handleJdChange = (event) => {
    setJdText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cvFile || !jdText) {
      setError("Please upload your CV and paste the Job Description.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    // Key 'cv' must match the backend's expected variable name
    formData.append('cv', cvFile);
    formData.append('jd_text', jdText);

    try {
      // Use the full URL with the trailing slash to avoid 404 errors
      const response = await axios.post('http://127.0.0.1:8000/analyze-single-cv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      // Handles 404, 500, or network errors
      setError(err.response?.data?.detail || "The analysis service is currently unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header>
        <h1>🤖 AI CV Optimizer</h1>
        <p>Get a match score and personalized feedback to improve your resume.</p>
      </header>
     
      <main>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="cv-upload">1. Upload Your CV (PDF or Word DOCX)</label>
            <input
              type="file"
              id="cv-upload"
              accept=".pdf, .docx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="jd-textarea">2. Paste Target Job Description</label>
            <textarea
              id="jd-textarea"
              rows="10"
              placeholder="Paste the job description you're applying for..."
              value={jdText}
              onChange={handleJdChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="analyze-button" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Analyze My CV'}
          </button>
        </form>

        {isLoading && <div className="loading">Analyzing your CV, please wait...</div>}
        
        {/* Error display for 404 or connection issues */}
        {error && (
          <div className="error" style={{ color: '#ff4444', padding: '15px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginTop: '20px' }}>
            {error}
          </div>
        )}
        
        {/* Pass cvFile to Results to enable the "View CV" icon feature */}
        {result && <Results result={result} cvFile={cvFile} />}
      </main>
    </>
  );
}


