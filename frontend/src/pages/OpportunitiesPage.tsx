import React, { useState, useEffect } from 'react';
import { opportunityService, recommendationService } from '../services/api';
import { Opportunity } from '../types';
import { MatchExplainerModal } from '../components/MatchExplainerModal';
import { Search, Filter, Briefcase, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [modeFilter, setModeFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [matchModalOpen, setMatchModalOpen] = useState<boolean>(false);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await recommendationService.getOpportunities();
      setOpportunities(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const filteredOpps = opportunities.filter((o) => {
    const matchesQuery = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || o.type === typeFilter;
    const matchesMode = !modeFilter || o.work_mode === modeFilter;
    return matchesQuery && matchesType && matchesMode;
  });

  const handleOpenMatchExplanation = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setMatchModalOpen(true);
  };

  const handleApply = async (id: number) => {
    try {
      await opportunityService.apply(id);
      fetchOpps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          <span>Industry Internships & Job Opportunities</span>
        </h1>
        <p className="text-xs text-slate-500">Explore openings mapped directly to your skill matrix and target career roles</p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by role title, skill, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">All Opportunity Types</option>
            <option value="internship">Internships</option>
            <option value="job">Full-Time Jobs</option>
            <option value="project">Live Projects</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 outline-none"
          >
            <option value="">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

      </div>

      {/* Opportunity Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-medium animate-pulse">Loading Opportunities...</div>
      ) : filteredOpps.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No opportunities match the selected filters</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpps.map((opp) => (
            <div key={opp.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {opp.type}
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                    {Math.round(opp.match_score || 0)}% Match
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.company_name} • {opp.location} ({opp.work_mode})</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                <div className="text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  Stipend: <strong className="text-emerald-800">{opp.stipend_or_salary}</strong> • Duration: {opp.duration}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenMatchExplanation(opp)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why {Math.round(opp.match_score || 0)}% Match?</span>
                </button>

                <button
                  onClick={() => handleApply(opp.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  Apply Now
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Match Explainer Modal */}
      {selectedOpp && (
        <MatchExplainerModal
          isOpen={matchModalOpen}
          onClose={() => setMatchModalOpen(false)}
          opportunity={selectedOpp}
          matchExplanation={selectedOpp.match_breakdown || null}
          onApply={() => handleApply(selectedOpp.id)}
        />
      )}

    </div>
  );
};
