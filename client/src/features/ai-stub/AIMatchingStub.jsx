import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Star,
  AlertCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import api from '../../api/axios';
import { VerifiedBadge } from '../../components/Badge';

const SAMPLE_PROMPTS = [
  {
    title: 'Full-Stack Web App',
    query: 'Need a full stack developer for a modern React and Node.js application with MongoDB and payment integration',
  },
  {
    title: 'UI/UX Mobile Design',
    query: 'Need a modern mobile app UI/UX prototype in Figma with clean design system and wireframes',
  },
  {
    title: 'DevOps & Cloud',
    query: 'Looking for a cloud specialist to setup Docker containerization, CI/CD pipeline, and AWS deployment',
  },
];

export const AIMatchingStub = () => {
  const [requirementText, setRequirementText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleAnalyze = async (textToUse) => {
    const text = (textToUse !== undefined ? textToUse : requirementText).trim();
    if (!text || text.length < 5) {
      setError('Please provide at least 5 characters describing what you need.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/match', { requirementText: text });
      if (res.data.success) {
        setResults(res.data);
      } else {
        setError(res.data.message || 'Failed to match talent.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during AI analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (query) => {
    setRequirementText(query);
    handleAnalyze(query);
  };

  const handleClear = () => {
    setRequirementText('');
    setResults(null);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2F6B1] border border-[#CDDE42] text-[#1C220E] text-xs font-bold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-4 h-4 text-[#758045]" />
          <span>Intelligent Talent Matching</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C220E] tracking-tight">
          AI Skill & Talent Matcher
        </h1>
        <p className="text-sm sm:text-base text-[#1C220E]/70 leading-relaxed">
          Describe your project brief, technical requirements, or tech stack. Our AI engine extracts key parameters and ranks matching verified services.
        </p>
      </div>

      {/* Input Search Console */}
      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#9EA96F]/30 shadow-xl space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1C220E] uppercase tracking-wider">
            Project Brief or Skills Required
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              placeholder="e.g. I need a full-stack engineer to build a high-performance web dashboard with React, Tailwind CSS, Node.js API, and secure payment processing..."
              className="w-full p-4 rounded-2xl bg-[#FAF9EE]/50 border border-[#9EA96F]/30 focus:border-[#CDDE42] focus:bg-white focus:ring-2 focus:ring-[#CDDE42]/20 text-sm text-[#1C220E] placeholder-[#1C220E]/40 outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Quick Sample Chips */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#1C220E]/60">Quick Test Examples:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => handleSelectSample(p.query)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F2F6B1]/50 border border-[#9EA96F]/30 hover:border-[#CDDE42] text-xs text-[#1C220E] font-medium transition text-left flex items-center gap-1.5 shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-[#758045]" />
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {requirementText ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 py-2 px-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={isLoading || !requirementText.trim()}
            onClick={() => handleAnalyze()}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1C220E] hover:bg-[#2E3514] disabled:opacity-50 text-[#FAF9EE] text-xs font-bold uppercase tracking-widest rounded-full shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing & Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#CDDE42]" />
                <span>Analyze & Find Matches</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
          {/* Analysis Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 border border-[#9EA96F]/30 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#9EA96F]/15 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1C220E] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#758045]" />
                  <span>AI Scope Analysis</span>
                </h3>
                <p className="text-xs text-[#1C220E]/70 mt-1">{results.analysis}</p>
              </div>

              <span className="self-start sm:self-auto text-[11px] font-bold text-[#1C220E] bg-[#F2F6B1] border border-[#CDDE42] px-3 py-1 rounded-full">
                Active Matches Found: {results.matches?.length || 0}
              </span>
            </div>

            {/* Extracted Skills Chips */}
            {results.extractedSkills?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#758045]">
                  Extracted Requirements & Skills:
                </span>
                <div className="flex flex-wrap gap-2">
                  {results.extractedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-[#FAF9EE] border border-[#9EA96F]/30 text-[#1C220E] text-xs font-semibold rounded-full shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Matched Gigs Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Ranked Matching Services
              </h3>
              <span className="text-xs text-slate-500">Sorted by semantic compatibility</span>
            </div>

            {results.matches?.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3 shadow-sm">
                <p className="text-sm font-semibold">No active services matched this specific prompt.</p>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#758045] hover:text-[#1C220E] hover:underline"
                >
                  <span>Browse all available marketplace services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.matches.map((item, idx) => {
                  const gig = item.gig;
                  if (!gig) return null;

                  return (
                    <div
                      key={gig._id || idx}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between gap-5 relative overflow-hidden"
                    >
                      {/* Match Score Badge Ribbon */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black shadow-xs">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.matchScore}% Match</span>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">{gig.category}</span>
                      </div>

                      {/* Gig Title & Description */}
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-[#1C220E] line-clamp-2 hover:text-[#758045] transition">
                          <Link to={`/gigs/${gig._id}`}>{gig.title}</Link>
                        </h4>
                        <p className="text-xs text-[#1C220E]/70 line-clamp-2 leading-relaxed">
                          {gig.description}
                        </p>
                      </div>

                      {/* AI Fit Callout */}
                      <div className="p-3.5 bg-[#FAF9EE] border border-[#9EA96F]/30 rounded-2xl text-xs text-[#1C220E] space-y-1">
                        <p className="font-bold text-[#1C220E] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#758045]" />
                          <span>AI Recommendation Reason:</span>
                        </p>
                        <p className="text-[11px] leading-relaxed text-[#1C220E]/70">{item.reason}</p>
                      </div>

                      {/* Provider Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#9EA96F]/15">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#1C220E] text-[#CDDE42] font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden">
                            {gig.provider?.profilePhoto ? (
                              <img
                                src={gig.provider.profilePhoto}
                                alt={gig.provider.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{(gig.provider?.name || 'V')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#1C220E] truncate max-w-[120px]">
                                {gig.provider?.name || 'Verified Provider'}
                              </span>
                              {gig.provider?.isVerified && <VerifiedBadge size="sm" />}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-[#1C220E]/60">
                              <Star className="w-3 h-3 text-[#CDDE42] fill-[#CDDE42]" />
                              <span>{gig.ratingAverage > 0 ? gig.ratingAverage.toFixed(1) : '5.0'}</span>
                              <span>({gig.ratingCount || 0})</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="text-right">
                          <span className="text-[10px] text-[#1C220E]/50 block uppercase font-bold">Starting At</span>
                          <span className="text-base font-black text-[#1C220E]">₹{gig.price}</span>
                        </div>
                      </div>

                      {/* Direct Book CTA */}
                      <Link
                        to={`/gigs/${gig._id}`}
                        className="w-full py-2.5 px-4 bg-[#1C220E] hover:bg-[#2E3514] text-[#FAF9EE] text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <span>View Service & Book</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#CDDE42]" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
