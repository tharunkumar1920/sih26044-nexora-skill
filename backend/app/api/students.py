from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Student, StudentSkill, Skill, StudentProject, Certification, Application, Opportunity, Company
from app.schemas.schemas import StudentProfileUpdate, StudentSkillResponse, StudentSkillUpdate, StudentProjectCreate, CertificationCreate
from app.services.ai_parser import parse_resume_text, extract_text_from_file_bytes
from app.services.matching_service import matching_service
from pydantic import BaseModel

router = APIRouter(prefix="/students", tags=["Student Management"])

class OnboardRequest(BaseModel):
    description: str  # free-text resume or description


@router.get("/profile")
def get_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    skills = []
    for s_skill in student.skills:
        skill_obj = db.query(Skill).filter(Skill.id == s_skill.skill_id).first()
        if skill_obj:
            skills.append({
                "id": s_skill.id,
                "skill_id": skill_obj.id,
                "skill_name": skill_obj.name,
                "category_name": skill_obj.category_name,
                "proficiency_level": s_skill.proficiency_level,
                "assessment_score": s_skill.assessment_score,
                "verified": s_skill.verified
            })

    projects = [{
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "github_url": p.github_url,
        "live_url": p.live_url,
        "technologies": p.technologies_json or []
    } for p in student.projects]

    certs = [{
        "id": c.id,
        "title": c.title,
        "issuer": c.issuer,
        "issue_date": c.issue_date,
        "credential_url": c.credential_url
    } for c in student.certifications]

    return {
        "id": student.id,
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": student.phone,
        "college_name": student.college_name,
        "department": student.department,
        "degree": student.degree,
        "graduation_year": student.graduation_year,
        "cgpa": student.cgpa,
        "bio": student.bio,
        "target_role": student.target_role,
        "readiness_score": student.readiness_score,
        "is_public_portfolio": student.is_public_portfolio,
        "skills": skills,
        "projects": projects,
        "certifications": certs
    }

@router.put("/profile")
def update_student_profile(profile_data: StudentProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    for field, val in profile_data.dict(exclude_unset=True).items():
        setattr(student, field, val)

    db.commit()
    db.refresh(student)
    return {"message": "Profile updated successfully"}

@router.post("/skills")
def add_or_update_student_skill(skill_data: StudentSkillUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    st_skill = db.query(StudentSkill).filter(
        StudentSkill.student_id == student.id,
        StudentSkill.skill_id == skill_data.skill_id
    ).first()

    if st_skill:
        st_skill.proficiency_level = skill_data.proficiency_level
    else:
        st_skill = StudentSkill(
            student_id=student.id,
            skill_id=skill_data.skill_id,
            proficiency_level=skill_data.proficiency_level
        )
        db.add(st_skill)

    db.commit()
    return {"message": "Skill updated successfully"}

@router.post("/projects")
def add_student_project(proj_data: StudentProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    proj = StudentProject(
        student_id=student.id,
        title=proj_data.title,
        description=proj_data.description,
        github_url=proj_data.github_url,
        live_url=proj_data.live_url,
        technologies_json=proj_data.technologies
    )
    db.add(proj)
    db.commit()
    return {"message": "Project added successfully"}

@router.post("/certifications")
def add_student_certification(cert_data: CertificationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    cert = Certification(
        student_id=student.id,
        title=cert_data.title,
        issuer=cert_data.issuer,
        issue_date=cert_data.issue_date,
        credential_url=cert_data.credential_url,
        skill_id=cert_data.skill_id
    )
    db.add(cert)
    db.commit()
    return {"message": "Certification added successfully"}

@router.get("/applications")
def get_student_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    apps = db.query(Application).filter(Application.student_id == student.id).all()
    results = []
    for app in apps:
        opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()
        company_name = "Industry Partner"
        if opp:
            comp = db.query(Company).filter(Company.id == opp.company_id).first()
            if comp:
                company_name = comp.name

        results.append({
            "id": app.id,
            "opportunity_id": app.opportunity_id,
            "opportunity_title": opp.title if opp else "Opportunity",
            "company_name": company_name,
            "status": app.status,
            "match_score": app.match_score,
            "applied_at": app.applied_at,
            "notes": app.notes
        })

    return results


def _process_student_text_and_recommend(student: Student, raw_text: str, db: Session) -> dict:
    """
    Parses resume/description text, updates student profile, and computes
    ML recommendation matches against all available opportunities.
    """
    parsed = parse_resume_text(raw_text)

    # Update basic profile fields (only if extracted something meaningful)
    if parsed.get("degree"):
        student.degree = parsed["degree"]
    if parsed.get("cgpa") and parsed["cgpa"] > 0:
        student.cgpa = parsed["cgpa"]
    if parsed.get("graduation_year") and parsed["graduation_year"] > 0:
        student.graduation_year = parsed["graduation_year"]
    if parsed.get("department"):
        student.department = parsed["department"]
    if parsed.get("target_role"):
        student.target_role = parsed["target_role"]
    if parsed.get("bio"):
        student.bio = parsed["bio"]
    if parsed.get("college_name") and len(parsed["college_name"]) > 4:
        student.college_name = parsed["college_name"]
    if parsed.get("readiness_score"):
        student.readiness_score = parsed["readiness_score"]

    db.commit()

    # Map extracted skills to DB skills (create or reuse)
    skills_detected_names = []
    for skill_info in parsed.get("skills", []):
        skill_name = skill_info["name"]
        skills_detected_names.append(skill_name)

        # Find existing skill (case-insensitive)
        skill_obj = db.query(Skill).filter(
            Skill.name.ilike(skill_name)
        ).first()

        if not skill_obj:
            # Create a new custom skill
            skill_obj = Skill(
                name=skill_name,
                category_name=skill_info.get("category", "Technical"),
                is_custom=True
            )
            db.add(skill_obj)
            db.flush()

        # Add or update StudentSkill
        existing = db.query(StudentSkill).filter(
            StudentSkill.student_id == student.id,
            StudentSkill.skill_id == skill_obj.id
        ).first()

        new_prof = float(skill_info.get("proficiency", 65))
        if not existing:
            st_skill = StudentSkill(
                student_id=student.id,
                skill_id=skill_obj.id,
                proficiency_level=new_prof,
                assessment_score=0.0,
                verified=False
            )
            db.add(st_skill)
        else:
            if new_prof > (existing.proficiency_level or 0):
                existing.proficiency_level = new_prof

    # Add certifications extracted from text
    for cert_text in parsed.get("certifications", []):
        existing_cert = db.query(Certification).filter(
            Certification.student_id == student.id,
            Certification.title == cert_text[:200]
        ).first()
        if not existing_cert:
            cert = Certification(
                student_id=student.id,
                title=cert_text[:200],
                issuer="Extracted from profile",
            )
            db.add(cert)

    db.commit()
    db.refresh(student)

    # ─── Compute ML Job / Internship Recommendations ─────────────────────────
    opps = db.query(Opportunity).filter(Opportunity.status == "open").all()
    recommended_opps = []
    seen_ids = set()

    for opp in opps:
        if opp.id in seen_ids:
            continue
        seen_ids.add(opp.id)

        comp = db.query(Company).filter(Company.id == opp.company_id).first()
        match_info = matching_service.calculate_student_opportunity_match(db, student, opp)

        req_skills = []
        seen_req_names = set()
        for req in opp.required_skills:
            s_obj = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if s_obj and s_obj.name.lower() not in seen_req_names:
                seen_req_names.add(s_obj.name.lower())
                req_skills.append({
                    "id": s_obj.id,
                    "name": s_obj.name,
                    "min_proficiency": req.min_proficiency,
                    "is_required": req.is_required
                })

        recommended_opps.append({
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
            "required_skills": req_skills
        })

    # Sort opportunities by highest ML match score
    recommended_opps.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "message": "Resume successfully analyzed by ML algorithms",
        "skills_detected": list(dict.fromkeys(skills_detected_names)),
        "target_role": student.target_role or parsed.get("target_role"),
        "degree": student.degree or parsed.get("degree"),
        "cgpa": student.cgpa if student.cgpa else parsed.get("cgpa"),
        "readiness_score": student.readiness_score if student.readiness_score else parsed.get("readiness_score"),
        "recommended_opportunities": recommended_opps[:6]
    }


@router.post("/onboard")
def onboard_student(
    body: OnboardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return _process_student_text_and_recommend(student, body.description, db)


@router.post("/upload-resume")
async def upload_student_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts an uploaded resume file (PDF, DOCX, TXT, RTF, MD), extracts text,
    runs AI/ML skill extraction, benchmarks readiness, and returns top matched jobs.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    try:
        content = await file.read()
        extracted_text = extract_text_from_file_bytes(content, file.filename or "resume.txt")
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Unable to extract text from the uploaded file. Please ensure the file is not empty or password protected.")

        return _process_student_text_and_recommend(student, extracted_text, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded resume: {str(e)}")

