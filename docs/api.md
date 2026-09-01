# REST API Reference — SIH26044

All endpoints are hosted under `/api/v1`. Interactive Swagger UI documentation is available at `http://127.0.0.1:8000/docs`.

## Authentication (`/api/v1/auth`)
- `POST /auth/register`: Register new user (Student, Recruiter, Faculty, Admin).
- `POST /auth/login`: Authenticate and obtain JWT access token.
- `GET /auth/me`: Fetch current active user profile.

## Student Management (`/api/v1/students`)
- `GET /students/profile`: Get student profile, verified skills, projects, certifications.
- `PUT /students/profile`: Update bio, target role, graduation year, CGPA.
- `POST /students/skills`: Update skill self-reported proficiency level.
- `POST /students/projects`: Add technical project.
- `POST /students/certifications`: Add verified certification badge.
- `GET /students/applications`: Track submitted applications and status updates.

## Skill Intelligence & Recommendations (`/api/v1/recommendations`)
- `GET /recommendations/skill-gaps`: Fetch identified skill gaps for active target role.
- `GET /recommendations/courses`: Fetch recommended courses for bridging gaps.
- `GET /recommendations/opportunities`: Get internships/jobs ranked by ML match score.
- `GET /recommendations/match-explain/{opp_id}`: Get explainable 6-factor match breakdown.

## Skill Assessment Engine (`/api/v1/assessments`)
- `GET /assessments/questions/{skill_id}`: Fetch timed quiz question bank.
- `POST /assessments/submit`: Submit quiz answers, calculate score, update verified skill level.
- `GET /assessments/history`: Get historical quiz score timeline.

## Recruiter Intelligence (`/api/v1/recruiter`)
- `GET /recruiter/company`: Fetch company profile.
- `GET /recruiter/opportunities`: List recruiter posted opportunities.
- `GET /recruiter/matches/{opp_id}`: Get "Best Matched Candidates" with explainable fit scores.
- `PUT /recruiter/applications/{app_id}/status`: Shortlist or reject candidates.

## Institution & Admin (`/api/v1/institution`)
- `GET /institution/analytics`: Fetch placement metrics, department readiness, top gaps.
- `GET /institution/skills`: List skills taxonomy.
- `POST /institution/skills`: Add new skill to taxonomy.
