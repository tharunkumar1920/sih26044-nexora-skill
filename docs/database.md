# Database Schema & Entity Relationships — SIH26044

The platform uses a fully normalized relational database architecture built with SQLAlchemy ORM and standard migrations.

## Tables (20+ Entities)

### Core User & RBAC
- `users`: User identity, email, bcrypt hashed password, full_name, role.
- `students`: Academic profile, college, department, degree, CGPA, target role, readiness score.
- `companies`: Industry organization profile, sector, location, approval status.
- `faculty`: Academician profile, designation, department, research interests.
- `institutions`: Institutional governance profile, verification status.

### Skill Taxonomy & Assessments
- `skill_categories`: Technical, Soft Skill, Ayush Domain.
- `skills`: Extensible skill taxonomy records.
- `student_skills`: Dynamic skill proficiency level and verified assessment scores.
- `questions`: Quiz question bank (Question text, options JSON, correct answer, difficulty, weight).
- `assessment_results`: Time-stamped history of quiz scores.

### Opportunities & Applications
- `opportunities`: Internships, Jobs, Live Projects posted by industry recruiters.
- `opportunity_skills`: Weighted skill requisites per opportunity.
- `applications`: Student application tracking with status (`applied`, `under_review`, `shortlisted`, `rejected`, `selected`).

### Recommendations & Collaborations
- `courses`: Learning courses mapped to identified skill gaps.
- `certifications`: Student verified credential badges.
- `projects`: Student technical project repository.
- `collaboration_opportunities`: Faculty-Industry FDPs, Joint Research, Consultancy, Guest Lectures.
- `notifications` & `audit_logs`: Activity and alert tracking.
