import React, { useState, useEffect } from 'react';
import { testRoomService, institutionService } from '../services/api';
import {
  Plus, Users, Clock, Copy, CheckCircle2, XCircle,
  ClipboardList, Award, ChevronDown, ChevronUp,
  Sparkles, Lock, Hash, Timer, BarChart3, Trophy
} from 'lucide-react';

interface SkillOption {
  id: number;
  name: string;
  category_name: string;
}

interface TestRoom {
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
  created_at: string;
  expires_at?: string;
}

interface Participant {
  student_id: number;
  student_name: string;
  college_name?: string;
  score?: number;
  correct_answers?: number;
  total_questions?: number;
  status: string;
  joined_at: string;
  submitted_at?: string;
}

export const RecruiterTestRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<TestRoom[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    skill_ids: [] as number[],
    num_questions: 10,
    duration_minutes: 30,
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, skillsRes] = await Promise.all([
        testRoomService.getMyRooms(),
        institutionService.getSkills(),
      ]);
      setRooms(roomsRes.data);
      setSkills(skillsRes.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (form.skill_ids.length === 0) {
      setCreateError('Please select at least one skill to test');
      return;
    }
    setCreating(true);
    try {
      await testRoomService.create(form);
      setShowCreate(false);
      setForm({ title: '', description: '', skill_ids: [], num_questions: 10, duration_minutes: 30 });
      fetchData();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create room');
    }
    setCreating(false);
  };

  const toggleSkill = (id: number) => {
    setForm(f => ({
      ...f,
      skill_ids: f.skill_ids.includes(id)
        ? f.skill_ids.filter(s => s !== id)
        : [...f.skill_ids, id],
    }));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadResults = async (roomCode: string) => {
    if (expandedRoom === roomCode) {
      setExpandedRoom(null);
      return;
    }
    try {
      const res = await testRoomService.getRoomResults(roomCode);
      setParticipants(prev => ({ ...prev, [roomCode]: res.data }));
      setExpandedRoom(roomCode);
    } catch (err) {
      console.error(err);
    }
  };

  const closeRoom = async (roomCode: string) => {
    try {
      await testRoomService.closeRoom(roomCode);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">
        Loading Test Rooms...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 text-white rounded-3xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-violet-900/60 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full border border-violet-700/50">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Mass Assessment Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold">Test Rooms</h1>
            <p className="text-xs text-slate-300">
              Create assessment rooms and share the Room ID with students for mass bulk testing
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showCreate ? 'Cancel' : 'Create Room'}</span>
          </button>
        </div>
      </div>

      {/* Create Room Form */}
      {showCreate && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-5 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span>Create New Test Room</span>
          </h2>

          {createError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
              {createError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Room Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="e.g. Python & SQL Assessment - Batch 2026"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the assessment"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Skills to Test *</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      form.skill_ids.includes(skill.id)
                        ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    {skill.name}
                  </button>
                ))}
                {skills.length === 0 && (
                  <p className="text-xs text-slate-400">No skills available. Add skills from Institution → Taxonomy.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>Number of Questions</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={form.num_questions}
                  onChange={e => setForm(f => ({ ...f, num_questions: parseInt(e.target.value) || 10 }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duration (minutes)</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={form.duration_minutes}
                  onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 30 }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-60 text-sm"
            >
              {creating ? 'Creating Room...' : 'Create Test Room & Generate Code'}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Total Rooms</div>
          <div className="text-2xl font-extrabold text-slate-900">{rooms.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Active Rooms</div>
          <div className="text-2xl font-extrabold text-violet-700">{rooms.filter(r => r.status === 'open').length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Total Participants</div>
          <div className="text-2xl font-extrabold text-emerald-700">{rooms.reduce((a, r) => a + r.participant_count, 0)}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-medium text-slate-500">Closed Rooms</div>
          <div className="text-2xl font-extrabold text-slate-500">{rooms.filter(r => r.status === 'closed').length}</div>
        </div>
      </div>

      {/* Room List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <ClipboardList className="w-5 h-5 text-violet-600" />
          <span>Your Test Rooms</span>
        </h2>

        {rooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">No test rooms created yet</p>
            <p className="text-xs text-slate-400">Click "Create Room" to get started with mass assessments</p>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="font-bold text-slate-900">{room.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        room.status === 'open'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    {room.description && <p className="text-xs text-slate-500">{room.description}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {room.skill_names.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-md text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center space-x-1"><Hash className="w-3 h-3" /><span>{room.num_questions} Qs</span></span>
                      <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{room.duration_minutes} min</span></span>
                      <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{room.participant_count} joined</span></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Room Code Badge */}
                    <button
                      onClick={() => copyCode(room.room_code)}
                      className="flex items-center space-x-2 bg-slate-900 text-white font-mono font-extrabold text-lg px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-md"
                      title="Click to copy Room ID"
                    >
                      {copiedCode === room.room_code ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm">Copied!</span></>
                      ) : (
                        <><Copy className="w-4 h-4 text-slate-400" /><span>{room.room_code}</span></>
                      )}
                    </button>

                    <button
                      onClick={() => loadResults(room.room_code)}
                      className="bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold px-3 py-2.5 rounded-xl border border-violet-200 transition-all text-xs flex items-center space-x-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Results</span>
                      {expandedRoom === room.room_code ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {room.status === 'open' && (
                      <button
                        onClick={() => closeRoom(room.room_code)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2.5 rounded-xl border border-rose-200 transition-all text-xs flex items-center space-x-1"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Close</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Results */}
              {expandedRoom === room.room_code && (
                <div className="border-t border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Participant Results ({participants[room.room_code]?.length || 0})</span>
                  </h4>

                  {(!participants[room.room_code] || participants[room.room_code].length === 0) ? (
                    <p className="text-xs text-slate-400">No participants have joined yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-500 border-b border-slate-200">
                            <th className="pb-2 font-bold">#</th>
                            <th className="pb-2 font-bold">Student Name</th>
                            <th className="pb-2 font-bold">College</th>
                            <th className="pb-2 font-bold">Status</th>
                            <th className="pb-2 font-bold">Score</th>
                            <th className="pb-2 font-bold">Correct</th>
                            <th className="pb-2 font-bold">Joined At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants[room.room_code].map((p, idx) => (
                            <tr key={p.student_id} className="border-b border-slate-100 last:border-0">
                              <td className="py-2.5 font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 font-bold text-slate-900">{p.student_name}</td>
                              <td className="py-2.5 text-slate-600">{p.college_name || '—'}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  p.status === 'submitted'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.status === 'in_progress'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {p.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-2.5">
                                {p.score != null ? (
                                  <span className={`font-extrabold ${p.score >= 70 ? 'text-emerald-700' : p.score >= 40 ? 'text-amber-700' : 'text-rose-700'}`}>
                                    {p.score.toFixed(1)}%
                                  </span>
                                ) : '—'}
                              </td>
                              <td className="py-2.5 font-bold text-slate-700">
                                {p.correct_answers != null ? `${p.correct_answers}/${p.total_questions}` : '—'}
                              </td>
                              <td className="py-2.5 text-slate-500">
                                {new Date(p.joined_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
