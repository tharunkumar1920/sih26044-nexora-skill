import json
from sqlalchemy.orm import Session
from app.models.models import Student, StudentSkill, AssessmentQuestion, AssessmentResult, Skill

class AssessmentService:
    def submit_assessment(self, db: Session, student: Student, skill_id: int, answers: dict) -> dict:
        """
        Processes student quiz answers, calculates percentage score, records history,
        and updates the student's verified assessment score in student_skills.
        """
        questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.skill_id == skill_id).all()
        if not questions:
            # Fallback if specific skill questions aren't seeded
            questions = db.query(AssessmentQuestion).limit(5).all()

        total_questions = len(questions)
        correct_count = 0

        for q in questions:
            submitted_ans = str(answers.get(q.id, "")).strip().lower()
            correct_ans = str(q.correct_answer).strip().lower()
            if submitted_ans == correct_ans:
                correct_count += 1

        score_pct = round((correct_count / max(total_questions, 1)) * 100.0, 1)

        # 1. Record Assessment Result History
        result = AssessmentResult(
            student_id=student.id,
            skill_id=skill_id,
            score=score_pct,
            total_questions=total_questions,
            correct_answers=correct_count
        )
        db.add(result)

        # 2. Update StudentSkill assessment_score & verified status
        st_skill = db.query(StudentSkill).filter(
            StudentSkill.student_id == student.id,
            StudentSkill.skill_id == skill_id
        ).first()

        if st_skill:
            st_skill.assessment_score = score_pct
            st_skill.proficiency_level = round(max(st_skill.proficiency_level, score_pct), 1)
            st_skill.verified = True
        else:
            st_skill = StudentSkill(
                student_id=student.id,
                skill_id=skill_id,
                proficiency_level=score_pct,
                assessment_score=score_pct,
                verified=True
            )
            db.add(st_skill)

        # 3. Update overall readiness score of student
        all_st_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
        if all_st_skills:
            avg_prof = sum([s.proficiency_level for s in all_st_skills]) / len(all_st_skills)
            student.readiness_score = round(min(max(avg_prof * 1.1, 40.0), 98.0), 1)

        db.commit()

        skill_obj = db.query(Skill).filter(Skill.id == skill_id).first()
        skill_name = skill_obj.name if skill_obj else "Skill"

        return {
            "skill_id": skill_id,
            "skill_name": skill_name,
            "score": score_pct,
            "total_questions": total_questions,
            "correct_answers": correct_count,
            "passed": score_pct >= 60.0
        }

assessment_service = AssessmentService()
