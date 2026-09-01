import json
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, UserRole, Student, Company, Faculty, Institution,
    SkillCategory, Skill, StudentSkill, AssessmentQuestion,
    AssessmentResult, Opportunity, OpportunitySkill, Application,
    Course, Certification, StudentProject, CollaborationOpportunity
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    print("Seeding SIH26044 Database...")

    # 1. Seed Skill Categories
    cat_tech = SkillCategory(name="Technical", description="Programming, Software Engineering & Data")
    cat_soft = SkillCategory(name="Soft Skill", description="Communication, Leadership & Problem Solving")
    cat_ayush = SkillCategory(name="Ayush Domain", description="Ayush Informatics, Herbal Data & Health Tech")
    db.add_all([cat_tech, cat_soft, cat_ayush])
    db.commit()

    # 2. Seed Skills Taxonomy (20+ Skills)
    skills_data = [
        ("Python", "Technical", "High-level programming language for data analytics and web development."),
        ("SQL", "Technical", "Relational database querying and data engineering."),
        ("Machine Learning", "Technical", "Predictive modeling, supervised & unsupervised ML algorithms."),
        ("Artificial Intelligence", "Technical", "Deep learning, neural networks, and NLP."),
        ("Data Visualization", "Technical", "Charts, dashboards, Matplotlib, Seaborn, Tableau."),
        ("Git", "Technical", "Version control and collaborative code repositories."),
        ("React", "Technical", "Frontend UI framework for interactive web portals."),
        ("Cloud", "Technical", "AWS, Azure, cloud infrastructure and deployment."),
        ("Cybersecurity", "Technical", "Data security, encryption, and system defense."),
        ("Data Structures", "Technical", "Arrays, Trees, Graphs, Hash Maps, algorithmic efficiency."),
        ("Algorithms", "Technical", "Sorting, Searching, Dynamic Programming."),
        ("Excel", "Technical", "Spreadsheet analytics, pivot tables, VLOOKUP."),
        ("Communication", "Soft Skill", "Verbal, written, and professional presentation skills."),
        ("Problem Solving", "Soft Skill", "Analytical thinking and structured problem resolution."),
        ("Teamwork", "Soft Skill", "Cross-functional collaboration and team dynamics."),
        ("Leadership", "Soft Skill", "Project coordination and initiative drive."),
        ("Ayush Herbal Data", "Ayush Domain", "Digitization and analytical modeling of Ayurvedic formulations."),
        ("Ayush Bioinformatics", "Ayush Domain", "Genomic and chemical compound mapping in traditional medicine."),
        ("Clinical Trial Analytics", "Ayush Domain", "Biostatistics and medical research trial data evaluation."),
        ("Research Methods", "Ayush Domain", "Academic scientific writing, literature review, and study design.")
    ]

    skill_objs = {}
    for name, cat_name, desc in skills_data:
        cat_id = cat_tech.id if cat_name == "Technical" else (cat_soft.id if cat_name == "Soft Skill" else cat_ayush.id)
        s = Skill(name=name, category_id=cat_id, category_name=cat_name, description=desc)
        db.add(s)
        db.commit()
        db.refresh(s)
        skill_objs[name] = s

    # 3. Seed Demo Users
    # Student 1 (Main Demo)
    u_student1 = User(
        email="student@ayush.gov.in",
        hashed_password=get_password_hash("password123"),
        full_name="Aarav Sharma",
        role=UserRole.STUDENT.value
    )
    # Student 2
    u_student2 = User(
        email="ananya@ayush.gov.in",
        hashed_password=get_password_hash("password123"),
        full_name="Ananya Patel",
        role=UserRole.STUDENT.value
    )
    # Student 3
    u_student3 = User(
        email="vikram@ayush.gov.in",
        hashed_password=get_password_hash("password123"),
        full_name="Vikram Singh",
        role=UserRole.STUDENT.value
    )
    # Recruiter 1 (Main Demo)
    u_recruiter1 = User(
        email="recruiter@ayushhealthtech.com",
        hashed_password=get_password_hash("password123"),
        full_name="Priya Nair (HR Lead)",
        role=UserRole.RECRUITER.value
    )
    # Recruiter 2
    u_recruiter2 = User(
        email="hr@ayurvedacorp.in",
        hashed_password=get_password_hash("password123"),
        full_name="Rohan Mehta",
        role=UserRole.RECRUITER.value
    )
    # Faculty 1 (Main Demo)
    u_faculty1 = User(
        email="faculty@ayushinstitute.edu.in",
        hashed_password=get_password_hash("password123"),
        full_name="Dr. Rajesh Kumar",
        role=UserRole.FACULTY.value
    )
    # Admin 1 (Main Demo)
    u_admin1 = User(
        email="admin@ayush.gov.in",
        hashed_password=get_password_hash("password123"),
        full_name="Ayush Ministry Administrator",
        role=UserRole.INSTITUTION_ADMIN.value
    )

    db.add_all([u_student1, u_student2, u_student3, u_recruiter1, u_recruiter2, u_faculty1, u_admin1])
    db.commit()

    # 4. Seed Profiles
    st1 = Student(
        user_id=u_student1.id,
        phone="+91 9876543210",
        college_name="National Institute of Ayush & Tech",
        department="Computer Science & Ayush Informatics",
        degree="B.Tech Computer Science",
        graduation_year=2026,
        cgpa=8.8,
        bio="Passionate CS student specializing in data analytics, Python, machine learning, and Ayush health technology solutions.",
        target_role="Data Analyst",
        readiness_score=78.5,
        is_public_portfolio=True
    )
    st2 = Student(
        user_id=u_student2.id,
        phone="+91 9812345678",
        college_name="IIT Delhi (Ayush Research Wing)",
        department="Computer Science",
        degree="B.Tech CS",
        graduation_year=2026,
        cgpa=9.2,
        bio="Full-stack Python & AI enthusiast building health intelligence dashboards.",
        target_role="Python Developer",
        readiness_score=88.0,
        is_public_portfolio=True
    )
    st3 = Student(
        user_id=u_student3.id,
        phone="+91 9765432109",
        college_name="All India Institute of Ayurveda",
        department="Ayush Health Informatics",
        degree="B.Sc Health Data Science",
        graduation_year=2026,
        cgpa=8.4,
        bio="Researcher focusing on traditional medicine data mining and clinical analytics.",
        target_role="Ayush Health Data Specialist",
        readiness_score=82.0,
        is_public_portfolio=True
    )
    db.add_all([st1, st2, st3])

    comp1 = Company(
        user_id=u_recruiter1.id,
        name="HealthTech Solutions & Ayush Analytics",
        industry_sector="Ayush & Health Tech",
        website="https://healthtech-ayush.example.com",
        description="Leading AI and health data analytics provider specializing in Ayush formulation intelligence.",
        location="New Delhi, India",
        is_approved=True
    )
    comp2 = Company(
        user_id=u_recruiter2.id,
        name="AyurvedaBio Systems",
        industry_sector="Bio-Tech & Pharmaceuticals",
        website="https://ayurvedabio.example.com",
        description="Pioneering botanical data research and AI clinical software.",
        location="Bengaluru, India",
        is_approved=True
    )
    db.add_all([comp1, comp2])

    fac1 = Faculty(
        user_id=u_faculty1.id,
        department="Ayush Informatics & Data Science",
        institution_name="National Institute of Ayush & Tech",
        designation="Associate Professor",
        research_interests="Herbal Data Mining, Predictive AI in Medicinal Plants",
        biography="Over 12 years of research experience bridging Ayurveda literature and modern Machine Learning."
    )
    db.add(fac1)

    inst1 = Institution(
        user_id=u_admin1.id,
        name="Central Ministry of Ayush Skill Council",
        code="AYUSH-SKILL-01",
        location="New Delhi",
        contact_email="admin@ayush.gov.in",
        is_verified=True
    )
    db.add(inst1)
    db.commit()

    # 5. Seed Student Skills (for Student 1 - Aarav)
    st1_skills = [
        (skill_objs["Python"].id, 85.0, 82.0, True),
        (skill_objs["SQL"].id, 58.0, 54.0, True),
        (skill_objs["Machine Learning"].id, 72.0, 70.0, True),
        (skill_objs["Git"].id, 42.0, 40.0, True),
        (skill_objs["Communication"].id, 80.0, 76.0, True),
        (skill_objs["Data Visualization"].id, 55.0, 50.0, False),
        (skill_objs["Ayush Herbal Data"].id, 78.0, 75.0, True)
    ]
    for sk_id, prof, assess, ver in st1_skills:
        db.add(StudentSkill(student_id=st1.id, skill_id=sk_id, proficiency_level=prof, assessment_score=assess, verified=ver))

    # Seed Student 2 & 3 skills
    for sk_id, prof, assess, ver in [(skill_objs["Python"].id, 92.0, 90.0, True), (skill_objs["SQL"].id, 80.0, 85.0, True), (skill_objs["Git"].id, 78.0, 75.0, True)]:
        db.add(StudentSkill(student_id=st2.id, skill_id=sk_id, proficiency_level=prof, assessment_score=assess, verified=ver))

    db.commit()

    # 6. Seed Projects & Certifications
    p1 = StudentProject(
        student_id=st1.id,
        title="Ayush Formulation Predictor",
        description="Built an end-to-end Machine Learning web application predicting active botanical bio-compounds using Python and Scikit-Learn.",
        github_url="https://github.com/aarav/ayush-predictor",
        live_url="https://ayush-predictor.example.com",
        technologies_json=["Python", "Scikit-Learn", "FastAPI", "React"]
    )
    p2 = StudentProject(
        student_id=st1.id,
        title="Smart Health Analytics Dashboard",
        description="Developed responsive data analytics dashboard visualizing student skill readiness and industry demand metrics.",
        github_url="https://github.com/aarav/health-dashboard",
        technologies_json=["React", "Tailwind CSS", "Recharts", "SQL"]
    )
    db.add_all([p1, p2])

    c1 = Certification(
        student_id=st1.id,
        title="NPTEL Data Analytics with Python",
        issuer="NPTEL / IIT Madras",
        issue_date="2025-11",
        credential_url="https://nptel.ac.in/noc/Ecertificate/?q=12345",
        skill_id=skill_objs["Python"].id
    )
    c2 = Certification(
        student_id=st1.id,
        title="Ayush Health Informatics Specialist",
        issuer="Ministry of Ayush",
        issue_date="2026-02",
        credential_url="https://ayush.gov.in/certs/98765",
        skill_id=skill_objs["Ayush Herbal Data"].id
    )
    db.add_all([c1, c2])

    # 7. Seed Question Bank for Skill Assessment
    q_data = [
        # Python
        (skill_objs["Python"].id, "What will be the output of `len(set([1, 2, 2, 3, 4, 4]))`?", ["4", "6", "5", "Error"], "4", "Beginner"),
        (skill_objs["Python"].id, "Which decorator in FastAPI is used to define a GET endpoint?", ["@app.get()", "@app.post()", "@app.route()", "@get()"], "@app.get()", "Intermediate"),
        (skill_objs["Python"].id, "In pandas, which function is used to load data from a CSV file?", ["pd.read_csv()", "pd.load_csv()", "pd.open_csv()", "csv.read()"], "pd.read_csv()", "Beginner"),
        # SQL
        (skill_objs["SQL"].id, "Which SQL keyword is used to filter aggregated group results?", ["HAVING", "WHERE", "GROUP BY", "FILTER"], "HAVING", "Intermediate"),
        (skill_objs["SQL"].id, "What does an INNER JOIN return?", ["Matches present in both tables", "All rows from left table", "All rows from right table", "Cartesian product"], "Matches present in both tables", "Beginner"),
        (skill_objs["SQL"].id, "Which SQL command is used to remove a table entirely along with its schema?", ["DROP TABLE", "DELETE TABLE", "REMOVE TABLE", "TRUNCATE TABLE"], "DROP TABLE", "Beginner"),
        # Machine Learning
        (skill_objs["Machine Learning"].id, "Which evaluation metric is ideal for highly imbalanced classification datasets?", ["F1-Score / PR-AUC", "Accuracy", "MSE", "R-squared"], "F1-Score / PR-AUC", "Intermediate"),
        (skill_objs["Machine Learning"].id, "Overfitting can be reduced by which of the following techniques?", ["Regularization (L1/L2)", "Adding more random parameters", "Removing training data", "Increasing model complexity"], "Regularization (L1/L2)", "Intermediate"),
        # Ayush Herbal Data
        (skill_objs["Ayush Herbal Data"].id, "Which database standard is commonly used for botanical bio-compound classification?", ["Chemical Entities of Biological Interest (ChEBI)", "JSON-LD", "POSIX", "GraphQL"], "Chemical Entities of Biological Interest (ChEBI)", "Advanced"),
        # Communication
        (skill_objs["Communication"].id, "What is the key principle of active listening in professional settings?", ["Clarifying and summarizing the speaker's points without interrupting", "Preparing your response while the speaker is talking", "Nodding continuously without speaking", "Focusing exclusively on grammar"], "Clarifying and summarizing the speaker's points without interrupting", "Beginner")
    ]
    for sk_id, text, opts, ans, diff in q_data:
        db.add(AssessmentQuestion(
            skill_id=sk_id,
            question_text=text,
            options_json=opts,
            correct_answer=ans,
            difficulty=diff,
            category="Technical" if diff != "Beginner" else "Basic"
        ))

    # 8. Seed Industry Opportunities
    opp1 = Opportunity(
        company_id=comp1.id,
        title="Python Developer Internship",
        type="internship",
        description="Join our Ayush health tech team to build Python APIs and data ingestion pipelines for botanical clinical research.",
        required_education="B.Tech Computer Science / IT / Ayush Tech",
        experience_level="Freshers / Final Year Students",
        location="New Delhi / Remote",
        work_mode="Remote",
        duration="3 Months",
        stipend_or_salary="₹18,000 / month",
        deadline="2026-10-15",
        status="open"
    )
    opp2 = Opportunity(
        company_id=comp1.id,
        title="Data Analyst Internship",
        type="internship",
        description="Analyze Ayush patient wellness data, build SQL queries, and construct interactive dashboards for industry partners.",
        required_education="B.Tech / B.Sc / BCA",
        experience_level="Freshers",
        location="Remote",
        work_mode="Remote",
        duration="6 Months",
        stipend_or_salary="₹20,000 / month",
        deadline="2026-10-30",
        status="open"
    )
    opp3 = Opportunity(
        company_id=comp2.id,
        title="Ayush Health Data Specialist Trainee",
        type="job",
        description="Entry level role for data science graduates to model herbal medicine research data and predictive clinical trial outcomes.",
        required_education="Graduation in CS / Bio-Informatics / Ayush",
        experience_level="0-1 Years",
        location="Bengaluru, India",
        work_mode="Hybrid",
        duration="Full-Time Job",
        stipend_or_salary="₹6.5 LPA",
        deadline="2026-11-15",
        status="open"
    )
    db.add_all([opp1, opp2, opp3])
    db.commit()

    # Opportunity Skills Requirements
    # Opp 1: Python Developer
    db.add_all([
        OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_objs["Python"].id, min_proficiency=75.0, is_required=True, weight=1.2),
        OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_objs["SQL"].id, min_proficiency=60.0, is_required=True, weight=1.0),
        OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_objs["Git"].id, min_proficiency=50.0, is_required=True, weight=0.8),
        OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_objs["Problem Solving"].id, min_proficiency=70.0, is_required=True, weight=1.0),
        OpportunitySkill(opportunity_id=opp1.id, skill_id=skill_objs["Machine Learning"].id, min_proficiency=60.0, is_required=False, weight=0.7)
    ])

    # Opp 2: Data Analyst (Classic Gap example from prompt)
    db.add_all([
        OpportunitySkill(opportunity_id=opp2.id, skill_id=skill_objs["Python"].id, min_proficiency=75.0, is_required=True, weight=1.0),
        OpportunitySkill(opportunity_id=opp2.id, skill_id=skill_objs["SQL"].id, min_proficiency=80.0, is_required=True, weight=1.4),
        OpportunitySkill(opportunity_id=opp2.id, skill_id=skill_objs["Data Visualization"].id, min_proficiency=70.0, is_required=True, weight=1.1),
        OpportunitySkill(opportunity_id=opp2.id, skill_id=skill_objs["Excel"].id, min_proficiency=65.0, is_required=True, weight=0.8)
    ])

    # Opp 3: Ayush Health Data Specialist
    db.add_all([
        OpportunitySkill(opportunity_id=opp3.id, skill_id=skill_objs["Ayush Herbal Data"].id, min_proficiency=80.0, is_required=True, weight=1.5),
        OpportunitySkill(opportunity_id=opp3.id, skill_id=skill_objs["Python"].id, min_proficiency=70.0, is_required=True, weight=1.1),
        OpportunitySkill(opportunity_id=opp3.id, skill_id=skill_objs["Machine Learning"].id, min_proficiency=75.0, is_required=True, weight=1.2),
        OpportunitySkill(opportunity_id=opp3.id, skill_id=skill_objs["SQL"].id, min_proficiency=65.0, is_required=True, weight=0.9)
    ])
    db.commit()

    # 9. Seed Recommended Courses
    db.add_all([
        Course(
            title="SQL for Data Analytics & Business Intelligence",
            provider="NPTEL / Swayam",
            skill_id=skill_objs["SQL"].id,
            target_level="Intermediate",
            url="https://swayam.gov.in/courses?q=sql",
            duration_hours=25,
            rating=4.9
        ),
        Course(
            title="Data Visualization with Python & Seaborn",
            provider="Coursera / Ayush e-Learning",
            skill_id=skill_objs["Data Visualization"].id,
            target_level="Beginner to Intermediate",
            url="https://coursera.org/learn/data-visualization",
            duration_hours=18,
            rating=4.8
        ),
        Course(
            title="Git & GitHub Professional Workflow",
            provider="Udemy / Swayam",
            skill_id=skill_objs["Git"].id,
            target_level="Beginner",
            url="https://swayam.gov.in/courses?q=git",
            duration_hours=12,
            rating=4.7
        ),
        Course(
            title="Ayush Health Data Science Masterclass",
            provider="Ministry of Ayush Training Portal",
            skill_id=skill_objs["Ayush Herbal Data"].id,
            target_level="Advanced",
            url="https://ayush.gov.in/training/data-science",
            duration_hours=30,
            rating=5.0
        )
    ])

    # 10. Seed Applications
    db.add(Application(
        student_id=st1.id,
        opportunity_id=opp1.id,
        status="shortlisted",
        match_score=91.4,
        notes="High score in Python & ML; SQL training recommended."
    ))
    db.add(Application(
        student_id=st2.id,
        opportunity_id=opp1.id,
        status="applied",
        match_score=94.2
    ))

    # 11. Seed Collaboration Opportunities for Faculty Hub
    db.add_all([
        CollaborationOpportunity(
            title="Faculty Development Program (FDP) on Ayush Health Informatics & AI",
            type="FDP",
            posted_by_role="recruiter",
            posted_by_name="HealthTech Solutions",
            organization="HealthTech Solutions & Ministry of Ayush",
            description="5-day intensive FDP for faculty members on integrating Python data analytics and botanical database modeling into undergraduate curriculum.",
            area="Ayush Health Informatics",
            date_or_duration="Oct 10-15, 2026"
        ),
        CollaborationOpportunity(
            title="Joint Industry Research: Predictive AI in Medicinal Plant Efficacy",
            type="Research",
            posted_by_role="faculty",
            posted_by_name="Dr. Rajesh Kumar",
            organization="National Institute of Ayush & Tech",
            description="Seeking industry partners for collaborative testing and validation of deep learning models on botanical extracts.",
            area="Artificial Intelligence & Bio-Tech",
            date_or_duration="6 Months Project"
        ),
        CollaborationOpportunity(
            title="Guest Lecture Series: Modern Data Engineering in Healthcare",
            type="Guest Lecture",
            posted_by_role="recruiter",
            posted_by_name="AyurvedaBio Systems",
            organization="AyurvedaBio Systems",
            description="Industry experts presenting real-world cloud data warehouse architecture for CS and Ayush students.",
            area="Cloud Data Architecture",
            date_or_duration="1 Day Workshop"
        )
    ])

    db.commit()
    print("Database successfully seeded with demo data!")

if __name__ == "__main__":
    seed_database()
