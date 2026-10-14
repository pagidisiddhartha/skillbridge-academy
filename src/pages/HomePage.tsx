import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Course, Internship } from '../types';
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  Building2,
  Code2,
  ChevronDown,
  ShieldCheck,
  Star,
  Layers,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenAuth }) => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [featuredInternships, setFeaturedInternships] = useState<Internship[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    try {
      const coursesRes = await api.courses.getAll();
      setFeaturedCourses(coursesRes.courses.slice(0, 3));
      const internsRes = await api.internships.getAll();
      setFeaturedInternships(internsRes.internships.slice(0, 3));
    } catch {
      // ignore
    }
  };

  const faqs = [
    {
      q: 'How does the SkillBridge dual education and internship model work?',
      a: 'Inspired by Scandinavian vocational academy models, students first complete intensive modular technical coursework with hands-on labs and practical milestone projects. Once core criteria are met, students become directly eligible to apply for verified paid internship postings with our enterprise network partners.',
    },
    {
      q: 'Are the internship opportunities paid and verified?',
      a: 'Yes. All active partner listings on SkillBridge Academy include transparent monthly stipends, clear responsibilities, and dedicated mentor supervision. Applications are processed through our structured review lifecycle.',
    },
    {
      q: 'What role do mentors play in my learning experience?',
      a: 'Every student is assigned an active industry practitioner (Senior Engineers, Tech Leads, and Architects). Mentors conduct line-by-line code reviews, provide rubric feedback, and approve milestone deliverables before advancement.',
    },
    {
      q: 'How are SkillBridge certificates verified by prospective employers?',
      a: 'Every issued certificate carries a permanent cryptographically generated verification code (e.g., SKB-2026-FSD-892). Employers can enter this code in our public verification registry to validate student identity, course curriculum, completion date, and validity status in real time.',
    },
    {
      q: 'Can I test all platform roles as an evaluator or recruiter?',
      a: 'Absolutely! Use the top demo strip to switch between Alex Rivera (Student), Sarah Chen (Mentor), and Dr. Marcus Vance (Admin) to test student learning, code grading, and administrative issuance flows without creating any accounts.',
    },
  ];

  const testimonials = [
    {
      name: 'Freja Solberg',
      role: 'Junior Full-Stack Engineer at Nordic Cloud',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      quote:
        'The dual model completely transformed my career. The code reviews from Mentor Sarah pushed me beyond theory into actual architectural patterns. My internship seamlessly converted into a full-time engineering offer.',
      badge: 'Alumni Cohort 2025',
    },
    {
      name: 'Emil Dahl',
      role: 'Frontend Developer at Aurora Digital Labs',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      quote:
        'Unlike static video courses, SkillBridge requires you to build real capstone milestones reviewed by senior leaders. Applying for the internship directly on the portal gave me immediate interview access.',
      badge: 'Alumni Cohort 2025',
    },
    {
      name: 'Kari Lind',
      role: 'Cloud DevOps Associate at Viken Systems',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      quote:
        'The verifiable credential registry made technical validation seamless for employers. My hiring manager verified my milestone capstone in 30 seconds during our initial screening.',
      badge: 'Alumni Cohort 2026',
    },
  ];

  return (
    <div className="space-y-20 lg:space-y-28 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>The Dual Academy & Internship Model</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Master Elite Tech Skills.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-200">
                  Land Verified Internships.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                SkillBridge Academy bridges ambitious students and high-growth engineering teams. Learn
                structured enterprise full-stack development, receive direct line-by-line feedback from
                senior mentors, and transition into paid partner internships.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('courses')}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('internships')}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>View Paid Internships</span>
                </button>
                <button
                  onClick={() => onNavigate('verify')}
                  className="px-4 py-3 rounded-xl text-slate-300 hover:text-white font-medium text-sm flex items-center gap-1.5 hover:underline"
                >
                  <Award className="w-4 h-4 text-slate-400" />
                  <span>Verify a Credential</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-2xl font-bold text-white">94%</div>
                  <div className="text-xs text-slate-400">Internship Placement Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">1-on-1</div>
                  <div className="text-xs text-slate-400">Senior Mentor Code Reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400">Verifiable Digital Certificates</div>
                </div>
              </div>
            </div>

            {/* Interactive Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">student_learning_path.ts</span>
                  </div>
                  <Badge variant="cyan" size="sm">
                    Active Cohort
                  </Badge>
                </div>

                <div className="mt-5 space-y-4 text-xs font-mono">
                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700/60">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="text-cyan-400 font-bold">Course 01: Full-Stack Web</span>
                      <span>40% Done</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-cyan-400 h-1.5 rounded-full w-[40%]" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-[10px]">Assigned Mentor</div>
                      <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Sarah Chen (Principal Architect)
                      </div>
                    </div>
                    <Badge variant="purple" size="sm">
                      Feedback: 96%
                    </Badge>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-700/60">
                    <div className="text-slate-400 text-[10px] mb-1">Partner Internship Pipeline</div>
                    <div className="flex items-center justify-between text-white font-medium">
                      <span>Nordic Cloud Solutions</span>
                      <span className="text-emerald-400 font-bold">Under Review</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Stipend: €2,600 / mo · Oslo (Hybrid)</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ready to test the live workflow?</span>
                  <button
                    onClick={() => {
                      onOpenAuth('register');
                    }}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Start as Student</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step Dual Learning & Placement Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="cyan" size="md" className="mb-3">
            Academic Methodology
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How The SkillBridge Model Accelerates Your Career
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            We reject passive tutorials. Every learner progresses through four validated milestones
            designed to mirror real-world engineering teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 font-bold flex items-center justify-center text-base mb-4 border border-blue-100">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Modular Foundations</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Study architecture, TypeScript typing discipline, database normalization, and security
              through structured video and text modules.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-800 font-bold flex items-center justify-center text-base mb-4 border border-cyan-100">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Mentor Code Reviews</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit realistic multi-tenant capstones. Assigned industry architects grade your code,
              request revisions, and provide feedback.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-base mb-4 border border-emerald-100">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Paid Industry Internship</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apply directly to vetted company postings with guaranteed monthly stipends, real
              responsibilities, and hybrid or remote arrangements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 font-bold flex items-center justify-center text-base mb-4 border border-purple-100">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Verifiable Credential</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive a permanent digital certificate verifiable through our public registry, validated
              against actual database completion records.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="primary" size="md" className="mb-2">
              Curriculum Tracks
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Professional Courses
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Curated by senior engineers from leading European technology enterprises.
            </p>
          </div>
          <button
            onClick={() => onNavigate('courses')}
            className="text-sm font-bold text-cyan-800 hover:text-cyan-900 flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="cyan" size="sm">
                    {course.category}
                  </Badge>
                  <Badge variant="slate" size="sm">
                    {course.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-cyan-800 transition-colors cursor-pointer"
                    onClick={() => onNavigate('courses', course.id)}
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {course.durationHours} Hours Curriculum
                  </span>
                  <button
                    onClick={() => onNavigate('courses', course.id)}
                    className="font-bold text-cyan-800 hover:text-cyan-900 flex items-center gap-1"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Internship Opportunities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 relative z-10">
            <div>
              <Badge variant="cyan" size="md" className="mb-2 bg-cyan-950 text-cyan-300 border-cyan-800">
                Company Partnerships
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Verified Paid Internships
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real industry seats exclusively open to SkillBridge Academy cohort candidates.
              </p>
            </div>
            <button
              onClick={() => onNavigate('internships')}
              className="text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 self-start md:self-auto"
            >
              <span>Explore All Listings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {featuredInternships.map((internship) => (
              <div
                key={internship.id}
                className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={internship.logo}
                        alt={internship.organization}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-700 p-0.5 border border-slate-600"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {internship.organization}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {internship.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="cyan" size="sm" className="capitalize">
                      {internship.workMode}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-cyan-300 line-clamp-1">{internship.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {internship.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {internship.requiredSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Monthly Stipend</span>
                    <span className="text-xs font-bold text-emerald-400">{internship.stipend}</span>
                  </div>
                  <button
                    onClick={() => onNavigate('internships', internship.id)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    View & Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="purple" size="md" className="mb-2">
            Student Outcomes
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hear From Our Cohort Graduates
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Real experiences from students who navigated the dual learning and internship path.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">"{t.quote}"</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                  <span className="text-[10px] font-semibold text-cyan-700 block mt-0.5">
                    {t.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge variant="slate" size="md" className="mb-2">
            Common Inquiries
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Learn more about course prerequisites, application screening, and credentials.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:text-cyan-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-cyan-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Begin Your Journey with SkillBridge Academy
            </h2>
            <p className="text-sm text-slate-300">
              Join our incoming cohort, get paired with senior engineering mentors, and prepare for
              verified industry placement.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-md"
            >
              Apply as a Student
            </button>
            <button
              onClick={() => onNavigate('verify')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Verify Existing Certificate</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
