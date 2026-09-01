from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Student, AssessmentQuestion, Skill, AssessmentResult
from app.schemas.schemas import AssessmentSubmit
from app.services.assessment_service import assessment_service

router = APIRouter(prefix="/assessments", tags=["Skill Assessment Engine"])

@router.get("/questions/{skill_id}")
def get_assessment_questions(skill_id: int, db: Session = Depends(get_db)):
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.skill_id == skill_id).all()
    if not questions:
        # Generic questions fallback
        questions = db.query(AssessmentQuestion).limit(5).all()

    skill_obj = db.query(Skill).filter(Skill.id == skill_id).first()

    return {
        "skill_id": skill_id,
        "skill_name": skill_obj.name if skill_obj else "Technical Skill",
        "duration_minutes": 15,
        "total_questions": len(questions),
        "questions": [{
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options_json,
            "difficulty": q.difficulty,
            "category": q.category
        } for q in questions]
    }

@router.post("/submit")
def submit_assessment(data: AssessmentSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return assessment_service.submit_assessment(db, student, data.skill_id, data.answers)

@router.get("/history")
def get_assessment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    results = db.query(AssessmentResult).filter(AssessmentResult.student_id == student.id).order_by(AssessmentResult.completed_at.desc()).all()
    out = []
    for r in results:
        skill_obj = db.query(Skill).filter(Skill.id == r.skill_id).first()
        out.append({
            "id": r.id,
            "skill_name": skill_obj.name if skill_obj else "Skill",
            "score": r.score,
            "correct_answers": r.correct_answers,
            "total_questions": r.total_questions,
            "completed_at": r.completed_at
        })
    return out
