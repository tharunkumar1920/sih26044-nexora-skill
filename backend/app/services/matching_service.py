from sqlalchemy.orm import Session
from app.models.models import Student, Opportunity, Skill
from ml.skill_matching import ExplainableSkillMatcher

class MatchingService:
    def __init__(self):
        self.matcher = ExplainableSkillMatcher()

    def get_opportunity_dict(self, db: Session, opp: Opportunity) -> dict:
        skills = []
        for req in opp.required_skills:
            skill_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if skill_obj:
                skills.append({
                    "id": skill_obj.id,
                    "name": skill_obj.name,
                    "min_proficiency": req.min_proficiency,
                    "is_required": req.is_required,
                    "weight": req.weight
                })
        return {
            "id": opp.id,
            "title": opp.title,
            "description": opp.description,
            "required_education": opp.required_education,
            "required_skills": skills
        }

    def get_student_dict(self, db: Session, student: Student) -> dict:
        skills = []
        for s_skill in student.skills:
            skill_obj = db.query(Skill).filter(Skill.id == s_skill.skill_id).first()
            if skill_obj:
                skills.append({
                    "id": skill_obj.id,
                    "name": skill_obj.name,
                    "category_name": skill_obj.category_name,
                    "proficiency_level": s_skill.proficiency_level,
                    "assessment_score": s_skill.assessment_score
                })
        projects = [{"title": p.title, "description": p.description} for p in student.projects]
        certs = [{"title": c.title} for c in student.certifications]

        return {
            "id": student.id,
            "target_role": student.target_role or "Data Analyst",
            "degree": student.degree,
            "cgpa": student.cgpa,
            "skills": skills,
            "projects": projects,
            "certifications": certs
        }

    def calculate_student_opportunity_match(self, db: Session, student: Student, opp: Opportunity) -> dict:
        s_dict = self.get_student_dict(db, student)
        o_dict = self.get_opportunity_dict(db, opp)
        return self.matcher.calculate_match(s_dict, o_dict)

matching_service = MatchingService()
