import React from 'react';
import { MatchExplanation, Opportunity } from '../types';
import { X, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Award, BrainCircuit, Sparkles } from 'lucide-react';

interface MatchExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  matchExplanation: MatchExplanation | null;
  onApply?: () => void;
  isApplied?: boolean;
}

export const MatchExplainerModal: React.FC<MatchExplainerModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  matchExplanation,
  onApply,
  isApplied = false
}) => {
  if (!isOpen || !opportunity || !matchExplanation) return null;

  const { overall_match_score, score_breakdown, matched_skills, partial_skills, missing_skills, recommended_action, suitable_opportunity_after_improvement } = matchExplanation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-start border-b border-slate-800">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-ayush-700 rounded-xl text-white font-bold text-xl shadow-md">
              🌿
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold tracking-tight">{opportunity.title}</h3>
                <span className="text-xs bg-slate-800 text-ayush-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                  {opportunity.company_name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Explainable AI Compatibility & Skill Intelligence Report</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Main Compatibility Gauge & Differentiator Callout */}
          <div className="bg-gradient-to-r from-slate-50 to-ayush-50/50 p-5 rounded-2xl border border-ayush-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-xs font-bold text-ayush-800 uppercase tracking-wider flex items-center space-x-1 justify-center sm:justify-start">
                <BrainCircuit className="w-4 h-4 text-ayush-600" />
                <span>Explainable AI Match Index</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 flex items-baseline space-x-2">
                <span>{overall_match_score}%</span>
                <span className="text-sm font-semibold text-ayush-700">Overall Fit</span>
              </div>
              <p className="text-xs text-slate-600 max-w-sm">
                Calculated dynamically across 6 weighted dimensions rather than an arbitrary percentage.
              </p>
            </div>

            {/* Action Button */}
            <div>
              {onApply && (
                <button
                  onClick={onApply}
                  disabled={isApplied}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2 ${
                    isApplied
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                      : 'bg-ayush-700 hover:bg-ayush-800 text-white hover:shadow-lg'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Applied to Opportunity</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Now ({overall_match_score}% Match)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 6-Factor Score Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Multi-Factor Compatibility Breakdown</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Required Skills', val: score_breakdown.skill_compatibility, weight: '40%' },
                { label: 'Verified Assessment', val: score_breakdown.assessment, weight: '20%' },
                { label: 'Projects & Certs', val: score_breakdown.projects, weight: '15%' },
                { label: 'Soft Skills', val: score_breakdown.soft_skills, weight: '10%' },
                { label: 'Eligibility', val: score_breakdown.eligibility, weight: '10%' },
                { label: 'Career Alignment', val: score_breakdown.career_interest, weight: '5%' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
                    <span>{item.label}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">{item.weight}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{item.val}%</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-ayush-600 h-full rounded-full transition-all"
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Skill Analysis Pills */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Granular Skill Analysis</h4>
            
            {/* Matched Skills */}
            {matched_skills.length > 0 && (
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strong Matched Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matched_skills.map((s, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-900 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center space-x-1">
                      <span>✓ {s}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Partial Skills */}
            {partial_skills.length > 0 && (
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                <div className="text-xs font-bold text-amber-800 flex items-center space-x-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Partial Skill Matches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {partial_skills.map((s, i) => (
                    <span key={i} className="bg-amber-100 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-200">
                      ⚡ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {missing_skills.length > 0 && (
              <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200">
                <div className="text-xs font-bold text-rose-800 flex items-center space-x-1.5 mb-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Skill Gaps / Missing Requisites</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missing_skills.map((s, i) => (
                    <span key={i} className="bg-rose-100 text-rose-900 text-xs font-semibold px-2.5 py-1 rounded-lg border border-rose-200">
                      ✕ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Learning Path & Post-Improvement Role */}
          <div className="bg-ayush-900 text-white p-4.5 rounded-xl space-y-2.5">
            <div className="flex items-center space-x-2 text-ayush-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-ayush-400" />
              <span>Recommended Action & Outcome</span>
            </div>
            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              "{recommended_action}"
            </p>
            {suitable_opportunity_after_improvement && (
              <div className="text-xs text-ayush-200 pt-1 border-t border-slate-800 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Recommended Opportunity After Improvement: <strong className="text-white">{suitable_opportunity_after_improvement}</strong></span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm rounded-xl transition-all"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
