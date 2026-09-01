export type UserRole = 'student' | 'recruiter' | 'faculty' | 'institution_admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface StudentSkill {
  id: number;
  skill_id: number;
  skill_name: string;
  category_name: string;
  proficiency_level: number;
  assessment_score: number;
  verified: boolean;
}

export interface StudentProject {
  id: number;
  title: string;
  description: string;
  github_url?: string;
  live_url?: string;
  technologies: string[];
}

export interface Certification {
  id: number;
  title: string;
  issuer: string;
  issue_date?: string;
  credential_url?: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  college_name: string;
  department: string;
  degree: string;
  graduation_year: number;
  cgpa: number;
  bio?: string;
  target_role: string;
  readiness_score: number;
  is_public_portfolio: boolean;
  skills: StudentSkill[];
  projects: StudentProject[];
  certifications: Certification[];
}

export interface MatchScoreBreakdown {
  skill_compatibility: number;
  assessment: number;
  projects: number;
  soft_skills: number;
  eligibility: number;
  career_interest: number;
}

export interface MatchExplanation {
  overall_match_score: number;
  score_breakdown: MatchScoreBreakdown;
  matched_skills: string[];
  partial_skills: string[];
  missing_skills: string[];
  recommended_action: string;
  suitable_opportunity_after_improvement?: string;
}

export interface OpportunitySkill {
  id: number;
  name: string;
  min_proficiency: number;
  is_required: boolean;
}

export interface Opportunity {
  id: number;
  company_name: string;
  company_description?: string;
  title: string;
  type: string;
  description: string;
  required_education: string;
  experience_level: string;
  location: string;
  work_mode: string;
  duration: string;
  stipend_or_salary: string;
  deadline: string;
  status: string;
  required_skills: OpportunitySkill[];
  match_score?: number;
  match_breakdown?: MatchExplanation;
}

export interface SkillGapItem {
  skill_name: string;
  required_score: number;
  current_score: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommended_course: string;
  course_url: string;
}

export interface SkillGapAnalysis {
  target_role: string;
  strong_skills: string[];
  moderate_skills: string[];
  skill_gaps: SkillGapItem[];
}

export interface Course {
  id: number;
  title: string;
  provider: string;
  skill_name: string;
  target_level: string;
  url: string;
  duration_hours: number;
  rating: number;
  reason?: string;
}

export interface Application {
  id: number;
  opportunity_id: number;
  opportunity_title: string;
  company_name: string;
  student_id?: number;
  student_name?: string;
  status: string;
  match_score: number;
  applied_at: string;
  notes?: string;
}
