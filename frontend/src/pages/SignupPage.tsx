import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { NexoraLogo } from '../components/NexoraLogo';
import {
  Eye, EyeOff, GraduationCap, Briefcase, Award, Building2,
  ArrowRight, User, Mail, Lock, Phone, BookOpen, CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../types';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: React.ElementType; color: string }[] = [
  { value: 'student', label: 'Student', description: 'Find internships & track skills', icon: GraduationCap, color: 'border-emerald-400 bg-emerald-900/30 text-emerald-300' },
  { value: 'recruiter', label: 'Recruiter', description: 'Post jobs & discover talent', icon: Briefcase, color: 'border-sky-400 bg-sky-900/30 text-sky-300' },
  { value: 'faculty', label: 'Faculty', description: 'Guide students & collaborate', icon: Award, color: 'border-purple-400 bg-purple-900/30 text-purple-300' },
  { value: 'institution_admin', label: 'Institution Admin', description: 'Manage skill frameworks', icon: Building2, color: 'border-amber-400 bg-amber-900/30 text-amber-300' },
];

export const SignupPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    college_name: '',
    // Recruiter security fields
    registration_number: '',
    official_domain: '',
    company_website: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(p)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [form.password]);

  const handleRoleNext = () => {
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError('Password must contain at least one digit.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(form.password)) {
      setError('Password must contain at least one special character.');
      return;
    }

    // Recruiter-specific validation
    if (selectedRole === 'recruiter') {
      if (!form.college_name.trim()) {
        setError('Company/Organization name is required for recruiters.');
        return;
      }
    }

    setLoading(true);
    const cleanEmail = form.email.trim();
    const cleanName = form.full_name.trim();
    const cleanCollege = form.college_name.trim();
    const cleanRegNum = form.registration_number.trim();
    const cleanDomain = form.official_domain.trim();
    const cleanWebsite = form.company_website.trim();

    try {
      await authService.register({
        full_name: cleanName,
        email: cleanEmail,
        password: form.password,
        role: selectedRole,
        college_or_company: cleanCollege || undefined,
        registration_number: cleanRegNum || undefined,
        official_domain: cleanDomain || undefined,
        company_website: cleanWebsite || undefined,
      });
      // Auto-login after registration
      await login(cleanEmail, form.password);
      const role = localStorage.getItem('sih_role');
      if (role === 'recruiter') navigate('/recruiter');
      else if (role === 'faculty') navigate('/faculty');
      else if (role === 'institution_admin') navigate('/institution');
      else navigate('/onboard');
    } catch (err: any) {
      let errorMsg = 'Registration failed. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((e: any) => e.msg || e.message || 'Invalid input').join(', ');
        }
      }
      setError(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />

        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="flex items-center justify-center">
            <NexoraLogo size="lg" subtitleText="AI Skill Intelligence Platform" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Join the<br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Nexora Ecosystem</span>
            </h1>
            <p className="text-emerald-100/80 text-base leading-relaxed">
              Create your account to access AI-powered skill mapping, smart job matching, and career development tools.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 text-left">
            {[
              'AI-powered skill gap analysis',
              'Personalised career roadmap',
              'Industry opportunity matching',
              'Verified skill assessments',
            ].map(benefit => (
              <div key={benefit} className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-100/90 text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {[['500+', 'Students'], ['120+', 'Opportunities'], ['4', 'User Roles']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl font-extrabold text-white">{val}</div>
                <div className="text-emerald-300 text-xs">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel — Dark Theme */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-6 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center mb-2">
            <NexoraLogo size="sm" subtitleText="Skill Intelligence Portal" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${step >= 1 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 text-slate-500'}`}>1</div>
            <div className={`flex-1 h-0.5 rounded transition-all ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-700'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${step >= 2 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 text-slate-500'}`}>2</div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Create account</h2>
                <p className="text-slate-400 mt-1 text-sm">Choose your role to get started</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRole(value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                      selectedRole === value
                        ? color + ' ring-2 ring-offset-2 ring-offset-slate-950 ring-emerald-500 shadow-lg'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${selectedRole === value ? '' : 'text-slate-400'}`} />
                    <div className={`text-sm font-bold ${selectedRole === value ? '' : 'text-slate-200'}`}>{label}</div>
                    <div className={`text-[11px] mt-0.5 leading-tight ${selectedRole === value ? 'opacity-80' : 'text-slate-500'}`}>{description}</div>
                  </button>
                ))}
              </div>

              <button
                id="signup-role-next"
                onClick={handleRoleNext}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950/40 transition-all text-sm"
              >
                <span>Continue as {ROLE_OPTIONS.find(r => r.value === selectedRole)?.label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium"
                >
                  ← Back
                </button>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Your details</h2>
                  <p className="text-slate-400 text-sm">
                    Registering as <span className="font-bold text-emerald-400">{ROLE_OPTIONS.find(r => r.value === selectedRole)?.label}</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="signup-fullname" type="text" value={form.full_name} onChange={set('full_name')} required placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="signup-email" type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Phone <span className="text-slate-500 font-normal normal-case">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="signup-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
              </div>

              {/* College / Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {selectedRole === 'recruiter' ? 'Company / Organization Name *' : 'Institution / College'}
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="signup-college" type="text" value={form.college_name} onChange={set('college_name')}
                    required={selectedRole === 'recruiter'}
                    placeholder={selectedRole === 'recruiter' ? 'Company or organization name' : 'College or university name'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                </div>
              </div>



              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="Min. 8 chars, 1 upper, 1 digit, 1 special"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`flex-1 h-1.5 rounded-full transition-all ${level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold ${
                        passwordStrength.score <= 1 ? 'text-rose-400' :
                        passwordStrength.score === 2 ? 'text-amber-400' :
                        passwordStrength.score === 3 ? 'text-sky-400' : 'text-emerald-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                      <div className="flex space-x-2 text-[10px] text-slate-500">
                        <span className={form.password.length >= 8 ? 'text-emerald-400' : ''}>8+ chars</span>
                        <span className={/[A-Z]/.test(form.password) ? 'text-emerald-400' : ''}>A-Z</span>
                        <span className={/[0-9]/.test(form.password) ? 'text-emerald-400' : ''}>0-9</span>
                        <span className={/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(form.password) ? 'text-emerald-400' : ''}>!@#</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input id="signup-confirm-password" type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={set('confirm_password')} required placeholder="Re-enter password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirm_password && form.password !== form.confirm_password && (
                  <p className="text-[10px] text-rose-400 mt-1 font-medium">Passwords do not match</p>
                )}
              </div>

              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-950/40 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
