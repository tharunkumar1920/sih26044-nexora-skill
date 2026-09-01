import React, { useState, useEffect } from 'react';
import { recruiterService, opportunityService } from '../services/api';
import { Briefcase, Building2, Plus, Sparkles, MapPin, Calendar, Award, CheckCircle2 } from 'lucide-react';

export const RecruiterPostOpportunityPage: React.FC = () => {
  const [company, setCompany] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Opportunity Form modal
  const [showNewOppModal, setShowNewOppModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newType, setNewType] = useState<string>('internship');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newEdu, setNewEdu] = useState<string>('B.Tech / Degree in related field');
  const [newExp, setNewExp] = useState<string>('Freshers / 0-1 years');
  const [newLoc, setNewLoc] = useState<string>('Remote / Hybrid');
  const [newMode, setNewMode] = useState<string>('Remote');
  const [newDur, setNewDur] = useState<string>('3 Months');
  const [newStipend, setNewStipend] = useState<string>('Competitive / Fixed');
  const [newDeadline, setNewDeadline] = useState<string>('2026-12-31');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const [compRes, oppsRes] = await Promise.all([
        recruiterService.getCompany(),
        recruiterService.getOpportunities()
      ]);
      setCompany(compRes.data);
      setOpportunities(oppsRes.data);
      if (oppsRes.data.length > 0 && !selectedOppId) {
        setSelectedOppId(oppsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleSelectOpp = (oppId: number) => {
    setSelectedOppId(oppId);
  };

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await opportunityService.create({
        title: newTitle,
        type: newType,
        description: newDesc,
        required_education: newEdu,
        experience_level: newExp,
        location: newLoc,
        work_mode: newMode,
        duration: newDur,
        stipend_or_salary: newStipend,
        deadline: newDeadline,
        required_skills: [
          { skill_id: 1, min_proficiency: 75, is_required: true, weight: 1.2 },
          { skill_id: 2, min_proficiency: 65, is_required: true, weight: 1.0 }
        ]
      });
      setShowNewOppModal(false);
      fetchOpportunities();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !company) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Posted Opportunities Management...</div>;
  }

  const selectedOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-sky-900/60 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-700/50">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunity Management & Posting</span>
          </div>
          <h1 className="text-2xl font-extrabold">Manage Industry Positions</h1>
          <p className="text-xs text-slate-300">Create, inspect, and configure weighted skill requisites for company postings</p>
        </div>

        <button
          onClick={() => setShowNewOppModal(true)}
          className="bg-ayush-600 hover:bg-ayush-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Main Grid: Opportunities List & Opportunity Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Posted Opportunities List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-sky-600" />
              <span>Posted Opportunities ({opportunities.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Click any opportunity card below to select and view complete requisites</p>
          </div>

          <div className="space-y-3">
            {opportunities.map((opp) => {
              const isSelected = selectedOppId === opp.id;
              return (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => handleSelectOpp(opp.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all space-y-2 block cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/90 border-2 border-sky-600 shadow-md ring-2 ring-sky-500/20 font-semibold'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-extrabold text-sm text-slate-900 leading-snug">{opp.title}</span>
                    <span className="bg-sky-100 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-sky-200 shrink-0">
                      {opp.applications_count} Applicants
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex justify-between items-center font-medium">
                    <span>{opp.work_mode} • {opp.duration}</span>
                    <span className="text-emerald-700 font-bold">{opp.stipend_or_salary}</span>
                  </div>

                  {isSelected && (
                    <div className="text-[10px] text-sky-700 font-bold flex items-center space-x-1 pt-1 border-t border-sky-200/60">
                      <Sparkles className="w-3 h-3 text-sky-600" />
                      <span>Active Selected Opportunity</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Opportunity Complete Details Card */}
        <div className="lg:col-span-2">
          {selectedOpp ? (
            <div className="bg-white p-6 rounded-3xl border-2 border-sky-600/40 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-sky-100 text-sky-900 font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {selectedOpp.type}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-md">
                      Status: {selectedOpp.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">{selectedOpp.title}</h2>
                </div>

                <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-right">
                  <div className="text-xs text-slate-500 font-medium">Total Applicants</div>
                  <div className="text-lg font-extrabold text-sky-700">{selectedOpp.applications_count} Candidates</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Job Description</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  {selectedOpp.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stipend / Salary</span>
                  <span className="font-extrabold text-emerald-800">{selectedOpp.stipend_or_salary}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Location / Mode</span>
                  <span className="font-bold text-slate-800">{selectedOpp.location} ({selectedOpp.work_mode})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Duration</span>
                  <span className="font-bold text-slate-800">{selectedOpp.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Application Deadline</span>
                  <span className="font-bold text-slate-800">{selectedOpp.deadline}</span>
                </div>
              </div>

              {/* Eligibility */}
              <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-200 text-xs space-y-1">
                <span className="font-bold text-sky-950 uppercase text-[10px] tracking-wider block">Eligibility Requisites</span>
                <div className="flex flex-wrap gap-4 text-slate-700 font-medium">
                  <span>Required Education: <strong>{selectedOpp.required_education}</strong></span>
                  <span>Experience Level: <strong>{selectedOpp.experience_level}</strong></span>
                </div>
              </div>

              {/* Required & Preferred Skills Matrix */}
              {selectedOpp.required_skills && selectedOpp.required_skills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Skill Requisites Matrix</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpp.required_skills.map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                          s.is_required
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        {s.is_required ? 'Required: ' : 'Preferred: '}{s.name} (≥ {Math.round(s.min_proficiency)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              Select an opportunity from the list to view its complete details.
            </div>
          )}
        </div>

      </div>

      {/* New Opportunity Wizard Modal */}
      {showNewOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">Post New Industry Opportunity</h3>
            
            <form onSubmit={handleCreateOpp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opportunity Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Full-Time Job</option>
                    <option value="project">Live Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stipend / Salary</label>
                  <input
                    type="text"
                    value={newStipend}
                    onChange={(e) => setNewStipend(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newDur}
                    onChange={(e) => setNewDur(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOppModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ayush-700 hover:bg-ayush-800 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
