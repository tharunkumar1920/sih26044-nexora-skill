import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentService, opportunityService, recommendationService } from '../services/api';
import { NexoraLogo } from '../components/NexoraLogo';
import {
  Upload, FileText, Sparkles, CheckCircle2, ArrowRight,
  User, GraduationCap, Code2, Award, Briefcase,
  AlertCircle, RefreshCw, ChevronRight, FileUp, Check,
  MapPin, Clock, DollarSign, HelpCircle
} from 'lucide-react';

interface RecommendedOpp {
  id: number;
  company_name: string;
  title: string;
  type: string;
  description: string;
  location: string;
  work_mode: string;
  stipend_or_salary: string;
  duration: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommended_action: string;
  required_skills: Array<{ id: number; name: string; min_proficiency: number; is_required: boolean }>;
}

interface ParsedResult {
  skills_detected: string[];
  target_role: string;
  degree: string;
  cgpa: number;
  readiness_score: number;
  recommended_opportunities?: RecommendedOpp[];
}

const EXAMPLE_PROMPTS = [
  {
    title: "AI / Data Science Resume",
    text: "I am a B.Tech Computer Science student at IIT Delhi (CGPA: 8.7), graduating in 2025. I have strong skills in Python, Machine Learning, and Data Analysis. I've worked with TensorFlow, Scikit-Learn, Pandas, and SQL. I completed an internship at a health-tech startup where I built an NLP pipeline for medical text classification. I hold a Coursera Machine Learning certificate by Andrew Ng."
  },
  {
    title: "Ayush Research & Pharmacology",
    text: "I'm pursuing B.A.M.S from Gujarat Ayurved University. I have extensive knowledge of Ayurveda, herbal pharmacology, clinical research, medicinal plants, and clinical trials. I completed a research project on standardized Ayurvedic formulations for immunity enhancement."
  },
  {
    title: "Full-Stack Web Development",
    text: "Final year B.Tech student with expertise in React, TypeScript, Node.js, Python, FastApi, SQL, Docker, and Git. Built 3 full-stack enterprise web applications and deployed them on AWS. CGPA: 8.4."
  },
];

export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'analyzing' | 'done'>('input');
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleStartAnalysis = async () => {
    setError('');

    if (mode === 'upload') {
      if (!selectedFile) {
        setError('Please select or drop a resume file (.pdf, .docx, .txt).');
        return;
      }
    } else {
      if (!description.trim() || description.trim().length < 25) {
        setError('Please provide at least a brief resume description (25+ characters).');
        return;
      }
    }

    setLoading(true);
    setStep('analyzing');
    setAnalyzeProgress(15);

    const interval = setInterval(() => {
      setAnalyzeProgress(p => Math.min(p + Math.random() * 20, 90));
    }, 350);

    try {
      let res;
      if (mode === 'upload' && selectedFile) {
        res = await studentService.uploadResume(selectedFile);
      } else {
        res = await studentService.onboard(description);
      }

      // Call dedicated ML recommendation API for fresh deduplicated job matching
      try {
        const jobRes = await recommendationService.matchJobs({
          description: mode === 'paste' ? description : undefined,
          top_k: 8
        });
        if (jobRes.data && jobRes.data.recommended_opportunities) {
          res.data.recommended_opportunities = jobRes.data.recommended_opportunities;
        }
      } catch (jobErr) {
        console.warn('Dedicated job recommendation fallback:', jobErr);
      }

      clearInterval(interval);
      setAnalyzeProgress(100);

      setTimeout(() => {
        setResult(res.data);
        setStep('done');
      }, 400);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.response?.data?.detail || 'Analysis failed. Please try again or paste plain text.');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFromOnboarding = async (oppId: number) => {
    try {
      await opportunityService.apply(oppId);
      setAppliedIds(prev => [...prev, oppId]);
    } catch (err) {
      console.error(err);
    }
  };

  const useExamplePrompt = (text: string) => {
    setMode('paste');
    setDescription(text);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <NexoraLogo size="sm" subtitleText="AI Resume & Skill Parser" />

        <button
          onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition"
        >
          Skip to Dashboard →
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl space-y-6">

          {/* ── STEP 1: INPUT (UPLOAD OR PASTE) ────────────────────────── */}
          {step === 'input' && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Resume & ML Opportunity Matcher</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Upload Your Resume for ML Job Recommendations
                </h1>
                <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                  Our machine learning engine parses your resume, extracts your technical & domain competencies, and instantly ranks matching industry internships and placements.
                </p>
              </div>

              {/* Mode Tabs (Upload File vs Paste Text) */}
              <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setMode('upload')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'upload'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Upload Resume File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('paste')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'paste'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste Resume Text</span>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start space-x-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-medium max-w-2xl mx-auto">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Mode Content: File Upload Dropzone */}
              {mode === 'upload' && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                        : selectedFile
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.rtf,.md"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-white font-bold text-base">{selectedFile.name}</div>
                          <div className="text-slate-400 text-xs mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                          </div>
                        </div>
                        <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/20">
                          Ready for ML Analysis
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 bg-slate-800 border border-slate-700 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                          <Upload className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-base">
                            Drag & drop your resume file here, or <span className="text-emerald-400 underline">browse</span>
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            Supports PDF, DOCX, TXT, RTF, MD (up to 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStartAnalysis}
                    disabled={loading || !selectedFile}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all text-sm uppercase tracking-wider"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Resume & Recommend Jobs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mode Content: Paste Text */}
              {mode === 'paste' && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Resume / Experience Text
                    </label>
                    <span className="text-xs text-slate-500">{description.length} characters</span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={8}
                    placeholder="Paste your resume contents or describe your education, technical skills, projects, and target career interests..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 text-sm rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed transition"
                  />

                  <button
                    onClick={handleStartAnalysis}
                    disabled={loading || description.trim().length < 25}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all text-sm uppercase tracking-wider"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run ML Skill Extraction & Job Match</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sample Preset Resumes */}
              <div className="space-y-2.5">
                <p className="text-slate-400 text-xs font-bold text-center uppercase tracking-wider">
                  Or test with sample profiles:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => useExamplePrompt(ex.text)}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                        <span>{ex.title}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                        {ex.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: ANALYZING ───────────────────────────────────────── */}
          {step === 'analyzing' && (
            <div className="text-center space-y-8 py-12">
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-xl">
                  <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
                <h2 className="text-3xl font-black text-white">Running ML Algorithms...</h2>
                <p className="text-slate-400 text-sm">
                  Extracting skills, vectorizing profile, and matching against industry opportunities
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 max-w-xl mx-auto">
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${analyzeProgress}%` }}
                  />
                </div>
                <div className="space-y-2 text-left">
                  {[
                    { label: 'Parsing document streams & text tokens...', done: analyzeProgress > 20 },
                    { label: 'Extracting verified skills & estimated proficiencies...', done: analyzeProgress > 45 },
                    { label: 'Inferring target role & career readiness index...', done: analyzeProgress > 70 },
                    { label: 'Executing ML Opportunity Matching algorithm...', done: analyzeProgress >= 90 },
                  ].map(({ label, done }) => (
                    <div key={label} className={`flex items-center space-x-2.5 text-xs font-semibold transition-colors ${done ? 'text-emerald-400' : 'text-slate-600'}`}>
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${done ? 'opacity-100' : 'opacity-30'}`} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: DONE WITH ML JOB RECOMMENDATIONS ────────────────── */}
          {step === 'done' && result && (
            <div className="space-y-8 pb-12">
              {/* Top Banner */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-white">Analysis & ML Matching Complete! 🎉</h2>
                <p className="text-slate-400 text-sm">
                  We extracted your competencies and calculated your compatibility against active industry openings.
                </p>
              </div>

              {/* Profile Snapshot Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-emerald-400">{result.readiness_score}%</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Readiness Index</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                  <div className="text-2xl font-black text-sky-400">{result.skills_detected?.length || 0}</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Skills Detected</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                  <div className="text-base font-bold text-purple-400 truncate">{result.target_role || 'General'}</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Target Role</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                  <div className="text-base font-bold text-amber-400 truncate">{result.degree || 'Undergrad'}</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">Education</div>
                </div>
              </div>

              {/* Detected Skills Pills */}
              {result.skills_detected?.length > 0 && (
                <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Skills Added to Profile ({result.skills_detected.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.skills_detected.map(s => (
                      <span key={s} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-xl">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── ML Recommended Opportunities & Jobs ─────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-emerald-400" />
                      <span>Recommended Jobs & Internships (ML Scored)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Ranked by algorithmic compatibility with your extracted skills
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                    {result.recommended_opportunities?.length || 0} Matches Found
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.recommended_opportunities && result.recommended_opportunities.length > 0 ? (
                    result.recommended_opportunities.map(opp => {
                      const isApplied = appliedIds.includes(opp.id);
                      return (
                        <div
                          key={opp.id}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-4 flex flex-col justify-between transition-all"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                                  {opp.type}
                                </span>
                                <h4 className="text-base font-bold text-white mt-1.5">{opp.title}</h4>
                                <p className="text-xs text-slate-400">{opp.company_name} • {opp.location}</p>
                              </div>

                              <div className={`px-3 py-1.5 rounded-2xl text-xs font-black border flex-shrink-0 ${
                                opp.match_score >= 70
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : opp.match_score >= 40
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}>
                                {opp.match_score}% Match
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                              {opp.description}
                            </p>

                            {/* Matched skills indicator */}
                            <div className="space-y-1">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Skill Compatibility
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {opp.matched_skills.map(s => (
                                  <span key={s} className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                                    ✓ {s}
                                  </span>
                                ))}
                                {opp.missing_skills.map(s => (
                                  <span key={s} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-normal">
                                    + {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              {opp.stipend_or_salary}
                            </span>

                            <button
                              onClick={() => handleApplyFromOnboarding(opp.id)}
                              disabled={isApplied}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                                isApplied
                                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Applied!</span>
                                </>
                              ) : (
                                <>
                                  <span>Apply Now</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                      No active opportunities currently recorded in database.
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Proceed to Dashboard */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all text-sm uppercase tracking-wider"
                >
                  <span>Go to Full Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setStep('input')}
                  className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold py-4 px-6 rounded-2xl transition text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Upload Another Resume</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
