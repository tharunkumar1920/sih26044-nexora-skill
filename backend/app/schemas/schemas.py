from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str # student, recruiter, faculty, institution_admin
    college_or_company: Optional[str] = None
    # Recruiter security fields
    registration_number: Optional[str] = None  # CIN/GSTIN/DIPP
    official_domain: Optional[str] = None      # e.g. "tcs.com"
    company_website: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Skill & Taxonomy Schemas
class SkillBase(BaseModel):
    name: str
    category_name: str = "Technical"
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    is_custom: bool

    class Config:
        from_attributes = True

class StudentSkillUpdate(BaseModel):
    skill_id: int
    proficiency_level: float

class StudentSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    category_name: str
    proficiency_level: float
    assessment_score: float
    verified: bool

    class Config:
        from_attributes = True

# Student Profile & Portfolio
class StudentProfileUpdate(BaseModel):
    phone: Optional[str] = None
    college_name: Optional[str] = None
    department: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    bio: Optional[str] = None
    target_role: Optional[str] = None
    resume_url: Optional[str] = None
    is_public_portfolio: Optional[bool] = None

class StudentProjectCreate(BaseModel):
    title: str
    description: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    technologies: List[str]

class CertificationCreate(BaseModel):
    title: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    skill_id: Optional[int] = None

# Assessment Schemas
class QuestionResponse(BaseModel):
    id: int
    skill_id: int
    question_text: str
    options: List[str]
    difficulty: str
    category: str

class AssessmentSubmit(BaseModel):
    skill_id: int
    answers: Dict[int, str] # question_id -> selected_option

class AssessmentResultResponse(BaseModel):
    skill_id: int
    skill_name: str
    score: float
    total_questions: int
    correct_answers: int
    passed: bool

# Opportunity & Matching Schemas
class OpportunitySkillCreate(BaseModel):
    skill_id: int
    min_proficiency: float = 60.0
    is_required: bool = True
    weight: float = 1.0

class OpportunityCreate(BaseModel):
    title: str
    type: str = "internship"
    description: str
    required_education: str = "B.Tech / B.Sc"
    experience_level: str = "Freshers"
    location: str = "Remote"
    work_mode: str = "Remote"
    duration: str = "3 Months"
    stipend_or_salary: str = "₹15,000 / month"
    deadline: str = "2026-09-30"
    required_skills: List[OpportunitySkillCreate]

class OpportunityResponse(BaseModel):
    id: int
    company_name: str
    title: str
    type: str
    description: str
    required_education: str
    experience_level: str
    location: str
    work_mode: str
    duration: str
    stipend_or_salary: str
    deadline: str
    status: str
    required_skills: List[Dict[str, Any]]
    match_score: Optional[float] = None
    match_breakdown: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Application Schemas
class ApplicationCreate(BaseModel):
    opportunity_id: int

class ApplicationStatusUpdate(BaseModel):
    status: str # applied, under_review, shortlisted, interview, selected, rejected, completed

class ApplicationResponse(BaseModel):
    id: int
    opportunity_id: int
    opportunity_title: str
    company_name: str
    student_id: int
    student_name: str
    status: str
    match_score: float
    applied_at: datetime
    notes: Optional[str] = None

# Explainable Skill Gap & Match Schemas
class SkillGapItem(BaseModel):
    skill_name: str
    required_score: float
    current_score: float
    gap: float
    priority: str # HIGH, MEDIUM, LOW
    recommended_course: Optional[str] = None
    course_url: Optional[str] = None

class MatchExplanationResponse(BaseModel):
    opportunity_id: int
    opportunity_title: str
    overall_match_score: float
    score_breakdown: Dict[str, float] # skill_compatibility, assessment, projects, eligibility, career_interest
    matched_skills: List[str]
    partial_skills: List[str]
    missing_skills: List[str]
    recommended_action: str
    suitable_opportunity_after_improvement: Optional[str] = None

# Analytics Schemas
class InstitutionAnalyticsResponse(BaseModel):
    total_students: int
    students_assessed: int
    average_skill_score: float
    internship_participation_rate: float
    placement_readiness_rate: float
    top_skill_gaps: List[Dict[str, Any]]
    industry_demanded_skills: List[Dict[str, Any]]
    department_readiness: List[Dict[str, Any]]

# ─── Test Room Schemas ──────────────────────────────────────────────────────────

class TestRoomCreate(BaseModel):
    title: str
    description: Optional[str] = None
    skill_ids: List[int]
    num_questions: int = 10
    duration_minutes: int = 30

class TestRoomResponse(BaseModel):
    id: int
    room_code: str
    title: str
    description: Optional[str] = None
    company_name: str
    recruiter_name: str
    skill_names: List[str]
    num_questions: int
    duration_minutes: int
    status: str
    participant_count: int
    created_at: datetime
    expires_at: Optional[datetime] = None

class TestRoomJoin(BaseModel):
    room_code: str

class TestRoomSubmit(BaseModel):
    answers: Dict[int, str]  # question_id -> selected_option

class TestRoomParticipantResult(BaseModel):
    student_id: int
    student_name: str
    college_name: Optional[str] = None
    score: Optional[float] = None
    correct_answers: Optional[int] = None
    total_questions: Optional[int] = None
    status: str
    joined_at: datetime
    submitted_at: Optional[datetime] = None

class TestRoomDetailResponse(BaseModel):
    room: TestRoomResponse
    participants: List[TestRoomParticipantResult]
