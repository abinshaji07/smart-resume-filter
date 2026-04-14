import React, { useState } from 'react';
import axios from 'axios';
import RankedResults from '../components/RankedResults';


export default function RecruiterView() {
  const [cvFiles, setCvFiles] = useState([]);
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleFileChange = (event) => {
    setCvFiles(Array.from(event.target.files));
  };
 
  const handleJdChange = (event) => {
    setJdText(event.target.value);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cvFiles.length === 0 || !jdText) {
      setError("Please upload at least one CV and paste the Job Description.");
      return;
    }


    setIsLoading(true);
    setResult(null);
    setError(null);


    const formData = new FormData();
    cvFiles.forEach(file => {
      formData.append('cvs', file);
    });
    formData.append('jd_text', jdText);


    try {
      const response = await axios.post('http://127.0.0.1:8000/rank-resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <header>
        <h1>📄 Smart Resume Filter</h1>
        <p>Upload multiple CVs and a Job Description to rank candidates.</p>
      </header>
     
      <main>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="cv-upload">1. Upload Resumes (PDF or Word DOCX)</label>
            <input
              type="file"
              id="cv-upload"
              accept=".pdf, .docx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              required
              multiple
            />
            {cvFiles.length > 0 && <p className="file-count">{cvFiles.length} file(s) selected.</p>}
          </div>
          <div className="form-group">
            <label htmlFor="jd-textarea">2. Paste Job Description</label>
            <textarea
              id="jd-textarea"
              rows="10"
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={handleJdChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="analyze-button" disabled={isLoading}>
            {isLoading ? 'Ranking...' : `Rank ${cvFiles.length || ''} CV(s)`}
          </button>
        </form>


        {isLoading && <div className="loading">Analyzing resumes, please wait...</div>}
        {error && <div className="error">Error: {error}</div>}


        {/* --- CRITICAL UPDATE: Passing cvFiles prop --- */}
        {result && <RankedResults results={result} cvFiles={cvFiles} />}
      </main>
    </>
  );
}



