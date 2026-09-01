import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sih_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data: any) => api.put('/students/profile', data),
  updateSkill: (skill_id: number, proficiency_level: number) => api.post('/students/skills', { skill_id, proficiency_level }),
  addProject: (data: any) => api.post('/students/projects', data),
  addCertification: (data: any) => api.post('/students/certifications', data),
  getApplications: () => api.get('/students/applications'),
  onboard: (description: string) => api.post('/students/onboard', { description }),
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const opportunityService = {
  list: (params?: any) => api.get('/opportunities', { params }),
  getDetail: (id: number) => api.get(`/opportunities/${id}`),
  create: (data: any) => api.post('/opportunities', data),
  apply: (opportunity_id: number) => api.post('/opportunities/apply', { opportunity_id }),
};

export const assessmentService = {
  getQuestions: (skill_id: number) => api.get(`/assessments/questions/${skill_id}`),
  submit: (skill_id: number, answers: Record<number, string>) => api.post('/assessments/submit', { skill_id, answers }),
  getHistory: () => api.get('/assessments/history'),
};

export const recommendationService = {
  getSkillGaps: () => api.get('/recommendations/skill-gaps'),
  getCourses: () => api.get('/recommendations/courses'),
  getCareers: () => api.get('/recommendations/careers'),
  getOpportunities: () => api.get('/recommendations/opportunities'),
  matchJobs: (data?: { description?: string; top_k?: number }) => api.post('/recommendations/match-jobs', data || {}),
  getMatchExplanation: (opp_id: number) => api.get(`/recommendations/match-explain/${opp_id}`),
};

export const recruiterService = {
  getCompany: () => api.get('/recruiter/company'),
  getOpportunities: () => api.get('/recruiter/opportunities'),
  getMatches: (opp_id: number) => api.get(`/recruiter/matches/${opp_id}`),
  updateStatus: (app_id: number, status: string) => api.put(`/recruiter/applications/${app_id}/status`, { status }),
};

export const facultyService = {
  getProfile: () => api.get('/faculty/profile'),
  getCollaborations: (type?: string) => api.get('/faculty/collaborations', { params: { type } }),
  createCollaboration: (data: any) => api.post('/faculty/collaborations', null, { params: data }),
};

export const institutionService = {
  getAnalytics: () => api.get('/institution/analytics'),
  getSkills: () => api.get('/institution/skills'),
  createSkill: (data: any) => api.post('/institution/skills', data),
  getQuestions: () => api.get('/institution/questions'),
  createQuestion: (data: any) => api.post('/institution/questions', null, { params: data }),
};

export const analyticsService = {
  getIndustryDemand: () => api.get('/analytics/industry-demand'),
};

// ─── Test Room Service ──────────────────────────────────────────────────────────

export const testRoomService = {
  // Recruiter endpoints
  create: (data: { title: string; description?: string; skill_ids: number[]; num_questions: number; duration_minutes: number }) =>
    api.post('/test-rooms/create', data),
  getMyRooms: () => api.get('/test-rooms/my-rooms'),
  getRoomResults: (roomCode: string) => api.get(`/test-rooms/${roomCode}/results`),
  closeRoom: (roomCode: string) => api.put(`/test-rooms/${roomCode}/close`),

  // Student & shared endpoints
  getRoomDetails: (roomCode: string) => api.get(`/test-rooms/${roomCode}`),
  joinRoom: (roomCode: string) => api.post(`/test-rooms/${roomCode}/join`),
  getRoomQuestions: (roomCode: string) => api.get(`/test-rooms/${roomCode}/questions`),
  submitRoom: (roomCode: string, answers: Record<number, string>) =>
    api.post(`/test-rooms/${roomCode}/submit`, { answers }),
};
