import pytest
from app.services.ai_parser import parse_resume_text, _extract_skills

def test_ai_resume_parser_skills_and_deduplication():
    resume_text = """
    Aarav Sharma
    B.Tech in Computer Science, CGPA: 8.5 / 10
    Aspiring Software Developer with expertise in React, Node, Python, SQL, Docker, and AWS.
    Also have experience in React, Python, and SQL for building data dashboards.
    Strong communication and problem solving skills.
    """
    parsed = parse_resume_text(resume_text)
    
    assert parsed["degree"] == "B.Tech"
    assert parsed["cgpa"] == 8.5
    assert parsed["target_role"] in ["Software Developer", "Data Analyst", "Web Developer"]
    
    skill_names = [s["name"].lower() for s in parsed["skills"]]
    # Verify deduplication
    assert len(skill_names) == len(set(skill_names)), "Skills must be strictly deduplicated"
    assert "python" in skill_names
    assert "react" in skill_names
    assert "sql" in skill_names
    assert "docker" in skill_names

def test_extract_skills_boundary_and_case():
    text = "Proficient in Python, C++, SQL, Docker, and Machine Learning. Learning React."
    skills = _extract_skills(text)
    names = [s["name"] for s in skills]
    assert "Python" in names
    assert "C++" in names
    assert "SQL" in names
    assert "Docker" in names
    assert "Machine Learning" in names
    assert "React" in names
