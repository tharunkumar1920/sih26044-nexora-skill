import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService, opportunityService } from '../services/api';
import { Application } from '../types';
import { FileCheck, Building2, Calendar, Sparkles, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    studentService.getApplications()
      .then(res => {
        setApplications(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full">Shortlisted</span>;
      case 'selected':
        return <span className="bg-ayush-700 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-sm">Selected 🎉</span>;
      case 'under_review':
        return <span className="bg-sky-100 text-sky-900 border border-sky-300 font-extrabold text-xs px-3 py-1 rounded-full">Under Review</span>;
      case 'rejected':
        return <span className="bg-rose-100 text-rose-900 border border-rose-300 font-extrabold text-xs px-3 py-1 rounded-full">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs px-3 py-1 rounded-full">Applied</span>;
    }
  };

  const getTimelineStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 1;
      case 'under_review': return 2;
      case 'shortlisted': return 3;
      case 'interview': return 4;
      case 'selected': return 5;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">
        Loading Submitted Applications & Status Tracker...
      </div>
    );
  }

  const shortlistedCount = applications.filter(a => a.status === 'shortlisted' || a.status === 'selected').length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-sky-900/60 text-sky-200 text-xs font-semibold px-3 py-1 rounded-full border border-sky-700/50">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Application Intelligence Tracker</span>
          </div>
          <h1 className="text-2xl font-extrabold">Track Submitted Applications</h1>
          <p className="text-xs text-slate-300">Monitor status progression, recruiter feedback, and fit scores for your applications</p>
        </div>

        <button
          onClick={() => navigate('/opportunities')}
          className="bg-ayush-700 hover:bg-ayush-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <span>Find More Opportunities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Total Applications</div>
          <div className="text-2xl font-extrabold text-slate-900">{applications.length}</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Shortlisted / Selected</div>
          <div className="text-2xl font-extrabold text-emerald-700">{shortlistedCount}</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Under Review</div>
          <div className="text-2xl font-extrabold text-sky-700">
            {applications.filter(a => a.status === 'under_review' || a.status === 'applied').length}
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Average Match Score</div>
          <div className="text-2xl font-extrabold text-purple-700">
            {applications.length > 0
              ? `${Math.round(applications.reduce((acc, a) => acc + a.match_score, 0) / applications.length)}%`
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
          <FileCheck className="w-5 h-5 text-sky-600" />
          <span>Active Applications & Status Timeline</span>
        </h2>

        {applications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-4">
            <p className="text-slate-500 text-sm">You haven't submitted any applications yet.</p>
            <button
              onClick={() => navigate('/opportunities')}
              className="bg-ayush-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-xs"
            >
              Browse Recommended Opportunities
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const currentStep = getTimelineStepIndex(app.status);
              const steps = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

              return (
                <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-5">
                  
                  {/* Top Row: Opportunity Info & Match Badge */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-base text-slate-900">{app.opportunity_title}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.company_name}</span>
                        <span>•</span>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200 text-center">
                      <div className="text-base font-extrabold text-emerald-800">{Math.round(app.match_score)}% Match</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Explainable AI Fit</div>
                    </div>
                  </div>

                  {/* Progress / Status Timeline Component */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Application Status Progress</div>
                    
                    <div className="grid grid-cols-5 gap-2 text-center relative">
                      {steps.map((stLabel, idx) => {
                        const stepNum = idx + 1;
                        const isCompleted = stepNum <= currentStep;
                        const isCurrent = stepNum === currentStep;

                        return (
                          <div key={idx} className="flex flex-col items-center space-y-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-200 text-slate-500'
                            } ${isCurrent ? 'ring-4 ring-emerald-100 font-extrabold' : ''}`}>
                              {isCompleted ? '✓' : stepNum}
                            </div>
                            <span className={`text-[11px] font-semibold ${
                              isCompleted ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                              {stLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Feedback if present */}
                  {app.notes && (
                    <div className="bg-ayush-50/60 p-3.5 rounded-xl border border-ayush-200 text-xs text-slate-800 flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-ayush-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-ayush-900">Recruiter Notes: </span>
                        <span>"{app.notes}"</span>
                      </div>
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
