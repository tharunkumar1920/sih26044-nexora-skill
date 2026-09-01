import re
import io
import zipfile
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

def extract_text_from_file_bytes(content: bytes, filename: str) -> str:
    """
    Extract readable plain text from uploaded files (PDF, DOCX, TXT, MD, RTF).
    """
    fn = filename.lower()

    # 1. Plain text / MD / CSV / RTF
    if fn.endswith(('.txt', '.md', '.rtf', '.csv', '.json', '.html')):
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                return content.decode(encoding)
            except UnicodeDecodeError:
                continue
        return content.decode('utf-8', errors='ignore')

    # 2. DOCX (OpenXML zip container)
    if fn.endswith('.docx'):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                xml_content = z.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                text_parts = [node.text for node in tree.iter() if node.text]
                extracted = " ".join(text_parts).strip()
                if len(extracted) > 20:
                    return extracted
        except Exception:
            pass

    # 3. PDF Files
    if fn.endswith('.pdf'):
        try:
            raw_str = content.decode('latin-1', errors='ignore')
            # Extract plain text sequences in PDF literal strings
            text_chunks = re.findall(r'\(([^()]{3,})\)', raw_str)
            if text_chunks and len(" ".join(text_chunks)) > 50:
                return " ".join(text_chunks)

            # Cleaned alphanumeric stream fallback
            cleaned = re.sub(r'[^a-zA-Z0-9\s.,;:\(\)\-\'\"/@\n+]', ' ', raw_str)
            tokens = [word for word in cleaned.split() if len(word) >= 2]
            if len(tokens) > 20:
                return " ".join(tokens)
        except Exception:
            pass

    # Generic fallback
    return content.decode('utf-8', errors='ignore')


# ─── Skill keyword taxonomy ────────────────────────────────────────────────────
SKILL_KEYWORDS: Dict[str, str] = {
    # Programming
    "python": "Technical", "java": "Technical", "javascript": "Technical",
    "typescript": "Technical", "c++": "Technical", "c#": "Technical",
    "go": "Technical", "rust": "Technical", "kotlin": "Technical",
    "swift": "Technical", "php": "Technical", "ruby": "Technical",
    # Web
    "react": "Technical", "angular": "Technical", "vue": "Technical",
    "node": "Technical", "django": "Technical", "fastapi": "Technical",
    "flask": "Technical", "html": "Technical", "css": "Technical",
    # Data / AI
    "sql": "Technical", "mysql": "Technical", "postgresql": "Technical",
    "mongodb": "Technical", "pandas": "Technical", "numpy": "Technical",
    "scikit-learn": "Technical", "sklearn": "Technical",
    "tensorflow": "Technical", "pytorch": "Technical", "keras": "Technical",
    "machine learning": "Technical", "deep learning": "Technical",
    "nlp": "Technical", "computer vision": "Technical",
    "data analysis": "Technical", "data science": "Technical",
    "power bi": "Technical", "tableau": "Technical", "excel": "Technical",
    # Cloud / DevOps
    "aws": "Technical", "azure": "Technical", "gcp": "Technical",
    "docker": "Technical", "kubernetes": "Technical", "git": "Technical",
    "ci/cd": "Technical", "linux": "Technical",
    # Ayush / Domain
    "ayurveda": "Ayush/Domain", "yoga": "Ayush/Domain",
    "unani": "Ayush/Domain", "siddha": "Ayush/Domain",
    "naturopathy": "Ayush/Domain", "homeopathy": "Ayush/Domain",
    "herbal": "Ayush/Domain", "medicinal plants": "Ayush/Domain",
    "clinical research": "Ayush/Domain", "pharmacognosy": "Ayush/Domain",
    # Soft
    "communication": "Soft Skill", "leadership": "Soft Skill",
    "teamwork": "Soft Skill", "problem solving": "Soft Skill",
    "critical thinking": "Soft Skill", "project management": "Soft Skill",
    "time management": "Soft Skill", "research": "Soft Skill",
}

# ─── Degree keywords ───────────────────────────────────────────────────────────
DEGREE_PATTERNS = [
    r"\b(b\.?tech|bachelor of technology)\b",
    r"\b(b\.?e\.?|bachelor of engineering)\b",
    r"\b(b\.?sc\.?|bachelor of science)\b",
    r"\b(b\.?ca|bachelor of computer applications)\b",
    r"\b(m\.?tech|master of technology)\b",
    r"\b(m\.?sc\.?|master of science)\b",
    r"\b(mba)\b",
    r"\b(phd|doctorate)\b",
    r"\b(diploma)\b",
    r"\b(b\.?ayush|b\.?ams|b\.?hms|b\.?uims|b\.?nms)\b",
    r"\b(m\.?ams|m\.?hms)\b",
]

DEGREE_LABELS = {
    "b.tech": "B.Tech", "bachelor of technology": "B.Tech",
    "b.e.": "B.E.", "bachelor of engineering": "B.E.",
    "b.sc.": "B.Sc.", "bachelor of science": "B.Sc.",
    "b.ca": "BCA", "bachelor of computer applications": "BCA",
    "m.tech": "M.Tech", "master of technology": "M.Tech",
    "m.sc.": "M.Sc.", "master of science": "M.Sc.",
    "mba": "MBA", "phd": "PhD", "doctorate": "PhD",
    "diploma": "Diploma",
    "b.ams": "B.A.M.S.", "b.hms": "B.H.M.S.",
    "b.uims": "B.U.I.M.S.", "b.nms": "B.N.M.S.", "b.ayush": "B.Ayush",
    "m.ams": "M.A.M.S.", "m.hms": "M.H.M.S.",
}

# ─── Target role inference ─────────────────────────────────────────────────────
ROLE_SIGNALS = {
    "Data Analyst": ["data analysis", "sql", "power bi", "tableau", "excel", "pandas", "data analyst"],
    "Data Scientist": ["machine learning", "deep learning", "sklearn", "tensorflow", "pytorch", "data science", "nlp", "data scientist"],
    "Software Developer": ["react", "node", "django", "fastapi", "flask", "java", "c++", "software developer", "full stack", "frontend", "backend"],
    "ML Engineer": ["mlops", "ci/cd", "docker", "kubernetes", "model deployment", "ml engineer", "machine learning engineer"],
    "Cloud Engineer": ["aws", "azure", "gcp", "cloud", "devops", "docker", "kubernetes"],
    "Ayush Researcher": ["ayurveda", "herbal", "clinical research", "pharmacognosy", "ayush", "yoga", "unani"],
    "Web Developer": ["html", "css", "javascript", "react", "angular", "vue", "web developer", "web development"],
}

# ─── CGPA extraction ───────────────────────────────────────────────────────────
CGPA_PATTERN = re.compile(
    r'(?:cgpa|gpa|score|grade)[^\d]{0,10}(\d+(?:\.\d+)?)\s*(?:\/\s*(?:10|4))?',
    re.IGNORECASE
)
CGPA_SLASH_PATTERN = re.compile(r'(\d+\.\d+)\s*/\s*10', re.IGNORECASE)

# ─── Year extraction ───────────────────────────────────────────────────────────
YEAR_PATTERN = re.compile(r'\b(202[4-9]|203[0-2])\b')

# ─── Department extraction ────────────────────────────────────────────────────
DEPT_KEYWORDS = {
    "computer science": "Computer Science",
    "cse": "Computer Science",
    "cs": "Computer Science",
    "information technology": "Information Technology",
    "it": "Information Technology",
    "electronics": "Electronics & Communication",
    "ece": "Electronics & Communication",
    "electrical": "Electrical Engineering",
    "mechanical": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "data science": "Data Science",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "ayurveda": "Ayurveda",
    "pharmacy": "Pharmacy",
    "biotechnology": "Biotechnology",
    "bioinformatics": "Bioinformatics",
}

# ─── Certification keywords ───────────────────────────────────────────────────
CERT_KEYWORDS = [
    "certified", "certification", "certificate", "aws certified", "google cloud",
    "microsoft azure", "coursera", "udemy", "nptel", "swayam",
    "data science certificate", "ml certificate", "python certificate",
]


def _extract_skills(text: str) -> List[Dict[str, Any]]:
    """Extract skills with estimated proficiency based on context cues."""
    text_lower = text.lower()
    found = []
    seen = set()

    for skill_kw, category in SKILL_KEYWORDS.items():
        if skill_kw in text_lower and skill_kw not in seen:
            seen.add(skill_kw)
            # Estimate proficiency based on context words near the skill
            proficiency = 60  # default moderate
            idx = text_lower.find(skill_kw)
            context = text_lower[max(0, idx-60):idx+80]
            if any(w in context for w in ["expert", "proficient", "advanced", "strong", "extensive"]):
                proficiency = 85
            elif any(w in context for w in ["intermediate", "working knowledge", "good"]):
                proficiency = 65
            elif any(w in context for w in ["basic", "beginner", "familiar", "exposure", "learning"]):
                proficiency = 35

            found.append({
                "name": skill_kw.title() if skill_kw not in ["nlp", "sql", "aws", "gcp", "html", "css", "css", "ci/cd"] else skill_kw.upper(),
                "category": category,
                "proficiency": proficiency,
            })

    return found


def _extract_degree(text: str) -> str:
    text_lower = text.lower()
    for pattern in DEGREE_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            raw = match.group(0).strip().lower()
            for key, label in DEGREE_LABELS.items():
                if key in raw:
                    return label
    return ""


def _extract_cgpa(text: str) -> float:
    m = CGPA_PATTERN.search(text)
    if m:
        val = float(m.group(1))
        if val <= 10:
            return round(val, 2)
    m = CGPA_SLASH_PATTERN.search(text)
    if m:
        val = float(m.group(1))
        if val <= 10:
            return round(val, 2)
    return 0.0


def _extract_graduation_year(text: str) -> int:
    matches = YEAR_PATTERN.findall(text)
    if matches:
        years = sorted([int(y) for y in matches], reverse=True)
        return years[0]
    return 0


def _extract_department(text: str) -> str:
    text_lower = text.lower()
    for kw, dept in DEPT_KEYWORDS.items():
        if kw in text_lower:
            return dept
    return ""


def _infer_target_role(text: str, skills: List[Dict]) -> str:
    text_lower = text.lower()
    skill_names = [s["name"].lower() for s in skills]
    scores: Dict[str, int] = {}
    for role, signals in ROLE_SIGNALS.items():
        score = 0
        for sig in signals:
            if sig in text_lower or sig in skill_names:
                score += 1
        scores[role] = score
    best = max(scores, key=lambda r: scores[r])
    return best if scores[best] > 0 else "Software Developer"


def _extract_bio(text: str) -> str:
    """Use the first 2 sentences as bio if not too long."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    bio = " ".join(sentences[:2])
    return bio[:300] if bio else ""


def _extract_certifications(text: str) -> List[str]:
    text_lower = text.lower()
    found = []
    lines = text.split('\n')
    for line in lines:
        ll = line.lower()
        if any(kw in ll for kw in CERT_KEYWORDS):
            clean = line.strip()
            if 10 < len(clean) < 120:
                found.append(clean)
    return found[:5]


def _extract_college(text: str) -> str:
    """Try to detect college/university name from text."""
    patterns = [
        r'(?:at|from|of|studying at|college[:\s]+|university[:\s]+|institute[:\s]+)([A-Z][A-Za-z\s&,\.]{5,60}?)(?:\.|,|\n|$)',
        r'([A-Z][A-Za-z\s&]*(?:University|Institute|College|Academy|IIT|NIT|AIIMS|BITS)[A-Za-z\s]*)',
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            college = m.group(1).strip()
            if 5 < len(college) < 80:
                return college
    return ""


def parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Main entry point: parse raw text and return structured profile data.
    Returns a dict ready to be applied to the Student model.
    """
    skills = _extract_skills(text)
    degree = _extract_degree(text)
    cgpa = _extract_cgpa(text)
    graduation_year = _extract_graduation_year(text)
    department = _extract_department(text)
    target_role = _infer_target_role(text, skills)
    bio = _extract_bio(text)
    certs = _extract_certifications(text)
    college = _extract_college(text)

    # Compute a readiness score based on profile completeness
    score = 0
    if skills:
        score += min(len(skills) * 5, 40)   # up to 40 pts for skills
    if cgpa > 0:
        score += min(cgpa * 4, 20)           # up to 20 pts for CGPA
    if degree:
        score += 10
    if department:
        score += 5
    if certs:
        score += min(len(certs) * 5, 15)    # up to 15 pts for certifications
    readiness_score = min(round(score, 1), 95.0)

    return {
        "skills": skills,
        "degree": degree,
        "cgpa": cgpa,
        "graduation_year": graduation_year,
        "department": department,
        "target_role": target_role,
        "bio": bio,
        "certifications": certs,
        "college_name": college,
        "readiness_score": readiness_score,
    }
