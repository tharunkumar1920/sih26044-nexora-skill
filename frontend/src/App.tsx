import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { SkillGapsPage } from './pages/SkillGapsPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';

import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { RecruiterPostOpportunityPage } from './pages/RecruiterPostOpportunityPage';
import { RecruiterCandidatesPage } from './pages/RecruiterCandidatesPage';
import { RecruiterTestRoomsPage } from './pages/RecruiterTestRoomsPage';
import { StudentTestRoomPage } from './pages/StudentTestRoomPage';

import { FacultyDashboard } from './pages/FacultyDashboard';
import { FacultyCollaborationsPage } from './pages/FacultyCollaborationsPage';

import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { InstitutionTaxonomyPage } from './pages/InstitutionTaxonomyPage';
import { InstitutionQuestionBankPage } from './pages/InstitutionQuestionBankPage';
import { InstitutionDemandAnalyticsPage } from './pages/InstitutionDemandAnalyticsPage';

import { PublicPortfolioPage } from './pages/PublicPortfolioPage';


import { Menu } from 'lucide-react';
import { NexoraLogo } from './components/NexoraLogo';

const AUTH_ROUTES = ['/login', '/signup', '/onboard'];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      {user && (
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
          <NexoraLogo size="sm" subtitleText="Skill Intelligence" />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
            title="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Sidebar with mobile drawer support */}
      {user && (
        <Sidebar 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-50 min-h-screen overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
};


const ProtectedRoute: React.FC<{ allowedRole: UserRole; children: React.ReactNode }> = ({ allowedRole, children }) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Verifying Session...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== allowedRole) {
    if (role === 'student') return <Navigate to="/dashboard" replace />;
    if (role === 'recruiter') return <Navigate to="/recruiter" replace />;
    if (role === 'faculty') return <Navigate to="/faculty" replace />;
    if (role === 'institution_admin') return <Navigate to="/institution" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboard" element={<ProtectedRoute allowedRole="student"><OnboardingPage /></ProtectedRoute>} />
        
        {/* Student Dedicated Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/skill-gaps" element={<ProtectedRoute allowedRole="student"><SkillGapsPage /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute allowedRole="student"><AssessmentPage /></ProtectedRoute>} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/applications" element={<ProtectedRoute allowedRole="student"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/test-room" element={<ProtectedRoute allowedRole="student"><StudentTestRoomPage /></ProtectedRoute>} />
        <Route path="/portfolio" element={<PublicPortfolioPage />} />
        <Route path="/portfolio/:studentId" element={<PublicPortfolioPage />} />

        {/* Recruiter Dedicated Routes */}
        <Route path="/recruiter" element={<ProtectedRoute allowedRole="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/post" element={<ProtectedRoute allowedRole="recruiter"><RecruiterPostOpportunityPage /></ProtectedRoute>} />
        <Route path="/recruiter/candidates" element={<ProtectedRoute allowedRole="recruiter"><RecruiterCandidatesPage /></ProtectedRoute>} />
        <Route path="/recruiter/test-rooms" element={<ProtectedRoute allowedRole="recruiter"><RecruiterTestRoomsPage /></ProtectedRoute>} />

        {/* Faculty Dedicated Routes */}
        <Route path="/faculty" element={<ProtectedRoute allowedRole="faculty"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/opportunities" element={<ProtectedRoute allowedRole="faculty"><FacultyCollaborationsPage /></ProtectedRoute>} />

        {/* Institution Admin Dedicated Routes */}
        <Route path="/institution" element={<ProtectedRoute allowedRole="institution_admin"><InstitutionDashboard /></ProtectedRoute>} />
        <Route path="/institution/taxonomy" element={<ProtectedRoute allowedRole="institution_admin"><InstitutionTaxonomyPage /></ProtectedRoute>} />
        <Route path="/institution/questions" element={<ProtectedRoute allowedRole="institution_admin"><InstitutionQuestionBankPage /></ProtectedRoute>} />
        <Route path="/institution/demand" element={<ProtectedRoute allowedRole="institution_admin"><InstitutionDemandAnalyticsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
