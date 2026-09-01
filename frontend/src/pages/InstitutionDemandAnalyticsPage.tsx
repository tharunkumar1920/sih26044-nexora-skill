import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { Layers, TrendingUp, Sparkles, BarChart3, PieChart, Building2, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const InstitutionDemandAnalyticsPage: React.FC = () => {
  const [demandData, setDemandData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    analyticsService.getIndustryDemand()
      .then(res => {
        setDemandData(res.data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !demandData) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Industry Skill Demand Analytics...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-lg space-y-2">
        <div className="inline-flex items-center space-x-2 bg-amber-900/60 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-700/50">
          <Layers className="w-3.5 h-3.5" />
          <span>Macro Skill Intelligence</span>
        </div>
        <h1 className="text-2xl font-extrabold">Industry Skill Demand Analytics</h1>
        <p className="text-xs text-slate-300">Real-time industry skill request trends, emerging domain technologies, and hiring share</p>
      </div>

      {/* Top In-Demand Skills Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <span>Most Requested Industry Skills</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {demandData.top_demanded_skills.map((item: any, idx: number) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-sm text-slate-900">{item.skill}</span>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {item.growth} YoY
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-2xl font-black text-amber-700">{item.demand_score}</span>
                <span className="text-xs text-slate-500 font-semibold">{item.open_opportunities} Open Positions</span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${item.demand_score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Emerging Skills & Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Emerging Skills Spotlight */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Emerging Domain Skill Trends</span>
            </h2>
            <p className="text-xs text-slate-500">Fastest growing skills based on recruiter job postings</p>
          </div>

          <div className="space-y-3">
            {demandData.emerging_skills.map((em: any, idx: number) => (
              <div key={idx} className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{em.skill}</h4>
                  <p className="text-[11px] text-purple-800 font-medium">Category: {em.category}</p>
                </div>
                <span className="bg-purple-700 text-white font-extrabold px-3 py-1 rounded-full shadow-sm text-xs">
                  {em.growth}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Demand Share */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-sky-600" />
              <span>Industry Sector Demand Share</span>
            </h2>
            <p className="text-xs text-slate-500">Distribution of posted opportunities by industry domain</p>
          </div>

          <div className="space-y-3">
            {demandData.sector_breakdown.map((sec: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span>{sec.sector}</span>
                  <span className="text-sky-700 font-extrabold">{sec.opportunity_share}% Share</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: `${sec.opportunity_share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
