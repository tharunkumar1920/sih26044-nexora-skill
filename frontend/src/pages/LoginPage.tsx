import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/api';
import { UserRole } from '../types';
import { NexoraLogo } from '../components/NexoraLogo';
import {
  Eye, EyeOff, GraduationCap, Briefcase, Award, Building2,
  ArrowRight, Sparkles, Shield, Mail, Lock, CheckCircle2, Zap
} from 'lucide-react';

const ROLE_INFO: Record<UserRole, { label: string; desc: string; icon: React.ElementType; badge: string; color: string }> = {
  student: {
    label: 'Student / Candidate',
    desc: 'AI skill mapping, automated resume parsing & matching',
    icon: GraduationCap,
    badge: 'Skill Matrix & Placements',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  recruiter: {
    label: 'Recruiter / Industry',
    desc: 'Verified candidate matching & direct internship hiring',
    icon: Briefcase,
    badge: 'Industry Talent Search',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  },
  faculty: {
    label: 'Faculty Mentor',
    desc: 'Student mentorship, collaboration & curriculum tracking',
    icon: Award,
    badge: 'Academic Mentorship',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  institution_admin: {
    label: 'Institution Admin',
    desc: 'Taxonomy management, batch analytics & question bank',
    icon: Building2,
    badge: 'Institutional Governance',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleHint, setActiveRoleHint] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const userRole = localStorage.getItem('sih_role');

      if (userRole === 'student') {
        try {
          const profRes = await studentService.getProfile();
          const p = profRes.data;
          // If first-time user without skills/onboarding, redirect to AI onboarding
          if (!p.skills || p.skills.length === 0 || p.readiness_score === 0) {
            navigate('/onboard');
            return;
          }
        } catch {
          // In case profile fetch fails, go to dashboard
        }
        navigate('/dashboard');
      } else if (userRole === 'recruiter') {
        navigate('/recruiter');
      } else if (userRole === 'faculty') {
        navigate('/faculty');
      } else if (userRole === 'institution_admin') {
        navigate('/institution');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const currentRole = ROLE_INFO[activeRoleHint];
  const CurrentIcon = currentRole.icon;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel — Interactive AI & Platform Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] flex-col items-center justify-center p-12 overflow-hidden">
        {/* Animated ambient circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-emerald-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 text-center space-y-8 max-w-md">
          {/* Logo & Nexora Header */}
          <div className="flex items-center justify-center">
            <NexoraLogo size="lg" subtitleText="AI Skill Intelligence & Placements" />
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Academia — Industry<br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Skill Intelligence Portal</span>
            </h1>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              AI-driven platform for automated resume profiling, skill gap diagnostics, verifiable assessments, and transparent opportunity matching.
            </p>
          </div>

          {/* Interactive Role Selector Pills */}
          <div className="space-y-3 text-left bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center justify-between">
              <span>Select Your Perspective:</span>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300">Interactive Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROLE_INFO) as UserRole[]).map((r) => {
                const info = ROLE_INFO[r];
                const Icon = info.icon;
                const isSelected = activeRoleHint === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRoleHint(r)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${isSelected
                      ? 'bg-white text-emerald-950 border-white shadow-lg shadow-black/20 scale-[1.02]'
                      : 'bg-white/5 text-emerald-100/80 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-emerald-300'}`} />
                    <span className="truncate">{info.label.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Interactive Role Description Box */}
            <div className="mt-2 p-3 bg-white/10 rounded-xl border border-white/10 flex items-start space-x-2.5">
              <CurrentIcon className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">{currentRole.label}</div>
                <div className="text-[11px] text-emerald-100/80 leading-snug">{currentRole.desc}</div>
              </div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['✨ AI Resume Parsing', '🎯 Explainable Match Scores', '📊 Verified Assessment Matrix', '⚡ Zero-Cold-Start AI'].map(f => (
              <span key={f} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/15 text-emerald-100 text-xs font-medium rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Sleek Dark Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center mb-2">
            <NexoraLogo size="sm" subtitleText="Skill Intelligence Portal" />
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Sign In</h2>
            <p className="text-slate-400 text-sm">Enter your credentials to access your personalized portal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-medium flex items-start space-x-2.5 animate-shake">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@institution.ac.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="pt-2 text-center border-t border-slate-800">
            <p className="text-sm text-slate-400">
              New to Nexora-Skill?{' '}
              <Link to="/signup" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center space-x-1">
                <span>Create an Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
