# File: backend/nlp_processor.py

import spacy
from spacy.pipeline import EntityRuler

# Load the medium-sized English model from spaCy
nlp = spacy.load("en_core_web_md")

# Create a new EntityRuler
ruler = nlp.add_pipe("entity_ruler", before="ner")

# This is our "database" of skills.
# We create a pattern for each skill so spaCy can recognize it.
SKILLS_LIST = [
    "python", "java", "c++", "javascript", "react", "vue", "angular", "node.js",
    "sql", "postgresql", "mongodb", "aws", "azure", "google cloud", "docker",
    "kubernetes", "git", "jira", "machine learning", "data analysis", "tableau",
    "power bi", "project management", "agile", "scrum", "fastapi", "flask",
    "html", "css", "typescript", "pytorch", "tensorflow"
]

# Create patterns for the EntityRuler
patterns = [{"label": "SKILL", "pattern": skill} for skill in SKILLS_LIST]
ruler.add_patterns(patterns)

def extract_skills(text: str) -> set:
    """
    Uses the spaCy pipeline to extract skills from a given text.
    Returns a set of unique skills found.
    """
    # Process the text with the nlp pipeline
    doc = nlp(text.lower())
    
    # Extract entities that are labeled as "SKILL"
    skills = {ent.text for ent in doc.ents if ent.label_ == "SKILL"}
    
    return skills


