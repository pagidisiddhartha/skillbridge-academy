import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Certificate } from '../types';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Calendar,
  Building2,
  User as UserIcon,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface VerifyCertificatePageProps {
  initialCode?: string;
}

export const VerifyCertificatePage: React.FC<VerifyCertificatePageProps> = ({ initialCode }) => {
  const [code, setCode] = useState(initialCode || 'SKB-2026-FSD-892');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [certResult, setCertResult] = useState<Certificate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      verifyCode(initialCode);
    }
  }, [initialCode]);

  const verifyCode = async (targetCode: string) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    setSearched(true);
    setErrorMsg(null);
    setCertResult(null);

    try {
      const res = await api.certificates.verify(targetCode.trim());
      if (res.valid && res.certificate) {
        setCertResult(res.certificate);
      } else {
        setErrorMsg(
          res.message || `No active certificate found in our registry for code "${targetCode.trim()}".`
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          `No credential found matching "${targetCode.trim()}". Please verify the code on your certificate.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(code);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify/${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
          <span>Public Registry & Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verify SkillBridge Academy Credentials
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Validate authenticity directly against our authoritative database registry. All certificates
          are permanently logged upon verified academic and milestone completion.
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Enter Certificate Verification Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SKB-2026-FSD-892"
                className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs shrink-0 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <span>Verifying...</span> : <span>Verify Record</span>}
            </button>
          </div>
        </form>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100">
          <span>Try sample demo codes:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCode('SKB-2026-FSD-892');
                verifyCode('SKB-2026-FSD-892');
              }}
              className="font-mono text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors"
            >
              SKB-2026-FSD-892 (Valid)
            </button>
            <button
              type="button"
              onClick={() => {
                setCode('INVALID-CODE-999');
                verifyCode('INVALID-CODE-999');
              }}
              className="font-mono text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors"
            >
              INVALID-CODE-999
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Area */}
      {searched && (
        <div className="max-w-2xl mx-auto transition-all">
          {errorMsg ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-900 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Verification Failed: Invalid Credential</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">{errorMsg}</p>
              <div className="text-[11px] text-rose-600/80 pt-1">
                Please double-check the alphanumeric sequence or contact the issuing academic
                operations office at{' '}
                <span className="font-semibold underline">registry@skillbridge.edu</span>.
              </div>
            </div>
          ) : certResult ? (
            <div className="space-y-4">
              {/* Official Credential Certificate Container */}
              <div className="bg-white rounded-2xl border-4 border-slate-900 p-8 sm:p-12 shadow-2xl relative overflow-hidden print:p-8">
                {/* Decorative border frame */}
                <div className="absolute inset-2 border border-slate-200 rounded-xl pointer-events-none" />

                {/* Seal & Status banner */}
                <div className="flex items-start justify-between relative z-10 mb-8 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-md">
                      <Award className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        SKILLBRIDGE ACADEMY
                      </h2>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Official Verified Credential
                      </span>
                    </div>
                  </div>

                  <Badge variant={certResult.status === 'valid' ? 'success' : 'danger'} size="md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    STATUS: {certResult.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="text-center space-y-6 relative z-10 py-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                    This certifies that
                  </div>

                  <div className="text-3xl sm:text-4xl font-serif font-bold text-slate-950 tracking-wide underline decoration-cyan-400 decoration-2 underline-offset-8">
                    {certResult.studentName}
                  </div>

                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    has successfully satisfied all rigorous curriculum modules, hands-on architectural
                    milestones, and evaluated code assessments for:
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-lg mx-auto">
                    <h3 className="text-lg font-bold text-slate-900">{certResult.title}</h3>
                    {certResult.grade && (
                      <span className="text-xs font-semibold text-cyan-800 mt-1 block">
                        Academic Standing: {certResult.grade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer validation details */}
                <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 relative z-10">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">CREDENTIAL ID</span>
                    <span className="font-mono font-bold text-slate-900">
                      {certResult.certificateCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">COMPLETION DATE</span>
                    <span className="font-medium text-slate-900">
                      {new Date(certResult.completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">ISSUING AUTHORITY</span>
                    <span className="font-medium text-slate-900">{certResult.issuingOrg}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Verification Link'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Credential</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
