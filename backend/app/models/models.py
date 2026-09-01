import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    RECRUITER = "recruiter"
    FACULTY = "faculty"
    INSTITUTION_ADMIN = "institution_admin"

class OpportunityType(str, enum.Enum):
    INTERNSHIP = "internship"
    JOB = "job"
    APPRENTICESHIP = "apprenticeship"
    PROJECT = "project"
    TRAINING = "training"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    SELECTED = "selected"
    REJECTED = "rejected"
    COMPLETED = "completed"

# User Account Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default=UserRole.STUDENT.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    company_profile = relationship("Company", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_profile = relationship("Institution", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

# Student Profile
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String, nullable=True)
    college_name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True, default=0.0)
    bio = Column(Text, nullable=True)
    target_role = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    is_public_portfolio = Column(Boolean, default=True)
    readiness_score = Column(Float, default=0.0)

    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("StudentProject", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    assessment_results = relationship("AssessmentResult", back_populates="student", cascade="all, delete-orphan")

# Recruiter / Company Profile
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    industry_sector = Column(String, nullable=True, default="Ayush & Health Tech")
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True, default="New Delhi, India")
    logo_url = Column(String, nullable=True)
    is_approved = Column(Boolean, default=False)
    # Security & verification fields
    registration_number = Column(String, nullable=True)  # CIN/GSTIN/DIPP number
    official_domain = Column(String, nullable=True)      # e.g. "tcs.com"
    verification_status = Column(String, default="pending")  # pending, verified, rejected
    verified_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="company_profile")
    opportunities = relationship("Opportunity", back_populates="company", cascade="all, delete-orphan")
    test_rooms = relationship("TestRoom", back_populates="company", cascade="all, delete-orphan")

# Faculty Profile
class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String, nullable=True)
    institution_name = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    research_interests = Column(Text, nullable=True)
    biography = Column(Text, nullable=True)

    user = relationship("User", back_populates="faculty_profile")

# Institution / Admin Profile
class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=True)
    location = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    is_verified = Column(Boolean, default=True)

    user = relationship("User", back_populates="institution_profile")

# Skill Category
class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    skills = relationship("Skill", back_populates="category_obj")

# Skills Taxonomy
class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("skill_categories.id"), nullable=True)
    category_name = Column(String, nullable=False, default="Technical") # Technical, Soft Skill, Ayush/Domain
    description = Column(Text, nullable=True)
    is_custom = Column(Boolean, default=False)

    category_obj = relationship("SkillCategory", back_populates="skills")
    student_skills = relationship("StudentSkill", back_populates="skill")
    questions = relationship("AssessmentQuestion", back_populates="skill")
    courses = relationship("Course", back_populates="skill")

# Student Skill Mapping
class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency_level = Column(Float, default=50.0) # 1-100 self-reported or base
    assessment_score = Column(Float, default=0.0)   # 1-100 verified score
    verified = Column(Boolean, default=False)

    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")

# Assessment Question Bank
class AssessmentQuestion(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=False) # ["Option A", "Option B", "Option C", "Option D"]
    correct_answer = Column(String, nullable=False)
    difficulty = Column(String, default="Intermediate") # Beginner, Intermediate, Advanced
    category = Column(String, default="Technical")
    weight = Column(Float, default=1.0)

    skill = relationship("Skill", back_populates="questions")

# Assessment Result History
class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="assessment_results")
    skill = relationship("Skill")

# Industry Opportunities
class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, default=OpportunityType.INTERNSHIP.value)
    description = Column(Text, nullable=False)
    required_education = Column(String, default="B.Tech / B.Sc / Ayush Graduation")
    experience_level = Column(String, default="Freshers / Students")
    location = Column(String, default="Remote / New Delhi")
    work_mode = Column(String, default="Remote") # Remote, Hybrid, On-site
    duration = Column(String, default="3 Months")
    stipend_or_salary = Column(String, default="₹15,000 / month")
    deadline = Column(String, default="2026-09-30")
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="opportunities")
    required_skills = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")

# Opportunity Skill Requirements & Weights
class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    min_proficiency = Column(Float, default=60.0)
    is_required = Column(Boolean, default=True) # True = Required, False = Preferred
    weight = Column(Float, default=1.0)

    opportunity = relationship("Opportunity", back_populates="required_skills")
    skill = relationship("Skill")

# Student Applications
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status = Column(String, default=ApplicationStatus.APPLIED.value)
    match_score = Column(Float, default=0.0)
    applied_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    student = relationship("Student", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")

# Recommended Courses
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    provider = Column(String, default="Coursera / NPTEL / Swayam")
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    target_level = Column(String, default="Intermediate")
    url = Column(String, nullable=False)
    duration_hours = Column(Integer, default=20)
    rating = Column(Float, default=4.8)

    skill = relationship("Skill", back_populates="courses")

# Certifications
class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    issue_date = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)

    student = relationship("Student", back_populates="certifications")
    skill = relationship("Skill")

# Student Projects
class StudentProject(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    github_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)
    technologies_json = Column(JSON, nullable=True) # ["Python", "React", "SQL"]

    student = relationship("Student", back_populates="projects")

# Faculty & Industry Collaborations
class CollaborationOpportunity(Base):
    __tablename__ = "collaboration_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False) # FDP, Research, Consultancy, Workshop, Guest Lecture
    posted_by_role = Column(String, nullable=False) # faculty / recruiter
    posted_by_name = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    area = Column(String, nullable=False) # e.g. Ayush Informatics, ML, Herbal Bio-Tech
    date_or_duration = Column(String, nullable=False)
    status = Column(String, default="open")

# Notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info") # info, match, status, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

# Audit Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# ─── Test Room System ─────────────────────────────────────────────────────────

class TestRoomStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"

# Recruiter Test Room for Mass Bulk Assessments
class TestRoom(Base):
    __tablename__ = "test_rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String(6), unique=True, index=True, nullable=False)  # 6-char alphanumeric
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    skill_ids_json = Column(JSON, nullable=False)          # [1, 2, 5] — skill IDs to test
    num_questions = Column(Integer, default=10)
    duration_minutes = Column(Integer, default=30)
    status = Column(String, default=TestRoomStatus.OPEN.value)  # open, closed, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    company = relationship("Company", back_populates="test_rooms")
    creator = relationship("User")
    participants = relationship("TestRoomParticipant", back_populates="room", cascade="all, delete-orphan")

# Student participation in a Test Room
class TestRoomParticipant(Base):
    __tablename__ = "test_room_participants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("test_rooms.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)
    correct_answers = Column(Integer, nullable=True)
    total_questions = Column(Integer, nullable=True)
    answers_json = Column(JSON, nullable=True)  # {question_id: selected_option}
    status = Column(String, default="joined")   # joined, in_progress, submitted

    room = relationship("TestRoom", back_populates="participants")
    student = relationship("Student")
