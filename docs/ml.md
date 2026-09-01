# Machine Learning & Skill Intelligence Engine — SIH26044

## Core Concept
The ML module (`ml/`) replaces opaque percentage generators with an **Explainable Multi-Factor Skill Matching Engine**.

## Architecture & Algorithms

### 1. Multi-Factor Hybrid Weighting
Match score is computed via a transparent weighted formula:
- **Required Technical Requisites (40%)**: Skill proficiency ratio against opportunity min proficiency requirement.
- **Verified Assessment Performance (20%)**: Quiz assessment verification score.
- **Projects & Certifications (15%)**: Weight of student project repository and external credentials.
- **Soft Skills (10%)**: Communication, Problem Solving, Leadership ratings.
- **Education & Eligibility (10%)**: Degree, CGPA, graduation year eligibility.
- **Career Interest Alignment (5%)**: TF-IDF Cosine Similarity between student profile text and opportunity description.

### 2. Explainable Output Breakdown
Every prediction returns:
- `overall_match_score` (e.g. 91.4%)
- `score_breakdown`: Granular 6-factor score dictionary.
- `matched_skills`: List of skills meeting or exceeding requirement.
- `partial_skills`: Skills requiring minor proficiency boost.
- `missing_skills`: Requisite skill gaps.
- `recommended_action`: Direct, actionable feedback for the student.

### 3. Skill Gap Analysis & Recommendation Engine (`ml/recommendation_engine.py`)
- Benchmarks student skill vector against target career role standards (`Data Analyst`, `Python Developer`, `ML Engineer`, `Ayush Health Data Specialist`).
- Categorizes gaps into `HIGH` and `MEDIUM` priority and automatically maps relevant learning courses (`courses` table).
