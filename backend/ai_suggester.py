
import os
import traceback
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Initialize the Groq Client
client = Groq(api_key=GROQ_API_KEY)

def generate_suggestions(jd_text: str, missing_skills: list) -> str:
    """Generates CV improvement suggestions using Groq's Llama 3 models."""
    
    print("\n--- DEBUG: USING GROQ INFERENCE ---")

    if not GROQ_API_KEY:
        return "Error: GROQ_API_KEY is missing in your .env file."
    
    if not missing_skills:
        return "Your CV is a perfect match! Great job."

    try:
        # Groq uses the standard chat completion format
        completion = client.chat.completions.create(
            # Using the fast and smart Llama 3.3 70B model
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career coach. Provide 3-4 concise, actionable CV suggestions."
                },
                {
                    "role": "user",
                    "content": f"Missing skills: {', '.join(missing_skills)}. JD Context: '{jd_text[:800]}'. Give professional advice."
                }
            ],
            temperature=0.7,
            max_tokens=400
        )
        
        # Extract the content from the response
        return completion.choices[0].message.content.strip()

    except Exception as e:
        print("--- GROQ API ERROR ---")
        traceback.print_exc()
        return f"Groq Error: {str(e)}"
