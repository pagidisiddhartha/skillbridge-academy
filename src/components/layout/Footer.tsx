import React from 'react';
import { GraduationCap, Award, Shield, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-900 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5 text-cyan-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Skill<span className="text-cyan-400">Bridge</span> Academy
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Empowering ambitious technical talent through rigorous industry curriculum, practical
              milestone projects, verified corporate internships, and tamper-proof digital credentials.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Technology Innovation Hub, Oslo & Distributed EU
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> admissions@skillbridge.edu
              </span>
            </div>
          </div>

          {/* Academic Pathways */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Curriculum Tracks
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Full-Stack Web Engineering
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Cloud DevOps & Kubernetes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Applied AI & Vector Systems
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  UI/UX Design Systems
                </button>
              </li>
            </ul>
          </div>

          {/* Internships & Verification */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Industry & Validation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('internships')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Partner Internship Board
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('verify')}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  Public Credential Registry
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Dual Education Model
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-cyan-400 transition-colors text-left"
                >
                  Mentor Network
                </button>
              </li>
            </ul>
          </div>

          {/* Demo Credentials Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demo Testing Passwords</span>
            </div>
            <p className="text-[11px] text-slate-400">
              All demo users share password:{' '}
              <code className="text-cyan-300 font-mono bg-slate-800 px-1 py-0.5 rounded">
                Password123!
              </code>
            </p>
            <div className="pt-1 text-[11px] space-y-1 text-slate-400">
              <div>Student: <span className="text-slate-300 font-mono">student@skillbridge.edu</span></div>
              <div>Mentor: <span className="text-slate-300 font-mono">mentor@skillbridge.edu</span></div>
              <div>Admin: <span className="text-slate-300 font-mono">admin@skillbridge.edu</span></div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} SkillBridge Academy. Built as an independent education &
            internship platform inspired by Scandinavian dual vocational-industry training models.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Academic Honor Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
