import React, { useState, useEffect } from 'react';
import { facultyService } from '../services/api';
import { Sparkles, Plus, BookOpen, Users, Building2, Calendar, Award } from 'lucide-react';

export const FacultyCollaborationsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Joint AI Research in Ayush Herbal Extracts');
  const [type, setType] = useState<string>('Research');
  const [desc, setDesc] = useState<string>('Seeking industry partners for collaborative deep learning validation.');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, collabsRes] = await Promise.all([
        facultyService.getProfile(),
        facultyService.getCollaborations()
      ]);
      setProfile(profRes.data);
      setCollaborations(collabsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await facultyService.createCollaboration({
        title,
        type,
        description: desc,
        area: 'Ayush & AI Informatics',
        date_or_duration: '6 Months'
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Industry Collaborations Directory...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-purple-800/60 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full border border-purple-600/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academia–Industry Collaborations</span>
          </div>
          <h1 className="text-2xl font-extrabold">Industry Collaborations Directory</h1>
          <p className="text-xs text-slate-300">Browse and propose FDPs, Consultancy, Research Projects, Workshops, and Guest Lectures</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Post Collaboration Proposal</span>
        </button>
      </div>

      {/* Collaboration Opportunities Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>Active Collaboration Proposals ({collaborations.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-purple-100 text-purple-900 font-bold px-2.5 py-1 rounded-lg">
                    {c.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{c.date_or_duration}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                <p className="text-xs text-slate-500">{c.organization} • Area: {c.area}</p>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Posted by: {c.posted_by_name}</span>
                <button className="text-purple-700 font-bold hover:underline">Express Interest →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Post Collaboration Proposal</h3>
            <form onSubmit={handleCreateCollab} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Joint AI Research Project"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-xs outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Research">Joint Research</option>
                  <option value="FDP">Faculty Development Program</option>
                  <option value="Consultancy">Consultancy</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  placeholder="Describe the collaboration objective..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 text-xs outline-none h-20 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Publish Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
