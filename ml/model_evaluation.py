import numpy as np
from ml.sample_dataset import generate_sample_dataset
from ml.skill_matching import ExplainableSkillMatcher

def evaluate_matcher():
    """
    Evaluates the explainable skill matcher over synthetic student-opportunity pairs.
    """
    students_df, opps_df = generate_sample_dataset(50)
    matcher = ExplainableSkillMatcher()

    scores = []
    for _, s_row in students_df.iterrows():
        s_data = {
            "target_role": s_row["target_role"],
            "skills": [{"name": k, "proficiency_level": v, "category_name": "Technical"} for k, v in s_row["skills"].items()],
            "projects": [{"title": "Proj"} for _ in range(s_row["projects_count"])],
            "certifications": []
        }
        for _, o_row in opps_df.iterrows():
            o_data = {
                "title": o_row["title"],
                "required_skills": o_row["required_skills"]
            }
            res = matcher.calculate_match(s_data, o_data)
            scores.append(res["overall_match_score"])

    mean_score = float(np.mean(scores))
    std_score = float(np.std(scores))

    metrics = {
        "total_evaluations": len(scores),
        "mean_overall_match_score": round(mean_score, 2),
        "std_deviation": round(std_score, 2),
        "min_score": round(min(scores), 2),
        "max_score": round(max(scores), 2)
    }

    print("=== ML Matcher Evaluation Report ===")
    for k, v in metrics.items():
        print(f"  {k}: {v}")

    return metrics

if __name__ == "__main__":
    evaluate_matcher()
