from typing import List, Dict, Any

class SkillRecommendationEngine:
    # Standard Role Definitions & Requirements
    CAREER_ROLES_TAXONOMY = {
        "Data Analyst": {
            "Python": 75, "SQL": 80, "Statistics": 70, "Excel": 65, "Data Visualization": 70, "Communication": 75
        },
        "Python Developer": {
            "Python": 85, "SQL": 65, "Git": 70, "Data Structures": 75, "Algorithms": 70, "Problem Solving": 80
        },
        "ML Engineer": {
            "Python": 85, "Machine Learning": 80, "SQL": 70, "Artificial Intelligence": 75, "Data Structures": 75, "Git": 65
        },
        "Ayush Health Data Specialist": {
            "Python": 70, "Ayush Herbal Data": 80, "Data Science": 75, "SQL": 65, "Research Methods": 70
        },
        "Cloud & DevOps Intern": {
            "Cloud": 75, "Git": 80, "Linux": 70, "Python": 60, "Cybersecurity": 60
        }
    }

    def analyze_skill_gaps(self, student_skills: List[Dict[str, Any]], target_role: str) -> Dict[str, Any]:
        """
        Calculates Skill Gaps for a given target career role.
        """
        role_reqs = self.CAREER_ROLES_TAXONOMY.get(target_role, self.CAREER_ROLES_TAXONOMY["Data Analyst"])
        s_map = {s["name"].lower(): s.get("proficiency_level", 50.0) for s in student_skills}

        strong = []
        moderate = []
        gaps = []

        for req_skill, req_score in role_reqs.items():
            current_score = s_map.get(req_skill.lower(), 0.0)
            diff = req_score - current_score

            if diff <= 0:
                strong.append(req_skill)
            elif diff <= 20:
                moderate.append(req_skill)
            else:
                priority = "HIGH" if diff >= 35 else "MEDIUM"
                gaps.append({
                    "skill_name": req_skill,
                    "required_score": req_score,
                    "current_score": current_score,
                    "gap": diff,
                    "priority": priority,
                    "recommended_course": f"{req_skill} Masterclass & Analytics",
                    "course_url": f"https://swayam.gov.in/courses?q={req_skill.lower()}"
                })

        # Sort gaps by priority and gap size
        gaps.sort(key=lambda x: x["gap"], reverse=True)

        return {
            "target_role": target_role,
            "strong_skills": strong,
            "moderate_skills": moderate,
            "skill_gaps": gaps
        }

    def recommend_career_roles(self, student_skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Recommends career paths for undecided students based on skill matrix.
        """
        s_map = {s["name"].lower(): s.get("proficiency_level", 50.0) for s in student_skills}
        recommendations = []

        for role_name, reqs in self.CAREER_ROLES_TAXONOMY.items():
            total_req = len(reqs)
            score_sum = 0.0
            reasons = []

            for s_name, s_min in reqs.items():
                cur = s_map.get(s_name.lower(), 0.0)
                fit = min(cur / s_min, 1.0)
                score_sum += fit
                if cur >= s_min:
                    reasons.append(f"Strong in {s_name}")

            match_pct = round((score_sum / total_req) * 100.0, 1)
            match_pct = min(max(match_pct, 40.0), 96.0)

            recommendations.append({
                "role": role_name,
                "match_percentage": match_pct,
                "reasons": reasons[:3] if reasons else ["Good foundation across key domain subjects"]
            })

        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recommendations
