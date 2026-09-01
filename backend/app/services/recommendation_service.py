from sqlalchemy.orm import Session
from app.models.models import Student, Skill, Course
from ml.recommendation_engine import SkillRecommendationEngine

class RecommendationService:
    def __init__(self):
        self.engine = SkillRecommendationEngine()

    def get_skill_gaps_for_student(self, db: Session, student: Student) -> dict:
        student_skills = []
        seen_skills = set()
        for s_skill in student.skills:
            skill_obj = db.query(Skill).filter(Skill.id == s_skill.skill_id).first()
            if skill_obj and skill_obj.name.lower() not in seen_skills:
                seen_skills.add(skill_obj.name.lower())
                student_skills.append({
                    "name": skill_obj.name,
                    "proficiency_level": s_skill.proficiency_level
                })
        
        target_role = student.target_role or "Data Analyst"
        return self.engine.analyze_skill_gaps(student_skills, target_role)

    def get_recommended_courses(self, db: Session, student: Student) -> list:
        gaps_data = self.get_skill_gaps_for_student(db, student)
        gap_skills = [g["skill_name"].lower() for g in gaps_data.get("skill_gaps", [])]

        all_courses = db.query(Course).all()
        recommended = []
        seen_titles = set()

        for c in all_courses:
            if c.title.strip().lower() in seen_titles:
                continue
            
            skill_obj = db.query(Skill).filter(Skill.id == c.skill_id).first()
            s_name = skill_obj.name if skill_obj else ""
            if s_name.lower() in gap_skills or len(recommended) < 4:
                seen_titles.add(c.title.strip().lower())
                recommended.append({
                    "id": c.id,
                    "title": c.title,
                    "provider": c.provider,
                    "skill_name": s_name,
                    "target_level": c.target_level,
                    "url": c.url,
                    "duration_hours": c.duration_hours,
                    "rating": c.rating,
                    "reason": f"Recommended to bridge gap in {s_name}" if s_name.lower() in gap_skills else "Highly rated skill development course"
                })

        return recommended[:6]

    def get_recommended_careers(self, db: Session, student: Student) -> list:
        student_skills = []
        seen_skills = set()
        for s_skill in student.skills:
            skill_obj = db.query(Skill).filter(Skill.id == s_skill.skill_id).first()
            if skill_obj and skill_obj.name.lower() not in seen_skills:
                seen_skills.add(skill_obj.name.lower())
                student_skills.append({
                    "name": skill_obj.name,
                    "proficiency_level": s_skill.proficiency_level
                })
        return self.engine.recommend_career_roles(student_skills)

recommendation_service = RecommendationService()
