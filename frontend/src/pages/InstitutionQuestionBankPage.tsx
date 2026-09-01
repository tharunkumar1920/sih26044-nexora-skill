import React, { useState, useEffect } from 'react';
import { institutionService } from '../services/api';
import { HelpCircle, Plus, Search, Filter, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const InstitutionQuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // New Question Form Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number>(1);
  const [qText, setQText] = useState<string>('Which library in Python is used for data manipulation and tabular analysis?');
  const [optA, setOptA] = useState<string>('pandas');
  const [optB, setOptB] = useState<string>('numpy');
  const [optC, setOptC] = useState<string>('scipy');
  const [optD, setOptD] = useState<string>('matplotlib');
  const [correctAns, setCorrectAns] = useState<string>('pandas');
  const [difficulty, setDifficulty] = useState<string>('Beginner');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        institutionService.getQuestions(),
        institutionService.getSkills()
      ]);
      setQuestions(qRes.data || []);
      setSkills(sRes.data || []);
      if (sRes.data.length > 0) {
        setSelectedSkillId(sRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await institutionService.createQuestion({
        skill_id: selectedSkillId,
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_answer: correctAns,
        difficulty: difficulty,
        category: 'Technical'
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !search || q.question_text.toLowerCase().includes(search.toLowerCase()) || q.skill_name.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = !skillFilter || q.skill_name === skillFilter;
    return matchesSearch && matchesSkill;
  });

  if (loading) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Question Bank Manager...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-900/60 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-700/50">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Assessment Question Bank</span>
          </div>
          <h1 className="text-2xl font-extrabold">Question Bank Manager</h1>
          <p className="text-xs text-slate-300">Create, inspect, and configure multiple-choice assessment questions per skill</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search questions by text or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-xs outline-none"
          >
            <option value="">All Skills ({questions.length} questions)</option>
            {Array.from(new Set(questions.map(q => q.skill_name))).map(sName => (
              <option key={sName} value={sName}>{sName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Cards List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <span>Assessment Question Bank ({filteredQuestions.length})</span>
        </h2>

        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div key={q.id || idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-lg border border-amber-200">
                    {q.skill_name}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-xs font-mono font-semibold px-2.5 py-0.5 rounded">
                    {q.difficulty}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono font-bold">QID #{q.id}</span>
              </div>

              <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {q.question_text}
              </p>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {q.options && q.options.map((opt: string, i: number) => {
                  const isCorrect = opt === q.correct_answer;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border font-medium flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Add Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add Question to Question Bank</h3>
            
            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {skills.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  required
                  placeholder="Enter the question text..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none h-20 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option A</label>
                  <input type="text" value={optA} onChange={(e) => setOptA(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option B</label>
                  <input type="text" value={optB} onChange={(e) => setOptB(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option C</label>
                  <input type="text" value={optC} onChange={(e) => setOptC(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option D</label>
                  <input type="text" value={optD} onChange={(e) => setOptD(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <input type="text" value={correctAns} onChange={(e) => setCorrectAns(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-xs outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-md">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
