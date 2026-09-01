import React, { useState, useEffect } from 'react';
import { institutionService, analyticsService } from '../services/api';
import { BarChart3, Database, HelpCircle, TrendingUp, Users, Plus, Award, AlertTriangle, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const InstitutionDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add Skill Modal
  const [showSkillModal, setShowSkillModal] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('LLM Fine-Tuning');
  const [newSkillCat, setNewSkillCat] = useState<string>('Technical');
  const [newSkillDesc, setNewSkillDesc] = useState<string>('Large language model adaptation and prompt engineering.');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anRes, skRes, qRes] = await Promise.all([
        institutionService.getAnalytics(),
        institutionService.getSkills(),
        institutionService.getQuestions()
      ]);
      setAnalytics(anRes.data);
      setSkills(skRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await institutionService.createSkill({
        name: newSkillName,
        category_name: newSkillCat,
        description: newSkillDesc
      });
      setShowSkillModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !analytics) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Institution & Admin Analytics...</div>;
  }

  const deptChartData = analytics.department_readiness || [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-900/60 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-700/50">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Central Ministry of Ayush Skill Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold">Institution Analytics & Governance</h1>
          <p className="text-xs text-slate-300">Monitor skill readiness, placement trends, gap distributions, and taxonomy</p>
        </div>

        <button
          onClick={() => setShowSkillModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill to Taxonomy</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Students', val: analytics.total_students, color: 'text-slate-900', icon: Users },
          { label: 'Assessed Students', val: analytics.students_assessed, color: 'text-emerald-700', icon: Award },
          { label: 'Avg Skill Score', val: `${analytics.average_skill_score}%`, color: 'text-sky-700', icon: Sparkles },
          { label: 'Internship Participation', val: `${analytics.internship_participation_rate}%`, color: 'text-purple-700', icon: TrendingUp },
          { label: 'Placement Readiness', val: `${analytics.placement_readiness_rate}%`, color: 'text-amber-700', icon: BarChart3 },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>{item.label}</span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className={`text-2xl font-extrabold ${item.color}`}>{item.val}</div>
            </div>
          );
        })}
      </div>

      {/* Main Section: Department Comparison & Skill Gap Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Readiness Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-ayush-700" />
              <span>Department Readiness Comparison</span>
            </h2>
            <p className="text-xs text-slate-500">Average readiness score across CS, Ayush Informatics, IT & Bio-Tech</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="readiness" radius={[6, 6, 0, 0]}>
                  {deptChartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : (index === 1 ? '#0284c7' : '#9333ea')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Skill Gaps in Institution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Top Institution Skill Gaps</span>
            </h2>
            <p className="text-xs text-slate-500">Skills requiring curriculum enhancement based on student assessments</p>
          </div>

          <div className="space-y-3">
            {analytics.top_skill_gaps.map((gap: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">{gap.skill_name}</span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {gap.affected_students_pct}% Students Affected
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: `${gap.affected_students_pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Industry Skill Demand Trends */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            <span>Industry Skill Demand Trends</span>
          </h2>
          <p className="text-xs text-slate-500">Most requested technical and domain skills from industry recruiters</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {analytics.industry_demanded_skills.map((sk: any, i: number) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-center">
              <div className="text-xs font-bold text-slate-900">{sk.skill_name}</div>
              <div className="text-xl font-extrabold text-sky-700">{sk.demand_index} Index</div>
              <div className="text-[10px] font-bold text-emerald-600">{sk.growth} YoY</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Skill to Taxonomy</h3>
            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Soft Skill">Soft Skill</option>
                  <option value="Ayush Domain">Ayush Domain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none h-20"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
