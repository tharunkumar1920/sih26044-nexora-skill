import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, studentService } from '../services/api';
import { SkillGapAnalysis, Course } from '../types';
import { Target, BookOpen, ExternalLink, Award, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const SkillGapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [skillGaps, setSkillGaps] = useState<SkillGapAnalysis | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gapsRes, courseRes, profRes] = await Promise.all([
          recommendationService.getSkillGaps(),
          recommendationService.getCourses(),
          studentService.getProfile()
        ]);
        setSkillGaps(gapsRes.data);
        setCourses(courseRes.data);
        setProfile(profRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !skillGaps) {
    return (
      <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">
        Analyzing Target Role Skill Gaps & Curating Recommended Courses...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-rose-900/60 text-rose-200 text-xs font-semibold px-3 py-1 rounded-full border border-rose-700/50">
            <Target className="w-3.5 h-3.5" />
            <span>Target Role Benchmarking</span>
          </div>
          <h1 className="text-2xl font-extrabold">Skill Gap Intelligence & Action Plan</h1>
          <p className="text-xs text-slate-300">Comparing your skill matrix against <strong>{skillGaps.target_role}</strong> industry requirements</p>
        </div>

        <button
          onClick={() => navigate('/assessment')}
          className="bg-ayush-700 hover:bg-ayush-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <Award className="w-4 h-4" />
          <span>Verify & Bridge Gaps</span>
        </button>
      </div>

      {/* Strong vs Moderate vs Skill Gaps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strong Skills */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Strong Requisites Met ({skillGaps.strong_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGaps.strong_skills.map((s, i) => (
              <span key={i} className="bg-emerald-50 text-emerald-900 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-200">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Moderate Skills */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-800 text-sm font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Moderate Skills ({skillGaps.moderate_skills.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGaps.moderate_skills.map((s, i) => (
              <span key={i} className="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-1 rounded-xl border border-amber-200">
                ⚡ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Identified Gaps Count */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-rose-800 text-sm font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>High/Medium Skill Gaps ({skillGaps.skill_gaps.length})</span>
          </div>
          <div className="text-xs text-slate-600">
            {skillGaps.skill_gaps.length > 0 ? (
              <span className="text-rose-700 font-bold">Action required in {skillGaps.skill_gaps.map(g => g.skill_name).join(', ')}</span>
            ) : (
              <span className="text-emerald-700 font-bold">All requisites met for {skillGaps.target_role}!</span>
            )}
          </div>
        </div>

      </div>

      {/* Detailed Skill Gap Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Priority Skill Gap Breakdown & Recommended Actions</span>
        </h2>

        <div className="space-y-4">
          {skillGaps.skill_gaps.map((item, idx) => {
            const currentPct = Math.round(item.current_score);
            const reqPct = item.required_score;
            const gapVal = Math.round(item.gap);

            return (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-extrabold text-base">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{item.skill_name}</h3>
                      <p className="text-xs text-slate-500">Target Role Benchmark: {skillGaps.target_role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    }`}>
                      {item.priority} PRIORITY GAP (-{gapVal}%)
                    </span>
                  </div>
                </div>

                {/* Score Comparison Visual Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Current Proficiency: <strong className="text-slate-900">{currentPct}%</strong></span>
                    <span>Required Benchmark: <strong className="text-ayush-800">{reqPct}%</strong></span>
                  </div>

                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                    <div
                      className="bg-slate-400 h-full absolute left-0 top-0 rounded-full"
                      style={{ width: `${currentPct}%` }}
                    />
                    <div
                      className="bg-ayush-600 h-full absolute left-0 top-0 rounded-full opacity-40"
                      style={{ width: `${reqPct}%` }}
                    />
                  </div>
                </div>

                {/* Skill Explanation & Recommended Learning Course */}
                <div className="bg-ayush-50/70 p-4.5 rounded-2xl border border-ayush-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-ayush-900 flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-ayush-700" />
                      <span>Recommended Learning Action:</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Enroll in <strong>"{item.recommended_course}"</strong> to bridge your {gapVal}% gap.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={item.course_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-ayush-700 hover:bg-ayush-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1"
                    >
                      <span>Start Learning</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => navigate('/assessment')}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Take Quiz
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
