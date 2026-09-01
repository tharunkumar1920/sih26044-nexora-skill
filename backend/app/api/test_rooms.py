import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import generate_room_code
from app.api.auth import get_current_user
from app.models.models import (
    User, Company, Student, TestRoom, TestRoomParticipant,
    AssessmentQuestion, Skill, UserRole
)
from app.schemas.schemas import TestRoomCreate, TestRoomSubmit

router = APIRouter(prefix="/test-rooms", tags=["Test Room — Mass Assessment"])


@router.post("/create")
def create_test_room(data: TestRoomCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recruiter creates a test room for mass student assessment."""
    if current_user.role != UserRole.RECRUITER.value:
        raise HTTPException(status_code=403, detail="Only recruiters can create test rooms")

    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    # Validate that skills exist
    for sid in data.skill_ids:
        skill = db.query(Skill).filter(Skill.id == sid).first()
        if not skill:
            raise HTTPException(status_code=400, detail=f"Skill with ID {sid} not found")

    # Generate unique room code
    room_code = generate_room_code()
    while db.query(TestRoom).filter(TestRoom.room_code == room_code).first():
        room_code = generate_room_code()

    room = TestRoom(
        room_code=room_code,
        title=data.title,
        description=data.description,
        created_by=current_user.id,
        company_id=company.id,
        skill_ids_json=data.skill_ids,
        num_questions=data.num_questions,
        duration_minutes=data.duration_minutes,
        status="open",
        expires_at=datetime.utcnow() + timedelta(hours=2)
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    skill_names = []
    for sid in data.skill_ids:
        s = db.query(Skill).filter(Skill.id == sid).first()
        if s:
            skill_names.append(s.name)

    return {
        "id": room.id,
        "room_code": room.room_code,
        "title": room.title,
        "description": room.description,
        "company_name": company.name,
        "recruiter_name": current_user.full_name,
        "skill_names": skill_names,
        "num_questions": room.num_questions,
        "duration_minutes": room.duration_minutes,
        "status": room.status,
        "participant_count": 0,
        "created_at": room.created_at,
        "expires_at": room.expires_at
    }


@router.get("/my-rooms")
def get_my_rooms(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recruiter gets all their test rooms."""
    if current_user.role != UserRole.RECRUITER.value:
        raise HTTPException(status_code=403, detail="Only recruiters can view their test rooms")

    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    rooms = db.query(TestRoom).filter(TestRoom.company_id == company.id).order_by(TestRoom.created_at.desc()).all()
    results = []
    for room in rooms:
        skill_names = []
        for sid in (room.skill_ids_json or []):
            s = db.query(Skill).filter(Skill.id == sid).first()
            if s:
                skill_names.append(s.name)

        participant_count = db.query(TestRoomParticipant).filter(TestRoomParticipant.room_id == room.id).count()

        results.append({
            "id": room.id,
            "room_code": room.room_code,
            "title": room.title,
            "description": room.description,
            "company_name": company.name,
            "recruiter_name": current_user.full_name,
            "skill_names": skill_names,
            "num_questions": room.num_questions,
            "duration_minutes": room.duration_minutes,
            "status": room.status,
            "participant_count": participant_count,
            "created_at": room.created_at,
            "expires_at": room.expires_at
        })
    return results


@router.get("/{room_code}")
def get_room_details(room_code: str, db: Session = Depends(get_db)):
    """Get test room details by room code (public endpoint for students to preview)."""
    room = db.query(TestRoom).filter(TestRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Test room not found. Please check the Room ID.")

    company = db.query(Company).filter(Company.id == room.company_id).first()
    creator = db.query(User).filter(User.id == room.created_by).first()

    skill_names = []
    for sid in (room.skill_ids_json or []):
        s = db.query(Skill).filter(Skill.id == sid).first()
        if s:
            skill_names.append(s.name)

    participant_count = db.query(TestRoomParticipant).filter(TestRoomParticipant.room_id == room.id).count()

    return {
        "id": room.id,
        "room_code": room.room_code,
        "title": room.title,
        "description": room.description,
        "company_name": company.name if company else "Unknown",
        "recruiter_name": creator.full_name if creator else "Unknown",
        "skill_names": skill_names,
        "num_questions": room.num_questions,
        "duration_minutes": room.duration_minutes,
        "status": room.status,
        "participant_count": participant_count,
        "created_at": room.created_at,
        "expires_at": room.expires_at
    }


@router.post("/{room_code}/join")
def join_test_room(room_code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Student joins a test room."""
    if current_user.role != UserRole.STUDENT.value:
        raise HTTPException(status_code=403, detail="Only students can join test rooms")

    room = db.query(TestRoom).filter(TestRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Test room not found. Please check the Room ID.")

    if room.status != "open":
        raise HTTPException(status_code=400, detail="This test room is no longer accepting participants")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check if already joined
    existing = db.query(TestRoomParticipant).filter(
        TestRoomParticipant.room_id == room.id,
        TestRoomParticipant.student_id == student.id
    ).first()
    if existing:
        if existing.status == "submitted":
            raise HTTPException(status_code=400, detail="You have already completed this test")
        return {"message": "Already joined", "participant_id": existing.id, "status": existing.status}

    participant = TestRoomParticipant(
        room_id=room.id,
        student_id=student.id,
        status="joined"
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)

    return {"message": "Successfully joined the test room", "participant_id": participant.id, "status": "joined"}


@router.get("/{room_code}/questions")
def get_room_questions(room_code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get assessment questions for a test room (student must have joined)."""
    room = db.query(TestRoom).filter(TestRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Test room not found")

    if room.status != "open":
        raise HTTPException(status_code=400, detail="This test room is no longer active")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=403, detail="Only students can take tests")

    participant = db.query(TestRoomParticipant).filter(
        TestRoomParticipant.room_id == room.id,
        TestRoomParticipant.student_id == student.id
    ).first()
    if not participant:
        raise HTTPException(status_code=403, detail="You must join this room first")

    if participant.status == "submitted":
        raise HTTPException(status_code=400, detail="You have already submitted this test")

    # Mark participant as in_progress
    participant.status = "in_progress"
    db.commit()

    # Collect questions from selected skills
    all_questions = []
    for sid in (room.skill_ids_json or []):
        questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.skill_id == sid).all()
        all_questions.extend(questions)

    # If not enough skill-specific questions, pad with general ones
    if len(all_questions) < room.num_questions:
        extra = db.query(AssessmentQuestion).filter(
            ~AssessmentQuestion.id.in_([q.id for q in all_questions])
        ).limit(room.num_questions - len(all_questions)).all()
        all_questions.extend(extra)

    # Randomly select up to num_questions
    if len(all_questions) > room.num_questions:
        all_questions = random.sample(all_questions, room.num_questions)

    return {
        "room_code": room.room_code,
        "title": room.title,
        "duration_minutes": room.duration_minutes,
        "total_questions": len(all_questions),
        "questions": [{
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options_json,
            "difficulty": q.difficulty,
            "category": q.category
        } for q in all_questions]
    }


@router.post("/{room_code}/submit")
def submit_test_room(room_code: str, data: TestRoomSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Student submits answers for a test room."""
    room = db.query(TestRoom).filter(TestRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Test room not found")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=403, detail="Only students can submit tests")

    participant = db.query(TestRoomParticipant).filter(
        TestRoomParticipant.room_id == room.id,
        TestRoomParticipant.student_id == student.id
    ).first()
    if not participant:
        raise HTTPException(status_code=403, detail="You must join this room first")

    if participant.status == "submitted":
        raise HTTPException(status_code=400, detail="You have already submitted this test")

    # Grade the answers
    total = 0
    correct = 0
    for qid_str, answer in data.answers.items():
        qid = int(qid_str)
        question = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == qid).first()
        if question:
            total += 1
            if answer.strip().lower() == question.correct_answer.strip().lower():
                correct += 1

    score = (correct / total * 100) if total > 0 else 0

    participant.submitted_at = datetime.utcnow()
    participant.score = round(score, 2)
    participant.correct_answers = correct
    participant.total_questions = total
    participant.answers_json = data.answers
    participant.status = "submitted"
    db.commit()

    return {
        "message": "Test submitted successfully",
        "score": round(score, 2),
        "correct_answers": correct,
        "total_questions": total
    }


@router.get("/{room_code}/results")
def get_room_results(room_code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recruiter views results for all participants in a test room."""
    if current_user.role != UserRole.RECRUITER.value:
        raise HTTPException(status_code=403, detail="Only recruiters can view room results")

    room = db.query(TestRoom).filter(TestRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Test room not found")

    # Verify this room belongs to the recruiter
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company or room.company_id != company.id:
        raise HTTPException(status_code=403, detail="This room does not belong to your organization")

    participants = db.query(TestRoomParticipant).filter(TestRoomParticipant.room_id == room.id).all()
    results = []
    for p in participants:
        student = db.query(Student).filter(Student.id == p.student_id).first()
        student_user = db.query(User).filter(User.id == student.user_id).first() if student else None
        results.append({
            "student_id": p.student_id,
            "student_name": student_user.full_name if student_user else "Unknown",
            "college_name": student.college_name if student else None,
            "score": p.score,
            "correct_answers": p.correct_answers,
            "total_questions": p.total_questions,
            "status": p.status,
            "joined_at": p.joined_at,
            "submitted_at": p.submitted_at
        })

    # Sort by score descending, with submitted students first
    results.sort(key=lambda x: (x["status"] == "submitted", x["score"] or 0), reverse=True)
    return results


@router.put("/{room_code}/close")
def close_test_room(room_code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Recruiter closes a test room (no more joining allowed)."""
    if current_user.role != UserRole.RECRUITER.value:
        raise HTTPException(status_code=403, detail="Only recruiters can close test rooms")

    room = db.query(TestRoom).filter(TestRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Test room not found")

    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company or room.company_id != company.id:
        raise HTTPException(status_code=403, detail="This room does not belong to your organization")

    room.status = "closed"
    db.commit()

    return {"message": "Test room closed successfully", "room_code": room.room_code, "status": "closed"}
