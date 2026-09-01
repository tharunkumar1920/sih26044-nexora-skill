import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruiterService } from '../services/api';
import { Building2, Briefcase, Users, TrendingUp, Sparkles, CheckCircle2, Clock, Plus, ArrowRight, Award } from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [compRes, oppsRes] = await Promise.all([
          recruiterService.getCompany(),
          recruiterService.getOpportunities()
        ]);
        setCompany(compRes.data);
        setOpportunities(oppsRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !company) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Recruiter Overview...</div>;
  }

  const totalApplicants = opportunities.reduce((acc, o) => acc + (o.applications_count || 0), 0);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Company Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-sky-900/60 text-sky-300 text-xs font-semibold px-3 py-1 rounded-full border border-sky-700/50">
            <Building2 className="w-3.5 h-3.5" />
            <span>Recruiter Portal • Company Overview</span>
          </div>
          <h1 className="text-2xl font-extrabold">{company.name}</h1>
          <p className="text-xs text-slate-300">{company.industry_sector} • {company.location} • {company.website || 'Verified Partner'}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/recruiter/post')}
            className="bg-ayush-700 hover:bg-ayush-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Post Opportunity</span>
          </button>
          <button
            onClick={() => navigate('/recruiter/candidates')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs flex items-center space-x-2"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>View Candidates</span>
          </button>
        </div>
      </div>

      {/* Applicant Statistics & Hiring Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Active Positions</div>
          <div className="text-2xl font-extrabold text-slate-900">{opportunities.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Total Applicants</div>
          <div className="text-2xl font-extrabold text-sky-700">{totalApplicants}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Candidate Match Engine</div>
          <div className="text-2xl font-extrabold text-emerald-700">91.4% Avg Fit</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Org Status</div>
          <div className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-block mt-1">
            Verified Partner ✓
          </div>
        </div>
      </div>

      {/* Company Info & Hiring Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Company Bio */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            <span>Company Profile & Organization Info</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {company.description}
          </p>
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Sector</span>
              <span className="font-bold text-slate-800">{company.industry_sector}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
              <span className="font-bold text-slate-800">{company.location}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Website</span>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-bold text-sky-700 hover:underline">
                {company.website || 'Visit Site'}
              </a>
            </div>
          </div>
        </div>

        {/* Skill Demand Insights */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Hiring & Skill Demand Insights</span>
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">Python Data Science</span>
              <span className="text-emerald-700 font-extrabold">+24% Demand</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">Ayush Herbal Analytics</span>
              <span className="text-emerald-700 font-extrabold">+32% Growth</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-900">SQL Database Mining</span>
              <span className="text-sky-700 font-extrabold">High Requisite</span>
            </div>
          </div>
        </div>

      </div>

      {/* Posted Opportunities Summary & Recent Activity */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-sky-600" />
              <span>Posted Opportunities Summary</span>
            </h2>
            <p className="text-xs text-slate-500">Summary of active positions and applicant counts</p>
          </div>
          <button
            onClick={() => navigate('/recruiter/post')}
            className="text-xs font-bold text-sky-700 hover:underline flex items-center space-x-1"
          >
            <span>Manage All Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded uppercase">
                  {opp.type}
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  {opp.applications_count} Applicants
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{opp.title}</h3>
              <p className="text-xs text-slate-500">{opp.location} • {opp.stipend_or_salary}</p>
              <button
                onClick={() => navigate('/recruiter/candidates')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-all"
              >
                Review Candidates
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
