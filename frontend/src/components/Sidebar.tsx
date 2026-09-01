import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NexoraLogo } from './NexoraLogo';
import { 
  LayoutDashboard, Target, Award, Briefcase, FileCheck, UserCheck, 
  BarChart3, Database, HelpCircle, Layers, Users, Sparkles,
  LogOut, FileUp, ShieldCheck, X, ClipboardList, Hash
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const studentLinks: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard & Readiness', icon: LayoutDashboard },
    { to: '/onboard', label: 'AI Resume & Skill Parser', icon: FileUp, highlight: true },
    { to: '/skill-gaps', label: 'Skill Gap Diagnostics', icon: Target },
    { to: '/assessment', label: 'Skill Assessments', icon: Award },
    { to: '/opportunities', label: 'ML Recommended Jobs', icon: Briefcase },
    { to: '/applications', label: 'My Applications', icon: FileCheck },
    { to: '/test-room', label: 'Join Test Room', icon: Hash, highlight: true },
    { to: '/portfolio', label: 'Digital Portfolio', icon: UserCheck },
  ];

  const recruiterLinks: NavItem[] = [
    { to: '/recruiter', label: 'Recruiter Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/post', label: 'Post Opportunity', icon: Briefcase },
    { to: '/recruiter/candidates', label: 'Matched Candidates', icon: Users },
    { to: '/recruiter/test-rooms', label: 'Test Rooms', icon: ClipboardList, highlight: true },
  ];

  const facultyLinks: NavItem[] = [
    { to: '/faculty', label: 'Faculty Hub', icon: LayoutDashboard },
    { to: '/faculty/opportunities', label: 'Industry Collaborations', icon: Sparkles },
  ];

  const adminLinks: NavItem[] = [
    { to: '/institution', label: 'Institution Analytics', icon: BarChart3 },
    { to: '/institution/taxonomy', label: 'Skills Taxonomy Editor', icon: Database },
    { to: '/institution/questions', label: 'Question Bank Manager', icon: HelpCircle },
    { to: '/institution/demand', label: 'Industry Demand Analytics', icon: Layers },
  ];

  const links = role === 'student'
    ? studentLinks
    : role === 'recruiter'
    ? recruiterLinks
    : role === 'faculty'
    ? facultyLinks
    : adminLinks;

  const sidebarContent = (
    <div className="w-64 bg-slate-950 text-slate-300 min-h-screen p-4 flex flex-col justify-between border-r border-slate-800/80 shadow-2xl z-40 flex-shrink-0">
      <div className="space-y-6">
        {/* Logo & Header in Sidebar */}
        <div className="px-2 py-2 border-b border-slate-800/80 pb-4 flex items-center justify-between">
          <NexoraLogo size="md" subtitleText="Skill Intelligence" />
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Menu ({role?.replace('_', ' ')})
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isExactParent = link.to === '/recruiter' || link.to === '/faculty' || link.to === '/institution' || link.to === '/dashboard';
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={isExactParent}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                        : link.highlight
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Status & Sign Out Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {user && (
          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{user.full_name}</div>
                <div className="text-[10px] text-emerald-400 capitalize flex items-center space-x-1 truncate">
                  <ShieldCheck className="w-3 h-3 flex-shrink-0 inline" />
                  <span>{user.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          {/* Drawer content */}
          <div className="relative z-50 flex-1 max-w-xs w-full animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
