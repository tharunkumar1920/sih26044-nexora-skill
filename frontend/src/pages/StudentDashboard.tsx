import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService, recommendationService, opportunityService } from '../services/api';
import { StudentProfile, SkillGapAnalysis, Course, Opportunity, MatchExplanation } from '../types';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { MatchExplainerModal } from '../components/MatchExplainerModal';
import { AssessmentQuizRunner } from '../components/AssessmentQuizRunner';
import { 
  Award, Target, Briefcase, BookOpen, Sparkles, CheckCircle2, 
  AlertTriangle, ArrowRight, ExternalLink, RefreshCw, Layers,
  FileText, Zap, ChevronRight, User
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [matchModalOpen, setMatchModalOpen] = useState<boolean>(false);
  const [quizModalOpen, setQuizModalOpen] = useState<boolean>(false);
  const [activeQuizSkill, setActiveQuizSkill] = useState<{ id: number; name: string }>({ id: 1, name: 'Python' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, gapsRes, courseRes, oppRes] = await Promise.all([
        studentService.getProfile(),
        recommendationService.getSkillGaps().catch(() => ({ data: null })),
        recommendationService.getCourses().catch(() => ({ data: [] })),
        recommendationService.getOpportunities().catch(() => ({ data: [] }))
      ]);

      setProfile(profRes.data);
      setSkillGaps(gapsRes.data);
      setCourses(courseRes.data || []);
      setOpportunities(oppRes.data || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenMatchExplanation = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setMatchModalOpen(true);
  };

  const handleOpenQuiz = (skillId: number, skillName: string) => {
    setActiveQuizSkill({ id: skillId, name: skillName });
    setQuizModalOpen(true);
  };

  const handleApplyOpportunity = async (oppId: number) => {
    try {
      await opportunityService.apply(oppId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="p-8 text-center py-24 text-slate-500 font-medium">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading Skill Intelligence Dashboard...</p>
      </div>
    );
  }

  const isFreshProfile = !profile.skills || profile.skills.length === 0 || profile.readiness_score === 0;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* First-Time / Incomplete Profile AI Onboarding Banner */}
      {isFreshProfile && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Resume Analysis Available</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Your Skill Profile is currently uninitialized</h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Upload or paste your resume / bio. Our AI will automatically extract your technical & soft skills, estimate your proficiency, and benchmark you against industry roles.
            </p>
          </div>

          <button
            onClick={() => navigate('/onboard')}
            className="z-10 flex-shrink-0 flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg transition-all transform hover:scale-105 text-xs uppercase tracking-wider"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start AI Profile Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role: {profile.target_role || 'Not Set Yet'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {profile.full_name}!</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {profile.degree || 'Degree not specified'} • {profile.college_name || 'Institution not specified'} (CGPA: {profile.cgpa || 0.0})
          </p>
        </div>

        {/* Readiness Score Badge */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl flex items-center space-x-4 min-w-[220px]">
          <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {Math.round(profile.readiness_score || 0)}%
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Career Readiness</div>
            <div className="text-xs text-slate-300">
              {profile.readiness_score > 0 ? 'Benchmarked Match' : 'Run AI Analysis to calculate'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Skill Matrix & Gap Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Skill Matrix */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Skill Profile & Verification Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">Verified scores against role benchmark requirements</p>
            </div>
            
            {profile.skills && profile.skills.length > 0 ? (
              <button
                onClick={() => handleOpenQuiz(profile.skills[0]?.skill_id || 1, profile.skills[0]?.skill_name || 'Skill')}
                className="text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all flex items-center space-x-1"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Skills</span>
              </button>
            ) : (
              <Link
                to="/onboard"
                className="text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extract via AI</span>
              </Link>
            )}
          </div>

          {profile.skills && profile.skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <SkillRadarChart skills={profile.skills} targetRole={profile.target_role || 'Target Role'} />

              {/* Skills List */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skill Breakdown ({profile.skills.length} Detected)</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {profile.skills.map((s) => (
                    <div key={s.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{s.skill_name}</span>
                        {s.verified ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Verified</span>
                        ) : (
                          <span className="bg-slate-200 text-slate-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">Estimated</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-700">{Math.round(s.proficiency_level)}%</span>
                        <button
                          onClick={() => handleOpenQuiz(s.skill_id, s.skill_name)}
                          className="text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          Assess
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-xl">
                📊
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">No Skills Recorded Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Paste your resume or description using our AI Parser to populate your skills matrix automatically.
                </p>
              </div>
              <button
                onClick={() => navigate('/onboard')}
                className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run AI Resume Parser</span>
              </button>
            </div>
          )}
        </div>

        {/* Skill Gap Analysis Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-rose-600" />
              <span>Skill Gap Diagnostics</span>
            </h2>
            <p className="text-xs text-slate-500">Target Role: <strong>{profile.target_role || 'General Industry Benchmark'}</strong></p>
          </div>

          {!skillGaps || skillGaps.skill_gaps.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="text-2xl">🎯</div>
              <p className="text-xs font-semibold text-slate-700">
                {profile.skills && profile.skills.length > 0 
                  ? 'No critical skill gaps detected for current target role!'
                  : 'Complete AI profile onboarding to run gap diagnostics.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {skillGaps.skill_gaps.map((gap, i) => (
                <div key={i} className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{gap.skill_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      gap.priority === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {gap.priority} GAP
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                    <span>Current: {Math.round(gap.current_score)}%</span>
                    <span>Required: {gap.required_score}%</span>
                  </div>
                  {gap.recommended_course && (
                    <div className="pt-1.5 border-t border-rose-200/60 text-xs">
                      <a
                        href={gap.course_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-800 font-semibold hover:underline flex items-center space-x-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{gap.recommended_course}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Explainable Opportunity Recommendations */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-emerald-700" />
              <span>Recommended Opportunities & Match Explanations</span>
            </h2>
            <p className="text-xs text-slate-500">Live AI matching scored transparently based on your verified skills</p>
          </div>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            No open opportunities found at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => {
              const matchScore = Math.round(opp.match_score || 0);
              return (
                <div key={opp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {opp.type}
                      </span>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        matchScore >= 70 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                          : matchScore >= 40 
                          ? 'bg-amber-100 text-amber-900 border-amber-300' 
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {matchScore}% Match
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                      <p className="text-xs text-slate-500">{opp.company_name} • {opp.location}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.required_skills?.slice(0, 4).map((s) => (
                        <span key={s.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Match Explainer Drawer Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenMatchExplanation(opp)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why {matchScore}% Match?</span>
                    </button>

                    <button
                      onClick={() => handleApplyOpportunity(opp.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Apply Now
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Learning Courses */}
      {courses.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>Recommended Courses for Skill Improvement</span>
            </h2>
            <p className="text-xs text-slate-500">Curated to bridge your identified skill gaps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {courses.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-50 hover:bg-emerald-50/60 rounded-2xl border border-slate-200 transition-all space-y-2 block"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {c.skill_name}
                  </span>
                  <span className="text-xs font-bold text-amber-600">★ {c.rating}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-2">{c.title}</h4>
                <p className="text-[11px] text-slate-500">{c.provider} • {c.duration_hours}h</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Match Explainer Modal */}
      {selectedOpp && (
        <MatchExplainerModal
          isOpen={matchModalOpen}
          onClose={() => setMatchModalOpen(false)}
          opportunity={selectedOpp}
          matchExplanation={selectedOpp.match_breakdown || null}
          onApply={() => handleApplyOpportunity(selectedOpp.id)}
        />
      )}

      {/* Quiz Runner Modal */}
      <AssessmentQuizRunner
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        skillId={activeQuizSkill.id}
        skillName={activeQuizSkill.name}
        onCompleted={fetchData}
      />

    </div>
  );
};
