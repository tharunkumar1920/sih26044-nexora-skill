import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { studentService } from '../services/api';
import { Award, CheckCircle2, ExternalLink, Github, Globe, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

export const PublicPortfolioPage: React.FC = () => {
  const { studentId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    studentService.getProfile()
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading || !profile) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Digital Verified Portfolio...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      
      {/* Verified Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-ayush-dark text-white rounded-3xl p-8 shadow-xl space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-900/80 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Ministry of Ayush Digital Portfolio</span>
            </div>
            <h1 className="text-3xl font-extrabold">{profile.full_name}</h1>
            <p className="text-sm text-slate-300">{profile.degree} • {profile.college_name}</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700">
            <div className="text-2xl font-extrabold text-emerald-400">{Math.round(profile.readiness_score)}%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Career Readiness</div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl border-t border-slate-800 pt-3">
            "{profile.bio}"
          </p>
        )}
      </div>

      {/* Verified Skills Matrix */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Award className="w-5 h-5 text-ayush-600" />
          <span>Verified Skill Matrix & Assessment Scores</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {profile.skills.map((s: any) => (
            <div key={s.id} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{s.skill_name}</span>
                {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-lg font-extrabold text-ayush-800">{Math.round(s.proficiency_level)}%</div>
              <div className="text-[10px] text-slate-500 font-mono">Quiz Verified Score</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-sky-600" />
          <span>Featured Technical Projects</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.projects.map((p: any) => (
            <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{p.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {p.technologies.map((t: string, i: number) => (
                  <span key={i} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Award className="w-5 h-5 text-purple-600" />
          <span>Verified Certifications</span>
        </h2>

        <div className="space-y-3">
          {profile.certifications.map((c: any) => (
            <div key={c.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{c.title}</h4>
                <p className="text-[11px] text-slate-500">{c.issuer} • {c.issue_date}</p>
              </div>
              {c.credential_url && (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-ayush-700 hover:underline flex items-center space-x-1"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
