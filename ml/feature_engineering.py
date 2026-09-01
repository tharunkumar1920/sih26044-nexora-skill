import re
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer

class FeatureExtractor:
    def __init__(self):
        self.tfidf = TfidfVectorizer(stop_words='english', max_features=100)

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        return ' '.join(text.split())

    def build_student_profile_text(self, student_data: Dict[str, Any]) -> str:
        skills = " ".join([s.get("name", "") for s in student_data.get("skills", [])])
        projects = " ".join([p.get("title", "") + " " + p.get("description", "") for p in student_data.get("projects", [])])
        target_role = student_data.get("target_role", "")
        degree = student_data.get("degree", "")
        return f"{skills} {projects} {target_role} {degree}"

    def build_opportunity_profile_text(self, opportunity_data: Dict[str, Any]) -> str:
        title = opportunity_data.get("title", "")
        desc = opportunity_data.get("description", "")
        skills = " ".join([s.get("name", "") for s in opportunity_data.get("required_skills", [])])
        edu = opportunity_data.get("required_education", "")
        return f"{title} {desc} {skills} {edu}"

    def extract_skill_vector(self, all_known_skills: List[str], student_skills: Dict[str, float]) -> np.ndarray:
        vector = []
        for skill in all_known_skills:
            score = student_skills.get(skill.lower(), 0.0)
            vector.append(score / 100.0)
        return np.array(vector)
