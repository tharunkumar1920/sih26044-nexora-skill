from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Student, Opportunity, Company, Skill
from app.services.recommendation_service import recommendation_service
from app.services.matching_service import matching_service
from app.services.ai_parser import parse_resume_text

router = APIRouter(prefix="/recommendations", tags=["Skill Intelligence & Recommendations"])

class JobRecommendationRequest(BaseModel):
    description: Optional[str] = None
    top_k: Optional[int] = 10

@router.get("/skill-gaps")
def get_skill_gaps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return recommendation_service.get_skill_gaps_for_student(db, student)

@router.get("/courses")
def get_recommended_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return recommendation_service.get_recommended_courses(db, student)

@router.get("/careers")
def get_recommended_careers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return recommendation_service.get_recommended_careers(db, student)

@router.get("/opportunities")
def get_recommended_opportunities(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opps = db.query(Opportunity).filter(Opportunity.status == "open").all()
    results = []
    seen_ids = set()

    for opp in opps:
        if opp.id in seen_ids:
            continue
        seen_ids.add(opp.id)

        comp = db.query(Company).filter(Company.id == opp.company_id).first()
        match_info = matching_service.calculate_student_opportunity_match(db, student, opp)

        req_skills = []
        seen_skill_names = set()
        for req in opp.required_skills:
            s_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if s_obj and s_obj.name.lower() not in seen_skill_names:
                seen_skill_names.add(s_obj.name.lower())
                req_skills.append({
                    "id": s_obj.id,
                    "name": s_obj.name,
                    "min_proficiency": req.min_proficiency,
                    "is_required": req.is_required
                })

        results.append({
            "id": opp.id,
            "company_name": comp.name if comp else "Industry Partner",
            "title": opp.title,
            "type": opp.type,
            "description": opp.description,
            "location": opp.location,
            "work_mode": opp.work_mode,
            "stipend_or_salary": opp.stipend_or_salary,
            "duration": opp.duration,
            "match_score": round(match_info.get("overall_match_score", 0), 1),
            "match_breakdown": match_info,
            "matched_skills": list(dict.fromkeys(match_info.get("matched_skills", []))),
            "missing_skills": list(dict.fromkeys(match_info.get("missing_skills", []))),
            "required_skills": req_skills
        })

    # Sort opportunities by highest match score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

@router.post("/match-jobs")
def match_jobs_dedicated_api(
    body: Optional[JobRecommendationRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dedicated ML job recommendation API:
    Ranks opportunities with explainable multi-factor scoring after resume or description upload.
    Deduplicates results strictly and returns the top matches.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opps = db.query(Opportunity).filter(Opportunity.status == "open").all()
    results = []
    seen_ids = set()

    for opp in opps:
        if opp.id in seen_ids:
            continue
        seen_ids.add(opp.id)

        comp = db.query(Company).filter(Company.id == opp.company_id).first()
        match_info = matching_service.calculate_student_opportunity_match(db, student, opp)

        req_skills = []
        seen_skill_names = set()
        for req in opp.required_skills:
            s_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if s_obj and s_obj.name.lower() not in seen_skill_names:
                seen_skill_names.add(s_obj.name.lower())
                req_skills.append({
                    "id": s_obj.id,
                    "name": s_obj.name,
                    "min_proficiency": req.min_proficiency,
                    "is_required": req.is_required
                })

        results.append({
            "id": opp.id,
            "company_name": comp.name if comp else "Industry Partner",
            "title": opp.title,
            "type": opp.type,
            "description": opp.description,
            "location": opp.location,
            "work_mode": opp.work_mode,
            "stipend_or_salary": opp.stipend_or_salary,
            "duration": opp.duration,
            "match_score": round(match_info.get("overall_match_score", 0), 1),
            "matched_skills": list(dict.fromkeys(match_info.get("matched_skills", []))),
            "missing_skills": list(dict.fromkeys(match_info.get("missing_skills", []))),
            "recommended_action": match_info.get("recommended_action", ""),
            "match_breakdown": match_info,
            "required_skills": req_skills
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    limit = body.top_k if body and body.top_k else 10

    return {
        "target_role": student.target_role or "General Profile",
        "readiness_score": round(student.readiness_score or 0, 1),
        "total_matched": len(results),
        "recommended_opportunities": results[:limit]
    }

@router.get("/match-explain/{opp_id}")
def get_match_explanation(opp_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    return matching_service.calculate_student_opportunity_match(db, student, opp)
