import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ClassroomPage } from './pages/ClassroomPage';
import { InternshipsPage } from './pages/InternshipsPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { AboutPage } from './pages/AboutPage';
import { DashboardStudent } from './pages/DashboardStudent';
import { DashboardMentor } from './pages/DashboardMentor';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { AuthModal } from './pages/AuthModal';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [tabParam, setTabParam] = useState<string | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Parse path or initial URL
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path.startsWith('/verify/')) {
        const code = path.replace('/verify/', '');
        setCurrentTab('verify');
        setTabParam(code);
      } else if (path.startsWith('/courses/')) {
        const id = path.replace('/courses/', '');
        setCurrentTab('course-detail');
        setTabParam(id);
      }
    };
    handleLocation();
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tab === 'courses' && param) {
      setCurrentTab('course-detail');
      setTabParam(param);
      return;
    }

    if (tab === 'dashboard' && !isAuthenticated) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    setCurrentTab(tab);
    setTabParam(param);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenClassroom = (courseId: string, lessonId?: string) => {
    setCurrentTab('classroom');
    setTabParam(lessonId ? `${courseId}:${lessonId}` : courseId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Initializing SkillBridge Academy...</p>
        </div>
      </div>
    );
  }

  // If in interactive classroom player, render full-screen classroom experience without standard header/footer
  if (currentTab === 'classroom' && tabParam) {
    const parts = tabParam.split(':');
    const courseId = parts[0];
    const lessonId = parts[1];

    return (
      <ClassroomPage
        courseId={courseId}
        initialLessonId={lessonId}
        onBack={() => handleNavigate('courses', courseId)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentTab === 'courses' && (
          <CoursesPage
            onSelectCourse={(id) => handleNavigate('courses', id)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'course-detail' && tabParam && (
          <CourseDetailPage
            courseId={tabParam}
            onBack={() => handleNavigate('courses')}
            onOpenClassroom={handleOpenClassroom}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'internships' && (
          <InternshipsPage onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />
        )}

        {currentTab === 'verify' && <VerifyCertificatePage initialCode={tabParam} />}

        {currentTab === 'about' && (
          <AboutPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentTab === 'dashboard' && (
          <>
            {user?.role === 'admin' && <DashboardAdmin />}
            {user?.role === 'mentor' && <DashboardMentor />}
            {user?.role === 'student' && (
              <DashboardStudent
                initialSubTab={tabParam}
                onOpenClassroom={handleOpenClassroom}
                onNavigate={handleNavigate}
              />
            )}
            {!user && (
              <div className="max-w-md mx-auto py-20 text-center space-y-4">
                <p className="text-sm text-slate-600">Please sign in to access your portal.</p>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Sign In
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          handleNavigate('dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
