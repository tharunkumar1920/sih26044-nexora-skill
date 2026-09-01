from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Faculty, CollaborationOpportunity

router = APIRouter(prefix="/faculty", tags=["Faculty Collaboration Hub"])

@router.get("/profile")
def get_faculty_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fac = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return {
        "id": fac.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "department": fac.department,
        "institution_name": fac.institution_name,
        "designation": fac.designation,
        "research_interests": fac.research_interests,
        "biography": fac.biography
    }

@router.get("/collaborations")
def list_collaboration_opportunities(type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CollaborationOpportunity).filter(CollaborationOpportunity.status == "open")
    if type:
        query = query.filter(CollaborationOpportunity.type == type)
    collabs = query.all()
    return [{
        "id": c.id,
        "title": c.title,
        "type": c.type,
        "posted_by_role": c.posted_by_role,
        "posted_by_name": c.posted_by_name,
        "organization": c.organization,
        "description": c.description,
        "area": c.area,
        "date_or_duration": c.date_or_duration,
        "status": c.status
    } for c in collabs]

@router.post("/collaborations")
def create_collaboration_opportunity(
    title: str,
    type: str, # FDP, Research, Consultancy, Workshop, Guest Lecture
    description: str,
    area: str,
    date_or_duration: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    collab = CollaborationOpportunity(
        title=title,
        type=type,
        posted_by_role=current_user.role,
        posted_by_name=current_user.full_name,
        organization="Academic / Ayush Partner",
        description=description,
        area=area,
        date_or_duration=date_or_duration
    )
    db.add(collab)
    db.commit()
    return {"message": "Collaboration opportunity posted successfully"}
