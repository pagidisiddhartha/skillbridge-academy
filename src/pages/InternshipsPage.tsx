import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Internship } from '../types';
import { useAuth } from '../context/AuthContext';
import { ApplyInternshipModal } from './ApplyInternshipModal';
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  ArrowRight,
  Filter,
  DollarSign,
  Clock,
  Building2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

interface InternshipsPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigate: (tab: string, param?: string) => void;
}

export const InternshipsPage: React.FC<InternshipsPageProps> = ({ onOpenAuth, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('all');

  // Selected for detail view
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [internshipToApply, setInternshipToApply] = useState<Internship | null>(null);

  useEffect(() => {
    loadInternships();
  }, [workMode]);

  const loadInternships = async () => {
    setLoading(true);
    try {
      const res = await api.internships.getAll({
        workMode: workMode !== 'all' ? workMode : undefined,
        search: search || undefined,
      });
      setInternships(res.internships);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInternships();
  };

  const handleOpenApply = (internship: Internship) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (user?.role !== 'student') {
      alert('Only student accounts can submit internship applications. Please switch to a student demo or register.');
      return;
    }
    setInternshipToApply(internship);
    setApplyModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <Badge variant="cyan" size="md" className="mb-2">
          Enterprise Partnership Board
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Verified Paid Industry Internships
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Bridging the gap between study and industry. All positions carry guaranteed stipends,
          practical software responsibilities, and dedicated mentor supervision.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company, role title, or tech stack..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Work Mode:
          </span>
          {['all', 'remote', 'hybrid', 'onsite'].map((mode) => (
            <button
              key={mode}
              onClick={() => setWorkMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                workMode === mode
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Internships */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading active internship postings...
        </div>
      ) : internships.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No internship postings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or work mode filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {internships.map((internship) => {
            const isApplied = internship.hasApplied;
            return (
              <div
                key={internship.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={internship.logo}
                        alt={internship.organization}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 p-0.5 bg-slate-50"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {internship.organization}
                        </h4>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {internship.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="cyan" size="sm" className="capitalize">
                        {internship.workMode}
                      </Badge>
                      {isApplied && (
                        <Badge variant="purple" size="sm" className="capitalize">
                          {internship.myApplicationStatus?.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {internship.description}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {internship.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom stats & CTA */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Stipend & Duration</span>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-emerald-700">{internship.stipend}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-600">{internship.durationMonths} Months</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInternship(internship)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Specifications
                    </button>
                    {isApplied ? (
                      <button
                        onClick={() => onNavigate('dashboard')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 flex items-center gap-1"
                      >
                        <span>View Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenApply(internship)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-1 shadow-2xs"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInternship && (
        <Modal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          title={selectedInternship.title}
          description={`${selectedInternship.organization} · ${selectedInternship.location}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Work Mode</span>
                <span className="font-bold text-slate-800 capitalize">
                  {selectedInternship.workMode}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Duration</span>
                <span className="font-bold text-slate-800">
                  {selectedInternship.durationMonths} Months
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Monthly Stipend</span>
                <span className="font-bold text-emerald-700">{selectedInternship.stipend}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Positions</span>
                <span className="font-bold text-slate-800">
                  {selectedInternship.availablePositions} Open
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                About the Position
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedInternship.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Core Responsibilities
              </h4>
              <ul className="space-y-1.5">
                {selectedInternship.responsibilities.map((r, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Eligibility & Qualifications
              </h4>
              <ul className="space-y-1.5">
                {selectedInternship.eligibilityCriteria.map((c, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Deadline: {new Date(selectedInternship.deadline).toLocaleDateString()}
              </span>

              <button
                onClick={() => {
                  const target = selectedInternship;
                  setSelectedInternship(null);
                  handleOpenApply(target);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <span>Proceed to Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Apply Modal */}
      {internshipToApply && (
        <ApplyInternshipModal
          internship={internshipToApply}
          isOpen={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false);
            setInternshipToApply(null);
          }}
          onSuccess={() => {
            loadInternships();
            alert('Your internship application has been submitted successfully to the committee!');
          }}
        />
      )}
    </div>
  );
};
