import React from 'react';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Award,
  Users,
  Compass,
  Building2,
  ShieldCheck,
  Mail,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface AboutPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <Badge variant="cyan" size="md" className="mb-2">
          Academic Philosophy
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          The Dual Education & Verified Internship Architecture
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Inspired by the successful Scandinavian model of technical academies like SITER Academy in
          Norway, SkillBridge Academy reimagines computer science and software education by unifying
          rigorous modular instruction with guaranteed paid industry internships and 1-on-1 mentor
          guidance.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-lg mb-4">
            <GraduationCap className="w-6 h-6 text-blue-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Industry-Aligned Curriculum</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every module reflects current enterprise production realities—TypeScript types, normalized
            PostgreSQL relational architectures, containerized environments, and automated testing
            pipelines rather than toy exercises.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center font-bold text-lg mb-4">
            <Compass className="w-6 h-6 text-cyan-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Direct Senior Mentorship</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students are paired with active software architects and engineering leads who review pull
            requests, enforce architectural best practices, and hold students accountable to professional
            engineering rubrics.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg mb-4">
            <Briefcase className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Paid Industry Placement</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We partner directly with high-growth technology companies across Scandinavia and Europe to
            provide vetted, paid internship roles with transparent monthly stipends and clear paths to
            full-time offers.
          </p>
        </div>
      </div>

      {/* Verification Transparency Notice */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Academic Credential Registry & Transparency</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Cryptographically Verifiable Credentials</h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          SkillBridge Academy issues official digital certificates containing permanent verification
          keys. Any potential employer, recruiter, or partner institution can validate credential
          authenticity by checking the certificate code directly in our public registry.
        </p>
        <button
          onClick={() => onNavigate('verify')}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>Open Credential Verification Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contact & Admissions Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6 border-t border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Admissions & Enterprise Relations</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Interested in joining an upcoming cohort or partnering with SkillBridge Academy to host
            interns from our graduating classes? Reach out to our admissions and partnership desk.
          </p>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-700" />
              <span>admissions@skillbridge.edu · partnerships@skillbridge.edu</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-700" />
              <span>Oslo Technology Cluster, Norway · Distributed Remote Hubs</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
          <h4 className="font-bold text-slate-900">Notice on Educational Model</h4>
          <p className="text-slate-600 leading-relaxed">
            SkillBridge Academy operates as an independent technical education institution inspired by
            dual-training models. All internships, stipends, and company listings represent verified
            partner opportunities curated specifically for our students.
          </p>
        </div>
      </div>
    </div>
  );
};
