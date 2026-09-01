import React, { useState, useEffect, useRef } from 'react';
import { testRoomService } from '../services/api';
import {
  Hash, ArrowRight, Clock, Users, Award, Building2,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  Timer, Sparkles, Shield, AlertTriangle, Trophy
} from 'lucide-react';

type Phase = 'join' | 'preview' | 'test' | 'result';

interface RoomInfo {
  id: number;
  room_code: string;
  title: string;
  description?: string;
  company_name: string;
  recruiter_name: string;
  skill_names: string[];
  num_questions: number;
  duration_minutes: number;
  status: string;
  participant_count: number;
}

interface Question {
  id: number;
  question_text: string;
  options: string[];
  difficulty: string;
  category: string;
}

interface TestResult {
  score: number;
  correct_answers: number;
  total_questions: number;
}

export const StudentTestRoomPage: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('join');
  const [roomCode, setRoomCode] = useState('');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (phase === 'test' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, timeLeft > 0]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLookup = async () => {
    setError('');
    if (roomCode.trim().length < 4) {
      setError('Please enter a valid Room ID (6 characters)');
      return;
    }
    setLoading(true);
    try {
      const res = await testRoomService.getRoomDetails(roomCode.trim().toUpperCase());
      setRoomInfo(res.data);
      setPhase('preview');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Room not found. Please check the Room ID.');
    }
    setLoading(false);
  };

  const handleJoinAndStart = async () => {
    setError('');
    setLoading(true);
    try {
      await testRoomService.joinRoom(roomInfo!.room_code);
      const qRes = await testRoomService.getRoomQuestions(roomInfo!.room_code);
      setQuestions(qRes.data.questions || []);
      setTimeLeft(roomInfo!.duration_minutes * 60);
      setPhase('test');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to join room');
    }
    setLoading(false);
  };

  const selectAnswer = (qId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await testRoomService.submitRoom(roomInfo!.room_code, answers);
      setResult(res.data);
      setPhase('result');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Submission failed');
    }
    setSubmitting(false);
  };

  // ─── JOIN PHASE ───────────────────────────────────────────────────────────────
  if (phase === 'join') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Glassmorphism Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Hash className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Join Test Room</h1>
              <p className="text-sm text-slate-500">Enter the Room ID shared by your recruiter to start the assessment</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Room ID</label>
              <input
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="Enter 6-character code"
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 text-center text-2xl font-mono font-extrabold tracking-[0.3em] text-slate-900 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-slate-50 transition placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal placeholder:font-normal"
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
              />
            </div>

            <button
              onClick={handleLookup}
              disabled={loading || roomCode.trim().length < 4}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-60 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Finding Room...</span>
                </>
              ) : (
                <>
                  <span>Find Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center space-x-2 justify-center text-xs text-slate-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure assessment platform powered by Nexora-Skill</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PREVIEW PHASE ────────────────────────────────────────────────────────────
  if (phase === 'preview' && roomInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            {/* Room Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-1.5 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200">
                <Building2 className="w-3.5 h-3.5" />
                <span>{roomInfo.company_name}</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">{roomInfo.title}</h1>
              {roomInfo.description && <p className="text-sm text-slate-500">{roomInfo.description}</p>}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {/* Room Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                <Hash className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-slate-900">{roomInfo.num_questions}</div>
                <div className="text-[10px] text-slate-500 font-bold">Questions</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-slate-900">{roomInfo.duration_minutes}</div>
                <div className="text-[10px] text-slate-500 font-bold">Minutes</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-slate-900">{roomInfo.participant_count}</div>
                <div className="text-[10px] text-slate-500 font-bold">Joined</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                <Award className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <div className="text-lg font-extrabold text-slate-900">{roomInfo.skill_names.length}</div>
                <div className="text-[10px] text-slate-500 font-bold">Skills</div>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {roomInfo.skill_names.map(s => (
                <span key={s} className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-bold">
                  {s}
                </span>
              ))}
            </div>

            {roomInfo.status !== 'open' ? (
              <div className="bg-slate-100 border border-slate-300 p-4 rounded-xl text-center">
                <XCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">This room is no longer accepting participants</p>
              </div>
            ) : (
              <button
                onClick={handleJoinAndStart}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-60 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Joining & Loading Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Join Room & Start Test</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => { setPhase('join'); setError(''); }}
              className="w-full text-xs text-slate-500 hover:text-slate-700 font-medium transition"
            >
              ← Enter Different Room ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── TEST PHASE ───────────────────────────────────────────────────────────────
  if (phase === 'test' && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const isTimeLow = timeLeft <= 60;

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500">Room: <span className="font-mono text-violet-700">{roomInfo?.room_code}</span></span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-bold text-slate-500">{roomInfo?.title}</span>
            </div>
            <div className={`flex items-center space-x-2 font-mono font-extrabold text-lg ${isTimeLow ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
              <Timer className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200">
                Question {currentQ + 1} of {questions.length}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                q.difficulty === 'Advanced' ? 'bg-rose-100 text-rose-700' :
                q.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {q.difficulty}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-relaxed">{q.question_text}</h2>

            <div className="space-y-2.5">
              {q.options.map((option, idx) => {
                const isSelected = answers[q.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(q.id, option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                        isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ(c => Math.max(0, c - 1))}
              disabled={currentQ === 0}
              className="flex items-center space-x-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                    idx === currentQ
                      ? 'bg-violet-600 text-white shadow-md'
                      : answers[questions[idx].id]
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(c => Math.min(questions.length - 1, c + 1))}
                className="flex items-center space-x-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-500 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit ({answeredCount}/{questions.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Answered summary bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              <span className="font-bold text-emerald-700">{answeredCount}</span> of {questions.length} answered
            </span>
            {answeredCount < questions.length && (
              <span className="text-amber-600 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{questions.length - answeredCount} unanswered</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const isPassed = result.score >= 60;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 text-center">
            {/* Score Circle */}
            <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center border-4 ${
              isPassed ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50'
            }`}>
              <div>
                <div className={`text-3xl font-extrabold ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {result.score.toFixed(0)}%
                </div>
                <div className="text-[10px] font-bold text-slate-500">SCORE</div>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {isPassed ? '🎉 Well Done!' : 'Keep Practicing!'}
              </h1>
              <p className="text-sm text-slate-500">
                {isPassed
                  ? 'You performed well in this assessment. Your results have been shared with the recruiter.'
                  : 'Review your weak areas and try again in future assessments. Your results are saved.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <div className="text-xl font-extrabold text-emerald-700">{result.correct_answers}</div>
                <div className="text-[10px] font-bold text-emerald-600">Correct</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-xl font-extrabold text-slate-700">{result.total_questions}</div>
                <div className="text-[10px] font-bold text-slate-500">Total Questions</div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Room: <span className="font-mono font-bold text-violet-600">{roomInfo?.room_code}</span> • {roomInfo?.company_name}</span>
            </div>

            <button
              onClick={() => {
                setPhase('join');
                setRoomCode('');
                setRoomInfo(null);
                setQuestions([]);
                setAnswers({});
                setResult(null);
                setError('');
                setCurrentQ(0);
              }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              Join Another Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback loading
  return (
    <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">
      Loading...
    </div>
  );
};
