from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Student, User, Skill, StudentProject, Certification

router = APIRouter(prefix="/portfolio", tags=["Digital Student Portfolio"])

@router.get("/{student_id}")
def get_public_student_portfolio(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student portfolio not found")

    user = db.query(User).filter(User.id == student.user_id).first()

    if not student.is_public_portfolio:
        raise HTTPException(status_code=403, detail="This student portfolio is private")

    skills = []
    for s_skill in student.skills:
        skill_obj = db.query(Skill).filter(Skill.id == s_skill.skill_id).first()
        if skill_obj:
            skills.append({
                "name": skill_obj.name,
                "category": skill_obj.category_name,
                "proficiency_level": s_skill.proficiency_level,
                "assessment_score": s_skill.assessment_score,
                "verified": s_skill.verified
            })

    projects = [{
        "title": p.title,
        "description": p.description,
        "github_url": p.github_url,
        "live_url": p.live_url,
        "technologies": p.technologies_json or []
    } for p in student.projects]

    certs = [{
        "title": c.title,
        "issuer": c.issuer,
        "issue_date": c.issue_date,
        "credential_url": c.credential_url
    } for c in student.certifications]

    return {
        "full_name": user.full_name if user else "Student",
        "college_name": student.college_name,
        "department": student.department,
        "degree": student.degree,
        "graduation_year": student.graduation_year,
        "cgpa": student.cgpa,
        "bio": student.bio,
        "target_role": student.target_role,
        "readiness_score": student.readiness_score,
        "skills": skills,
        "projects": projects,
        "certifications": certs
    }
