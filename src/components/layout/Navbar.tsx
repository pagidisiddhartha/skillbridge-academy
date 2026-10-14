import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Notification } from '../../types';
import {
  GraduationCap,
  Briefcase,
  Award,
  Bell,
  CheckCircle2,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id]);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      setNotifications(res.notifications);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      {/* Quick Demo Switcher Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Demo Sandbox:
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Instant 1-click test roles with live data:
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                demoLogin('student');
                onNavigate('dashboard');
              }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors flex items-center gap-1 ${
                user?.role === 'student'
                  ? 'bg-cyan-500 text-white font-medium shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              🎓 Student (Alex)
            </button>
            <button
              onClick={() => {
                demoLogin('mentor');
                onNavigate('dashboard');
              }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors flex items-center gap-1 ${
                user?.role === 'mentor'
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              🧭 Mentor (Sarah)
            </button>
            <button
              onClick={() => {
                demoLogin('admin');
                onNavigate('dashboard');
              }}
              className={`px-2.5 py-0.5 rounded text-xs transition-colors flex items-center gap-1 ${
                user?.role === 'admin'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              🛡️ Admin (Dr. Vance)
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-900 via-blue-900 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Skill<span className="text-cyan-700">Bridge</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block leading-none">
                  Academy & Internships
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('courses')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'courses'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                Courses
              </button>
              <button
                onClick={() => onNavigate('internships')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'internships'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-slate-400" />
                Internships
              </button>
              <button
                onClick={() => onNavigate('verify')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'verify'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-slate-400" />
                Verify Credential
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === 'about'
                    ? 'text-blue-900 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                About Model
              </button>
            </nav>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Dashboard Shortcut */}
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    currentTab === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-600" />
                  {user.role === 'admin'
                    ? 'Admin Console'
                    : user.role === 'mentor'
                    ? 'Mentor Desk'
                    : 'Student Portal'}
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <Badge variant="danger" size="sm">
                              {unreadCount} new
                            </Badge>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-blue-700 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications at this time.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 text-left transition-colors ${
                                !n.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div className="hidden lg:block text-left">
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Menu Popover */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1">
                          <Badge
                            variant={
                              user.role === 'admin'
                                ? 'purple'
                                : user.role === 'mentor'
                                ? 'primary'
                                : 'cyan'
                            }
                            size="sm"
                          >
                            {user.role.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </button>

                      {user.role === 'student' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('dashboard', 'profile');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Profile & CV
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          onNavigate('home');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
                >
                  Apply Now
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              onNavigate('courses');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Courses Catalogue
          </button>
          <button
            onClick={() => {
              onNavigate('internships');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Internship Opportunities
          </button>
          <button
            onClick={() => {
              onNavigate('verify');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Verify Credential
          </button>
          <button
            onClick={() => {
              onNavigate('about');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            About SkillBridge Model
          </button>
          {isAuthenticated && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
