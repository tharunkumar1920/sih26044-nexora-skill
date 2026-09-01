import random
import pandas as pd
from typing import Tuple

def generate_sample_dataset(num_samples: int = 100) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generates synthetic realistic student and opportunity datasets for ML training & evaluation.
    """
    skills_pool = [
        "Python", "SQL", "Machine Learning", "Git", "React", "Data Structures",
        "Communication", "Ayush Herbal Data", "Cloud", "Cybersecurity", "Problem Solving"
    ]
    roles_pool = ["Data Analyst", "Python Developer", "ML Engineer", "Ayush Health Data Specialist"]

    students = []
    for i in range(num_samples):
        num_skills = random.randint(3, 7)
        s_skills = random.sample(skills_pool, num_skills)
        skill_dict = {sk: random.randint(40, 95) for sk in s_skills}
        students.append({
            "student_id": i + 1,
            "target_role": random.choice(roles_pool),
            "skills": skill_dict,
            "cgpa": round(random.uniform(6.5, 9.8), 2),
            "projects_count": random.randint(1, 4)
        })

    opportunities = []
    for j in range(20):
        opp_skills = random.sample(skills_pool, random.randint(3, 5))
        req_skills = [{"name": sk, "min_proficiency": random.randint(50, 80), "weight": 1.0} for sk in opp_skills]
        opportunities.append({
            "opportunity_id": j + 1,
            "title": f"{random.choice(roles_pool)} Internship",
            "required_skills": req_skills
        })

    return pd.DataFrame(students), pd.DataFrame(opportunities)
