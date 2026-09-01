import numpy as np
from typing import Dict, Any, List, Tuple
from ml.feature_engineering import FeatureExtractor
from sklearn.metrics.pairwise import cosine_similarity

class ExplainableSkillMatcher:
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "required_skills": 0.40,
            "assessment_score": 0.20,
            "projects_certs": 0.15,
            "soft_skills": 0.10,
            "education_eligibility": 0.10,
            "career_interest": 0.05
        }
        self.feature_extractor = FeatureExtractor()

    def calculate_match(self, student_data: Dict[str, Any], opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates an explainable compatibility match between a Student and an Opportunity.
        """
        student_skills_map = {
            s["name"].lower(): {
                "proficiency": s.get("proficiency_level", 50.0),
                "assessment": s.get("assessment_score", 0.0),
                "category": s.get("category_name", "Technical")
            }
            for s in student_data.get("skills", [])
        }

        req_skills = opportunity_data.get("required_skills", [])
        
        matched_skills = []
        partial_skills = []
        missing_skills = []

        total_req_weight = 0.0
        weighted_tech_score = 0.0
        weighted_assessment_score = 0.0

        for r_skill in req_skills:
            name = r_skill["name"].lower()
            min_prof = r_skill.get("min_proficiency", 60.0)
            weight = r_skill.get("weight", 1.0)
            is_req = r_skill.get("is_required", True)

            total_req_weight += weight

            if name in student_skills_map:
                s_info = student_skills_map[name]
                prof = s_info["proficiency"]
                assess = s_info["assessment"]

                # Proficiency ratio
                prof_ratio = min(prof / max(min_prof, 1.0), 1.2)
                weighted_tech_score += prof_ratio * weight * 100.0

                # Assessment component
                assess_ratio = (assess / 100.0) if assess > 0 else (prof / 100.0 * 0.8)
                weighted_assessment_score += assess_ratio * weight * 100.0

                if prof >= min_prof:
                    matched_skills.append(r_skill["name"])
                else:
                    partial_skills.append(f"{r_skill['name']} ({int(prof)}% vs {int(min_prof)}% required)")
            else:
                missing_skills.append(r_skill["name"])
                if not is_req:
                    weighted_tech_score += 0.2 * weight * 100.0

        tech_compat = (weighted_tech_score / total_req_weight) if total_req_weight > 0 else 70.0
        tech_compat = min(max(tech_compat, 0.0), 100.0)

        assess_compat = (weighted_assessment_score / total_req_weight) if total_req_weight > 0 else 60.0
        assess_compat = min(max(assess_compat, 0.0), 100.0)

        # Soft skills score
        soft_skills = [s for s in student_data.get("skills", []) if s.get("category_name") == "Soft Skill"]
        soft_score = np.mean([s.get("proficiency_level", 70.0) for s in soft_skills]) if soft_skills else 75.0

        # Projects / Certs score
        proj_count = len(student_data.get("projects", []))
        cert_count = len(student_data.get("certifications", []))
        proj_score = min((proj_count * 25.0 + cert_count * 20.0), 100.0)
        if proj_score == 0:
            proj_score = 60.0

        # Education & Eligibility score
        edu_score = 100.0 # Eligible student default

        # Career Interest Alignment (Cosine similarity of profile text vs opportunity text)
        s_text = self.feature_extractor.build_student_profile_text(student_data)
        o_text = self.feature_extractor.build_opportunity_profile_text(opportunity_data)
        try:
            vectors = self.feature_extractor.tfidf.fit_transform([s_text, o_text])
            sim = cosine_similarity(vectors[0], vectors[1])[0][0]
            career_interest_score = float(sim * 100.0 + 50.0) # normalize 50-100
        except Exception:
            career_interest_score = 80.0
        career_interest_score = min(max(career_interest_score, 0.0), 100.0)

        # Weighted Overall Score
        overall = (
            tech_compat * self.weights["required_skills"] +
            assess_compat * self.weights["assessment_score"] +
            proj_score * self.weights["projects_certs"] +
            soft_score * self.weights["soft_skills"] +
            edu_score * self.weights["education_eligibility"] +
            career_interest_score * self.weights["career_interest"]
        )

        overall_score = round(min(max(overall, 15.0), 99.0), 1)

        # Generate Actionable Recommendation
        if missing_skills:
            rec_action = f"Complete training in missing skills: {', '.join(missing_skills[:3])}."
        elif partial_skills:
            rec_action = f"Improve proficiency in {partial_skills[0].split()[0]} via practice assessments."
        else:
            rec_action = "Strong match! Submit application immediately."

        post_improvement_role = f"Senior {opportunity_data.get('title', 'Role')}" if overall_score >= 85 else opportunity_data.get("title", "Target Role")

        return {
            "overall_match_score": overall_score,
            "score_breakdown": {
                "skill_compatibility": round(tech_compat, 1),
                "assessment": round(assess_compat, 1),
                "projects": round(proj_score, 1),
                "soft_skills": round(soft_score, 1),
                "eligibility": round(edu_score, 1),
                "career_interest": round(career_interest_score, 1)
            },
            "matched_skills": matched_skills,
            "partial_skills": partial_skills,
            "missing_skills": missing_skills,
            "recommended_action": rec_action,
            "suitable_opportunity_after_improvement": post_improvement_role
        }
