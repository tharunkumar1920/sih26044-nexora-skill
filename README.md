# ⚡ Nexora-Skill — Next-Gen AI Skill Intelligence & Career Opportunity Platform

> **Nexora-Skill** is an AI-powered academia–industry skill intelligence, automated resume profiling, skill gap diagnostics, and explainable career matching ecosystem.

---

## 🚀 1-Click Launch (Run in One Folder)

You can launch the entire platform (Backend API + Frontend UI) with a single double-click:

### Option A: Windows Batch (Recommended)
Simply double click or run in terminal:
```cmd
start.bat
```

### Option B: PowerShell
```powershell
.\run.ps1
```

### Option C: Manual Launch (Two Terminals)

**Terminal 1 — Backend (FastAPI)**:
```bash
cd backend
$env:PYTHONPATH = "..;."
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend (React + Vite)**:
```bash
cd frontend
npm run dev
```

- **Frontend Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🌟 Core Features & Modules

### 1. 📄 AI Resume Parser & Document Upload (`/onboard`)
- **Dual Intake Modes**:
  - Drag-and-drop file upload (`.pdf`, `.docx`, `.txt`, `.rtf`, `.md`)
  - Direct text/bio paste
- **Automated Competency Extraction**: Parses technical skills, domain expertise, estimated proficiency levels, degree, CGPA, and infers target career roles.
- **Immediate ML Job Recommendations**: Returns top matching industry internships/jobs with compatibility percentages and 1-click apply.

### 2. 🎯 Explainable Machine Learning Match Engine
- **Multi-Factor Weighted Scoring**:
  - Required Skills Compatibility (40%)
  - Verified Assessment Scores (20%)
  - Projects & Certifications (15%)
  - Soft Skills (10%)
  - Educational Eligibility (10%)
  - Career Interest Alignment (5%)
- Transparent breakdown explaining **why** each match percentage was awarded.

### 3. 👥 4 Integrated Stakeholder Portals
1. **Student / Candidate**:
   - Dynamic Radar Skill Matrix & Career Readiness score
   - Automated Skill Gap Diagnostics with recommended course bridges
   - Timed verifiable skill assessments & quizzes
   - Application tracking & public digital portfolio
2. **Recruiter / Industry Partner**:
   - Post internships and jobs with custom weighted skill requirements
   - View *"Best Matched Candidates"* with algorithmic fit explanations
3. **Faculty / Academician**:
   - Industry collaboration hub, FDPs, research consultancies, guest lectures
4. **Institution Admin**:
   - Department placement readiness analytics, industry skill demand tracking, taxonomy editor, and question bank manager

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Preset Account |
| :--- | :--- | :--- | :--- |
| **Student** | `student@ayush.gov.in` | `password123` | Aarav Sharma |
| **Recruiter** | `recruiter@ayushhealthtech.com` | `password123` | HealthTech HR |
| **Faculty** | `faculty@ayushinstitute.edu.in` | `password123` | Dr. Rajesh Kumar |
| **Institution Admin** | `admin@ayush.gov.in` | `password123` | System Administrator |

---

## 📂 Project Structure

```
SIH/
├── start.bat                   # 1-Click Windows Launcher
├── run.ps1                     # 1-Click PowerShell Launcher
├── README.md                   # Project documentation
├── sih_platform.db             # SQLite database with seeded taxonomy & questions
│
├── backend/                    # FastAPI Backend
│   ├── main.py                 # Application entry point
│   ├── app/
│   │   ├── api/                # REST API routers (students, auth, opportunities, etc.)
│   │   ├── core/               # Database & security config
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   └── services/           # AI parser, matching service, recommendations
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # NexoraLogo, Sidebar, SkillRadarChart, Modals
│   │   ├── pages/              # LoginPage, SignupPage, OnboardingPage, Dashboards
│   │   ├── context/            # AuthContext
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript data interfaces
│   └── package.json            # Node.js dependencies
│
└── ml/                         # Machine Learning Modules
    ├── skill_matching.py       # Multi-factor explainable matcher
    ├── recommendation_engine.py# Skill gap & course recommendation engine
    ├── question_generator.py   # Adaptive assessment generator
    └── feature_engineering.py  # Profile vectorizer & TF-IDF similarity
```

---

## 🛡️ License & Acknowledgements
Developed for the **Smart India Hackathon** skill intelligence problem statement.
© 2026 Nexora-Skill. All rights reserved.
