# File: backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from typing import List
import pdfplumber
import io
import json
from docx import Document 
from nlp_processor import extract_skills 
from ai_suggester import generate_suggestions, client 

# Middleware: Protects server from large files (5MB Limit)
class LimitUploadSize(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int):
        super().__init__(app)
        self.max_upload_size = max_upload_size

    async def dispatch(self, request, call_next):
        if request.method == "POST":
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_upload_size:
                return Response(content="File too large (Max 5MB allowed)", status_code=413)
        return await call_next(request)

app = FastAPI(title="Smart Resume Filter API", version="1.5.0")

# --- CORS Middleware ---
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(LimitUploadSize, max_upload_size=5_242_880)

# --- Helpers ---
async def extract_text_from_file(file: UploadFile) -> str:
    """Extracts text from PDF or DOCX."""
    content = await file.read()
    file_stream = io.BytesIO(content)
    filename = file.filename.lower()
    text = ""
    try:
        if filename.endswith(".pdf"):
            with pdfplumber.open(file_stream) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text: text += page_text + "\n"
        elif filename.endswith(".docx"):
            doc = Document(file_stream)
            text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        raise ValueError(f"Parsing error: {str(e)}")

def calculate_score(cv_text: str, jd_text: str) -> dict:
    required = extract_skills(jd_text)
    cv_skills = extract_skills(cv_text)
    matched = required.intersection(cv_skills)
    missing = required - cv_skills
    score = round((len(matched) / len(required)) * 100) if required else 0
    return {"score": score, "matched_skills": sorted(list(matched)), "missing_skills": sorted(list(missing))}

# --- Endpoints ---

@app.post("/rank-resumes/")
async def rank_resumes_endpoint(cvs: List[UploadFile] = File(...), jd_text: str = Form(...)):
    results = []
    for cv in cvs:
        try:
            txt = await extract_text_from_file(cv)
            results.append({
                "filename": cv.filename, 
                "score_analysis": calculate_score(txt, jd_text),
                "cv_full_text": txt # Passed to frontend for Assistant context
            })
        except Exception as e:
            results.append({"filename": cv.filename, "error": str(e)})
    valid = [r for r in results if 'error' not in r]
    return sorted(valid, key=lambda x: x['score_analysis']['score'], reverse=True) + [r for r in results if 'error' in r]

@app.post("/analyze-single-cv/")
async def analyze_single_cv_endpoint(cv: UploadFile = File(...), jd_text: str = Form(...)):
    try:
        txt = await extract_text_from_file(cv)
        analysis = calculate_score(txt, jd_text)
        analysis['suggestions'] = generate_suggestions(jd_text, analysis['missing_skills']) if analysis['missing_skills'] else "Perfect match!"
        # Returning full text here as well for potential Job Seeker Assistant features
        return {"filename": cv.filename, "score_analysis": analysis, "cv_full_text": txt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-assistant/")
async def ask_assistant_endpoint(question: str = Form(...), cv_text: str = Form(...), candidate: str = Form(...)):
    """Contextual AI HR Assistant."""
    try:
        prompt = f"CV Content for {candidate}:\n{cv_text}\n\nQuestion: {question}\nAnswer briefly and professionally based strictly on the text."
        completion = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=[{"role": "user", "content": prompt}])
        return {"answer": completion.choices[0].message.content.strip()}
    except Exception:
        return {"answer": "AI service busy. Please try again."}


