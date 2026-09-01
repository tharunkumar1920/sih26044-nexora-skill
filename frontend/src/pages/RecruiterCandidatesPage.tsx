import React, { useState, useEffect } from 'react';
import { recruiterService } from '../services/api';
import { Users, Sparkles, CheckCircle2, XCircle, Building2, Briefcase, Award, ShieldCheck } from 'lucide-react';

export const RecruiterCandidatesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCandidatesData = async () => {
    setLoading(true);
    try {
      const oppsRes = await recruiterService.getOpportunities();
      setOpportunities(oppsRes.data || []);

      if (oppsRes.data.length > 0) {
        const firstOppId = oppsRes.data[0].id;
        setSelectedOppId(firstOppId);
        const matchesRes = await recruiterService.getMatches(firstOppId);
        setCandidates(matchesRes.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidatesData();
  }, []);

  const handleSelectOpp = async (oppId: number) => {
    setSelectedOppId(oppId);
    try {
      const res = await recruiterService.getMatches(oppId);
      setCandidates(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      await recruiterService.updateStatus(appId, newStatus);
      if (selectedOppId) handleSelectOpp(selectedOppId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Candidate Fit Intelligence...</div>;
  }

  const selectedOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 shadow-lg space-y-2">
        <div className="inline-flex items-center space-x-2 bg-sky-900/60 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-700/50">
          <Users className="w-3.5 h-3.5" />
          <span>Candidate Match & Selection Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold">Best Matched Candidates</h1>
        <p className="text-xs text-slate-300">Candidates ranked by explainable multi-factor skill compatibility engine</p>
      </div>

      {/* Opportunity Selector Tabs */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Opportunity to View Candidate Matches:</div>
        <div className="flex flex-wrap gap-2">
          {opportunities.map((opp) => {
            const isSelected = selectedOppId === opp.id;
            return (
              <button
                key={opp.id}
                onClick={() => handleSelectOpp(opp.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{opp.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                  isSelected ? 'bg-sky-800 text-sky-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {opp.applications_count} Applicants
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-ayush-600" />
            <span>Ranked Candidates for "{selectedOpp?.title}"</span>
          </h2>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
            No candidate applications recorded yet for this opportunity.
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((cand, idx) => {
              const breakdown = cand.match_breakdown;
              return (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
                  
                  {/* Candidate Header & Status Action */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-lg text-slate-900">{cand.student_name}</span>
                        <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                          {cand.match_score}% Fit Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {cand.degree} • {cand.college_name} (CGPA: {cand.cgpa}) • Target Role: {cand.target_role}
                      </p>
                    </div>

                    {/* Shortlist / Reject Action Buttons */}
                    <div>
                      {cand.application_id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(cand.application_id, 'shortlisted')}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
                          >
                            Shortlist Candidate
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(cand.application_id, 'rejected')}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs px-3 py-2 rounded-xl transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          Eligible Pool Candidate
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-Factor Score Breakdown */}
                  {breakdown && breakdown.score_breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Skill Requisites</span>
                        <span className="font-bold text-slate-900">{breakdown.score_breakdown.skill_compatibility}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Assessment Score</span>
                        <span className="font-bold text-slate-900">{breakdown.score_breakdown.assessment}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Projects & Certs</span>
                        <span className="font-bold text-slate-900">{breakdown.score_breakdown.projects}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Eligibility</span>
                        <span className="font-bold text-slate-900">{breakdown.score_breakdown.eligibility}%</span>
                      </div>
                    </div>
                  )}

                  {/* Explainable Skill Match Analysis */}
                  {breakdown && (
                    <div className="bg-ayush-50/60 p-4 rounded-2xl border border-ayush-200 text-xs space-y-2">
                      <div className="font-bold text-ayush-900 flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-ayush-700" />
                        <span>Explainable Match Reasons for "{selectedOpp?.title}":</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {breakdown.matched_skills.map((s: string, i: number) => (
                          <span key={i} className="bg-emerald-100 text-emerald-900 font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                            ✓ Matched: {s}
                          </span>
                        ))}
                        {breakdown.missing_skills.map((s: string, i: number) => (
                          <span key={i} className="bg-rose-100 text-rose-900 font-semibold px-2.5 py-1 rounded-lg border border-rose-200">
                            ✕ Missing: {s}
                          </span>
                        ))}
                      </div>
                      {breakdown.recommended_action && (
                        <p className="text-[11px] text-slate-600 pt-1 font-medium">
                          <strong>Action Plan: </strong>"{breakdown.recommended_action}"
                        </p>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
