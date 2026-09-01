import pytest
from ml.skill_matching import ExplainableSkillMatcher

def test_explainable_skill_matcher():
    matcher = ExplainableSkillMatcher()

    student_data = {
        "target_role": "Data Analyst",
        "skills": [
            {"name": "Python", "proficiency_level": 85.0, "assessment_score": 82.0, "category_name": "Technical"},
            {"name": "SQL", "proficiency_level": 54.0, "assessment_score": 50.0, "category_name": "Technical"},
            {"name": "Communication", "proficiency_level": 80.0, "assessment_score": 76.0, "category_name": "Soft Skill"}
        ],
        "projects": [{"title": "Health Dashboard", "description": "Analytics app"}],
        "certifications": [{"title": "NPTEL Data Analytics"}]
    }

    opportunity_data = {
        "title": "Data Analyst Internship",
        "required_skills": [
            {"name": "Python", "min_proficiency": 75.0, "is_required": True, "weight": 1.0},
            {"name": "SQL", "min_proficiency": 80.0, "is_required": True, "weight": 1.4},
            {"name": "Git", "min_proficiency": 50.0, "is_required": True, "weight": 1.0}
        ]
    }

    res = matcher.calculate_match(student_data, opportunity_data)

    assert "overall_match_score" in res
    assert res["overall_match_score"] > 0
    assert "Python" in res["matched_skills"]
    assert "Git" in res["missing_skills"]
    assert len(res["score_breakdown"]) == 6
