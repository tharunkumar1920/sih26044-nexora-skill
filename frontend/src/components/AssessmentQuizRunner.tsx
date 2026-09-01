import React, { useState, useEffect } from 'react';
import { assessmentService } from '../services/api';
import { X, CheckCircle2, Clock, HelpCircle, Award, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  difficulty: string;
}

interface AssessmentQuizRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: number;
  skillName: string;
  onCompleted?: () => void;
}

export const AssessmentQuizRunner: React.FC<AssessmentQuizRunnerProps> = ({
  isOpen,
  onClose,
  skillId,
  skillName,
  onCompleted
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && skillId) {
      setLoading(true);
      setResult(null);
      setSelectedAnswers({});
      setCurrentIdx(0);
      assessmentService.getQuestions(skillId)
        .then(res => {
          setQuestions(res.data.questions || []);
          setTimeLeft(res.data.duration_minutes * 60);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, skillId]);

  useEffect(() => {
    if (!isOpen || result || loading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, result, loading, timeLeft]);

  if (!isOpen) return null;

  const handleSelectOption = (qId: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await assessmentService.submit(skillId, selectedAnswers);
      setResult(res.data);
      if (onCompleted) onCompleted();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4.5 flex justify-between items-center border-b border-slate-800">
          <div>
            <span className="text-xs bg-ayush-800 text-ayush-200 px-2 py-0.5 rounded font-semibold">Skill Verification Assessment</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{skillName} Test</h3>
          </div>
          <div className="flex items-center space-x-3">
            {!result && (
              <div className="flex items-center space-x-1.5 bg-slate-800 text-amber-400 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-slate-700">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium animate-pulse">Loading Question Bank...</div>
          ) : result ? (
            /* Result Feedback View */
            <div className="text-center py-6 space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-extrabold shadow-lg ${
                result.passed ? 'bg-emerald-100 text-emerald-700 border-4 border-emerald-300' : 'bg-rose-100 text-rose-700 border-4 border-rose-300'
              }`}>
                {result.score}%
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">
                  {result.passed ? 'Skill Verification Passed!' : 'Skill Assessment Complete'}
                </h4>
                <p className="text-sm text-slate-600">
                  Correct Answers: <strong>{result.correct_answers} / {result.total_questions}</strong>
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 text-left space-y-2">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-ayush-600" />
                  <span>Profile Update Summary:</span>
                </div>
                <p>• Verified assessment score of <strong>{result.score}%</strong> saved to your profile.</p>
                <p>• Student overall career readiness score updated dynamically.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-ayush-700 hover:bg-ayush-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md"
              >
                Return to Dashboard
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No questions available for this skill</div>
          ) : (
            /* Active Quiz Questions View */
            <div className="space-y-5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">{currentQ.difficulty}</span>
              </div>

              <div className="text-base font-semibold text-slate-900 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {currentQ.question_text}
              </div>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`w-full text-left p-3.5 rounded-xl font-medium text-sm border transition-all flex items-center justify-between ${
                      selectedAnswers[currentQ.id] === opt
                        ? 'bg-ayush-50 border-ayush-600 text-ayush-900 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedAnswers[currentQ.id] === opt && <CheckCircle2 className="w-4 h-4 text-ayush-600" />}
                  </button>
                ))}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIdx(prev => Math.max(prev - 1, 0))}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => Math.min(prev + 1, questions.length - 1))}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-ayush-700 hover:bg-ayush-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
                  >
                    {submitting ? 'Evaluating Test...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
