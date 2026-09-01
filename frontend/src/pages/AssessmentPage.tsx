import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentService, studentService, institutionService } from '../services/api';
import { Award, Clock, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  difficulty: string;
  category: string;
}

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number>(1);
  const [selectedSkillName, setSelectedSkillName] = useState<string>('Python');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Load student skills and quiz history
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [profRes, skRes, histRes] = await Promise.all([
          studentService.getProfile(),
          institutionService.getSkills(),
          assessmentService.getHistory()
        ]);

        const studentSkills = profRes.data.skills || [];
        if (studentSkills.length > 0) {
          setSkills(studentSkills);
          setSelectedSkillId(studentSkills[0].skill_id);
          setSelectedSkillName(studentSkills[0].skill_name);
        } else {
          setSkills(skRes.data || []);
          if (skRes.data.length > 0) {
            setSelectedSkillId(skRes.data[0].id);
            setSelectedSkillName(skRes.data[0].name);
          }
        }
        setHistory(histRes.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    initData();
  }, []);

  // Fetch questions whenever selectedSkillId changes
  useEffect(() => {
    if (!selectedSkillId) return;
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIdx(0);

    assessmentService.getQuestions(selectedSkillId)
      .then(res => {
        setQuestions(res.data.questions || []);
        setSelectedSkillName(res.data.skill_name || 'Skill');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedSkillId]);

  const handleSelectOption = (qId: number, opt: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await assessmentService.submit(selectedSkillId, selectedAnswers);
      setResult(res.data);
      // Refresh history
      const histRes = await assessmentService.getHistory();
      setHistory(histRes.data || []);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleSkillChange = (skillId: number, skillName: string) => {
    setSelectedSkillId(skillId);
    setSelectedSkillName(skillName);
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-ayush-dark text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-ayush-800/60 text-ayush-300 text-xs font-semibold px-3 py-1 rounded-full border border-ayush-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Interactive Skill Assessment Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Skill Verification Assessment</h1>
          <p className="text-xs text-slate-300">Take verified tests to update your skill profile, gap analysis, and career readiness</p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Skill Selector Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Skill to Assess:</div>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => {
            const sId = s.skill_id || s.id;
            const sName = s.skill_name || s.name;
            const isSelected = selectedSkillId === sId;
            return (
              <button
                key={sId}
                onClick={() => handleSkillChange(sId, sName)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-ayush-700 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{sName}</span>
                {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assessment Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Quiz Runner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 lg:col-span-2">
          
          {loading ? (
            <div className="py-20 text-center text-slate-500 font-medium animate-pulse">
              Loading {selectedSkillName} assessment questions...
            </div>
          ) : result ? (
            /* Result Feedback Card */
            <div className="text-center py-8 space-y-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl font-extrabold shadow-xl ${
                result.passed ? 'bg-emerald-100 text-emerald-800 border-4 border-emerald-300' : 'bg-rose-100 text-rose-800 border-4 border-rose-300'
              }`}>
                {result.score}%
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {result.passed ? 'Skill Verification Passed!' : 'Skill Assessment Completed'}
                </h3>
                <p className="text-sm text-slate-600">
                  You scored <strong>{result.correct_answers}</strong> out of <strong>{result.total_questions}</strong> questions correctly for <strong>{result.skill_name}</strong>.
                </p>
              </div>

              <div className="bg-ayush-50 p-5 rounded-2xl border border-ayush-200 text-xs text-slate-800 text-left space-y-2 max-w-md mx-auto">
                <div className="font-bold text-ayush-900 flex items-center space-x-2 text-sm">
                  <Sparkles className="w-4 h-4 text-ayush-700" />
                  <span>Profile Update Confirmation:</span>
                </div>
                <p>• Verified assessment score of <strong>{result.score}%</strong> saved to database.</p>
                <p>• Student skill vector and readiness score updated.</p>
                <p>• Re-evaluating skill gap priorities and course recommendations.</p>
              </div>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => setSelectedSkillId(selectedSkillId)} // Re-trigger test
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
                >
                  Retake Test
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 bg-ayush-700 hover:bg-ayush-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
                >
                  <span>View Updated Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              No assessment questions found for {selectedSkillName}.
            </div>
          ) : (
            /* Active Quiz Interface */
            <div className="space-y-6">
              
              {/* Question Meta Bar */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-ayush-800 uppercase tracking-wider">
                    {selectedSkillName} Assessment
                  </span>
                  <div className="text-sm font-semibold text-slate-900">
                    Question {currentIdx + 1} of {questions.length}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-slate-100 text-slate-700 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                    {currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-900 font-semibold text-base leading-relaxed">
                {currentQ.question_text}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between font-medium text-sm ${
                        isSelected
                          ? 'bg-ayush-50 border-ayush-600 text-ayush-950 font-bold shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-ayush-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1))}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-ayush-700 hover:bg-ayush-800 text-white text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center space-x-2"
                  >
                    {submitting ? 'Submitting Test...' : 'Submit Assessment'}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Right Sidebar: Assessment History */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Recent Assessment History</span>
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No completed assessments recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900">{h.skill_name}</span>
                    <span className={h.score >= 60 ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                      {h.score}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>{h.correct_answers}/{h.total_questions} Correct</span>
                    <span>{new Date(h.completed_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
