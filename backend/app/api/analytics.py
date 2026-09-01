from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/analytics", tags=["Industry Skill Demand Analytics"])

@router.get("/industry-demand")
def get_industry_demand_analytics():
    return {
        "top_demanded_skills": [
            {"skill": "Python", "demand_score": 95, "growth": "+15%", "open_opportunities": 42},
            {"skill": "SQL & Data Engineering", "demand_score": 88, "growth": "+12%", "open_opportunities": 38},
            {"skill": "Ayush Herbal Data Analytics", "demand_score": 85, "growth": "+32%", "open_opportunities": 28},
            {"skill": "Machine Learning / AI", "demand_score": 82, "growth": "+24%", "open_opportunities": 31},
            {"skill": "Cloud Infrastructure", "demand_score": 78, "growth": "+18%", "open_opportunities": 25},
            {"skill": "Git & Version Control", "demand_score": 72, "growth": "+8%", "open_opportunities": 45}
        ],
        "emerging_skills": [
            {"skill": "Ayush Bioinformatics", "growth": "+45%", "category": "Ayush Tech"},
            {"skill": "LLM Fine-Tuning & RAG", "growth": "+38%", "category": "AI / ML"},
            {"skill": "Clinical Trial Data Mining", "growth": "+30%", "category": "Health Data"}
        ],
        "sector_breakdown": [
            {"sector": "Ayush & Health Tech", "opportunity_share": 35},
            {"sector": "AI & Data Analytics", "opportunity_share": 30},
            {"sector": "Software & Web Development", "opportunity_share": 20},
            {"sector": "Cloud & Cybersecurity", "opportunity_share": 15}
        ]
    }
