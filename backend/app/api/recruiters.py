from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Company, Opportunity, Application, Student, Skill
from app.schemas.schemas import ApplicationStatusUpdate
from app.services.matching_service import matching_service

router = APIRouter(prefix="/recruiter", tags=["Recruiter Intelligence Dashboard"])

@router.get("/company")
def get_company_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return {
        "id": company.id,
        "name": company.name,
        "industry_sector": company.industry_sector,
        "website": company.website,
        "description": company.description,
        "location": company.location,
        "logo_url": company.logo_url,
        "is_approved": company.is_approved
    }

@router.get("/opportunities")
def get_recruiter_opportunities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    opps = db.query(Opportunity).filter(Opportunity.company_id == company.id).all()
    results = []

    for opp in opps:
        app_count = db.query(Application).filter(Application.opportunity_id == opp.id).count()
        req_skills = []
        for req in opp.required_skills:
            s_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if s_obj:
                req_skills.append({
                    "id": s_obj.id,
                    "name": s_obj.name,
                    "min_proficiency": req.min_proficiency,
                    "is_required": req.is_required,
                    "weight": req.weight
                })

        results.append({
            "id": opp.id,
            "title": opp.title,
            "type": opp.type,
            "description": opp.description,
            "required_education": opp.required_education,
            "experience_level": opp.experience_level,
            "location": opp.location,
            "work_mode": opp.work_mode,
            "duration": opp.duration,
            "stipend_or_salary": opp.stipend_or_salary,
            "deadline": opp.deadline,
            "status": opp.status,
            "applications_count": app_count,
            "required_skills": req_skills
        })
    return results

@router.get("/matches/{opportunity_id}")
def get_best_matched_candidates(opportunity_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id, Opportunity.company_id == company.id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Get all students and calculate candidates rank
    students = db.query(Student).all()
    candidates = []

    for st in students:
        st_user = db.query(User).filter(User.id == st.user_id).first()
        match_info = matching_service.calculate_student_opportunity_match(db, st, opp)

        # Check existing application status if any
        app = db.query(Application).filter(Application.student_id == st.id, Application.opportunity_id == opp.id).first()
        app_status = app.status if app else "not_applied"

        candidates.append({
            "student_id": st.id,
            "application_id": app.id if app else None,
            "student_name": st_user.full_name if st_user else "Student Candidate",
            "college_name": st.college_name,
            "department": st.department,
            "cgpa": st.cgpa,
            "target_role": st.target_role,
            "readiness_score": st.readiness_score,
            "match_score": match_info["overall_match_score"],
            "application_status": app_status,
            "match_breakdown": match_info
        })

    # Sort candidates by match score
    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    return candidates

@router.put("/applications/{app_id}/status")
def update_application_status(app_id: int, data: ApplicationStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = data.status
    db.commit()
    return {"message": "Application status updated successfully", "status": app.status}
