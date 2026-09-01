# Platform Architecture — SIH26044

## Overview
SIH26044 is an AI-powered Academia–Industry Skill Intelligence & Collaboration Platform built for the Ministry of Ayush. The platform implements the 6-stage core workflow:
`ASSESS → PROFILE → MAP → IDENTIFY GAPS → RECOMMEND → MATCH → APPLY → TRACK → IMPROVE`

```
                                 ┌─────────────────────────────────┐
                                 │     React Frontend (Vite)       │
                                 │  TypeScript + Tailwind CSS      │
                                 └────────────────┬────────────────┘
                                                  │ REST API (JWT)
                                 ┌────────────────▼────────────────┐
                                 │      FastAPI Web Server         │
                                 └────────┬───────────────┬────────┘
                                          │               │
                                ┌─────────▼──────┐  ┌─────▼───────────────┐
                                │ SQLAlchemy ORM │  │ Explainable ML      │
                                │ Relational DB  │  │ Skill Matcher (`ml`)│
                                └────────────────┘  └─────────────────────┘
```

## Layers

### 1. Presentation Layer (`frontend/`)
- **React 18 + Vite + TypeScript + Tailwind CSS**
- **Recharts**: Renders Radar charts for student skill profiles and bar charts for department comparisons.
- **MatchExplainerModal**: Explains exact multi-factor scores, matched skills, missing skills, and recommended actions.

### 2. Application Layer (`backend/`)
- **FastAPI**: Async REST backend providing authenticated endpoints under `/api/v1`.
- **RBAC Security**: Role-based access control protecting routes for Student, Recruiter, Faculty, and Admin.

### 3. Intelligence Layer (`ml/`)
- **Multi-Factor Scoring Engine**:
  - Required Technical Skills: 40%
  - Verified Assessment Score: 20%
  - Projects & Certifications: 15%
  - Soft Skills: 10%
  - Education & Eligibility: 10%
  - Career Interest Alignment (TF-IDF Cosine Sim): 5%
- **Skill Gap Analyzer**: Benchmarks current profile against standard target role taxonomy.

### 4. Database Layer (`backend/app/models/`)
- **SQLAlchemy ORM**: 20+ normalized relational tables storing users, profiles, skills taxonomy, question banks, opportunities, applications, courses, and audit logs.
