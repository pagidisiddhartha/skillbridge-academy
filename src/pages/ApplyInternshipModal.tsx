import React, { useState } from 'react';
import { api } from '../services/api';
import { Internship } from '../types';
import { Modal } from '../components/common/Modal';
import {
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  X,
  Plus,
} from 'lucide-react';

interface ApplyInternshipModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyInternshipModal: React.FC<ApplyInternshipModalProps> = ({
  internship,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [coverLetter, setCoverLetter] = useState(
    `Dear Hiring Committee at ${internship?.organization || 'the company'},\n\nI am writing to express my strong enthusiasm for the ${internship?.title || 'internship position'}. Through my rigorous coursework and hands-on milestones at SkillBridge Academy, I have honed practical capabilities in modern full-stack systems and automated workflows.\n\nI look forward to contributing to your engineering squad.`
  );
  const [resumeFileName, setResumeFileName] = useState('Alex_Rivera_Software_Engineer_CV.pdf');
  const [portfolioUrl, setPortfolioUrl] = useState('https://github.com/alexrivera-dev');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js', 'PostgreSQL']);
  const [additionalInfo, setAdditionalInfo] = useState('Available 40 hours/week. Ready to start immediately.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!internship) return null;

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (toRemove: string) => {
    setSkills(skills.filter((s) => s !== toRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.internships.apply(internship.id, {
        coverLetter,
        resumeFileName,
        portfolioUrl,
        skills,
        additionalInfo,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit internship application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${internship.title}`}
      description={`Official candidate application for ${internship.organization} · Verified Stipend: ${internship.stipend}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={internship.logo}
              alt={internship.organization}
              className="w-8 h-8 rounded-md object-cover bg-white p-0.5 border border-slate-200"
            />
            <div>
              <span className="font-bold text-slate-800 block">{internship.organization}</span>
              <span className="text-[11px] text-slate-500">
                {internship.location} · {internship.workMode}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500">
            Deadline: {new Date(internship.deadline).toLocaleDateString()}
          </span>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Personal Statement & Cover Letter <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 leading-relaxed font-sans"
            placeholder="Explain why you are an ideal fit for this engineering cohort position..."
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Minimum 50 characters. Review committee reads cover letters carefully.
          </span>
        </div>

        {/* Resume upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resume Document (PDF) <span className="text-rose-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate pr-2">
                <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="text-xs text-slate-800 font-medium truncate">{resumeFileName}</span>
              </div>
              <label className="cursor-pointer text-[11px] font-bold text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-1 rounded-md shrink-0 transition-colors">
                Change
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Portfolio or GitHub Repository URL
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/your-username"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Skills Tag input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Highlighted Technical Skills
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-slate-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Add skill (e.g., Docker, SQL, Next.js) and press Enter"
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Availability & Notes
          </label>
          <input
            type="text"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="e.g. Can commit 40 hours/week. Hybrid attendance in Oslo available."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{submitting ? 'Submitting to Committee...' : 'Submit Application'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
