import React from 'react';
import { Link } from 'react-router-dom';
import { NexoraLogo } from '../components/NexoraLogo';
import { Sparkles, Target, Award, Briefcase, BarChart3, ArrowRight, CheckCircle2, ShieldCheck, Layers, Orbit, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      
      {/* Top Bar for Landing */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <NexoraLogo size="md" subtitleText="Skill Intelligence Platform" />
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-900 transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Nexora-Skill — Next-Gen AI Skill Intelligence & Career Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-white">
            Bridging Academic Talent with <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">Industry Opportunities</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AI-powered resume extraction, skill gap diagnostics, verifiable assessments, and transparent opportunity matching for students, recruiters, faculty, and institutions.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all flex items-center space-x-2 text-sm uppercase tracking-wider"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/opportunities"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-3.5 rounded-2xl border border-slate-700 transition-all text-sm"
            >
              Explore Opportunities
            </Link>
          </div>

        </div>
      </section>

      {/* Core Workflow Steps */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Nexora Intelligence Workflow</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">The 6-Stage Skill Intelligence Cycle</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { stage: '1. PARSE', desc: 'AI resume & profile extraction', icon: Zap },
            { stage: '2. PROFILE', desc: 'Interactive radar skill matrix', icon: Layers },
            { stage: '3. MAP', desc: 'Target role benchmarking', icon: Target },
            { stage: '4. GAPS', desc: 'Priority gap identification', icon: BarChart3 },
            { stage: '5. ASSESS', desc: 'Verifiable skill tests', icon: Award },
            { stage: '6. MATCH', desc: 'Explainable fit scores', icon: Briefcase },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-2 hover:border-slate-700 transition-all">
                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-white">{item.stage}</div>
                <div className="text-[11px] text-slate-400">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stakeholder Value Proposition Grid */}
      <section className="bg-slate-900/60 py-16 px-4 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Nexora Ecosystem</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Empowering 4 Integrated Roles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-emerald-400 font-bold text-base flex items-center space-x-2">
                <span>🎓 Candidates & Students</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Build digital verified portfolios, view career readiness scores, detect skill gaps, and apply to matched internships.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-sky-400 font-bold text-base flex items-center space-x-2">
                <span>🏢 Recruiters & Industry</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Post opportunities, specify weighted skill requirements, and view best matched candidates with explainable fit reasons.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-purple-400 font-bold text-base flex items-center space-x-2">
                <span>👨‍🏫 Faculty & Mentors</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Participate in industry FDPs, consultancy, research collaborations, mentorships, and student guidance.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-amber-400 font-bold text-base flex items-center space-x-2">
                <span>🏛️ Institutions & Admins</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monitor department placement readiness, skill gap distributions, industry demand trends, and manage taxonomy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center text-xs space-y-2">
        <p className="font-bold text-white">Nexora-Skill — Next-Gen AI Skill Intelligence & Career Opportunity Platform</p>
        <p className="text-slate-500">© 2026 Nexora-Skill. All rights reserved.</p>
      </footer>

    </div>
  );
};
