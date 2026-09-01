import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { NexoraLogo } from './NexoraLogo';
import { Award, LogOut, UserCheck, ShieldCheck, Sparkles, Building2, GraduationCap, Briefcase } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (r: UserRole) => {
    await switchDemoUser(r);
    if (r === 'student') navigate('/dashboard');
    else if (r === 'recruiter') navigate('/recruiter');
    else if (r === 'faculty') navigate('/faculty');
    else if (r === 'institution_admin') navigate('/institution');
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Platform Name */}
          <NexoraLogo size="md" subtitleText="Skill Intelligence" />

          {/* Quick Demo Role Switcher Header Pill */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium space-x-1">
            <span className="px-2 text-slate-500 font-semibold uppercase text-[10px]">Demo Role:</span>
            {(['student', 'recruiter', 'faculty', 'institution_admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`px-2.5 py-1 rounded-lg transition-all capitalize flex items-center space-x-1 ${
                  role === r
                    ? 'bg-ayush-700 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'student' && <GraduationCap className="w-3 h-3" />}
                {r === 'recruiter' && <Briefcase className="w-3 h-3" />}
                {r === 'faculty' && <Award className="w-3 h-3" />}
                {r === 'institution_admin' && <Building2 className="w-3 h-3" />}
                <span>{r.replace('_', ' ')}</span>
              </button>
            ))}
          </div>

          {/* User Status & Action */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800">{user.full_name}</div>
                  <div className="text-xs text-ayush-700 font-medium capitalize flex items-center justify-end space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{user.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="bg-ayush-700 hover:bg-ayush-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Portal Login</span>
              </a>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
