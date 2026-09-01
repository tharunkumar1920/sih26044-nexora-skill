from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Student, Opportunity, OpportunitySkill, Company, Application, Skill
from app.schemas.schemas import OpportunityCreate, OpportunityResponse, ApplicationCreate
from app.services.matching_service import matching_service

router = APIRouter(prefix="/opportunities", tags=["Industry Opportunities"])

@router.get("")
def list_opportunities(
    q: Optional[str] = None,
    type: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity).filter(Opportunity.status == "open")

    if q:
        query = query.filter(Opportunity.title.ilike(f"%{q}%") | Opportunity.description.ilike(f"%{q}%"))
    if type:
        query = query.filter(Opportunity.type == type)
    if work_mode:
        query = query.filter(Opportunity.work_mode == work_mode)
    if location:
        query = query.filter(Opportunity.location.ilike(f"%{location}%"))

    opps = query.all()
    results = []

    for opp in opps:
        comp = db.query(Company).filter(Company.id == opp.company_id).first()
        req_skills = []
        for req in opp.required_skills:
            s_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if s_obj:
                req_skills.append({
                    "id": s_obj.id,
                    "name": s_obj.name,
                    "min_proficiency": req.min_proficiency,
                    "is_required": req.is_required
                })

        # Check filter by skill
        if skill and not any(s["name"].lower() == skill.lower() for s in req_skills):
            continue

        results.append({
            "id": opp.id,
            "company_name": comp.name if comp else "Industry Partner",
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
            "required_skills": req_skills
        })

    return results

@router.get("/{opp_id}")
def get_opportunity_detail(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    comp = db.query(Company).filter(Company.id == opp.company_id).first()
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

    return {
        "id": opp.id,
        "company_name": comp.name if comp else "Industry Partner",
        "company_description": comp.description if comp else "",
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
        "required_skills": req_skills
    }

@router.post("")
def create_opportunity(data: OpportunityCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "recruiter":
        raise HTTPException(status_code=403, detail="Only recruiters can post opportunities")

    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Recruiter company profile not found")

    opp = Opportunity(
        company_id=company.id,
        title=data.title,
        type=data.type,
        description=data.description,
        required_education=data.required_education,
        experience_level=data.experience_level,
        location=data.location,
        work_mode=data.work_mode,
        duration=data.duration,
        stipend_or_salary=data.stipend_or_salary,
        deadline=data.deadline
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)

    for r_skill in data.required_skills:
        req_obj = OpportunitySkill(
            opportunity_id=opp.id,
            skill_id=r_skill.skill_id,
            min_proficiency=r_skill.min_proficiency,
            is_required=r_skill.is_required,
            weight=r_skill.weight
        )
        db.add(req_obj)

    db.commit()
    return {"message": "Opportunity created successfully", "opportunity_id": opp.id}

@router.post("/apply")
def apply_opportunity(data: ApplicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can apply for opportunities")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    existing = db.query(Application).filter(
        Application.student_id == student.id,
        Application.opportunity_id == data.opportunity_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this opportunity")

    opp = db.query(Opportunity).filter(Opportunity.id == data.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Calculate explainable match score
    match_res = matching_service.calculate_student_opportunity_match(db, student, opp)
    score = match_res["overall_match_score"]

    app = Application(
        student_id=student.id,
        opportunity_id=data.opportunity_id,
        status="applied",
        match_score=score
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    return {
        "message": "Application submitted successfully",
        "application_id": app.id,
        "match_score": score
    }
