import React, { useState, useEffect } from 'react';
import { institutionService } from '../services/api';
import { Database, Plus, Search, Filter, Sparkles, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

export const InstitutionTaxonomyPage: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Add Skill Modal State
  const [showSkillModal, setShowSkillModal] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('LLM Fine-Tuning');
  const [newSkillCat, setNewSkillCat] = useState<string>('Technical');
  const [newSkillDesc, setNewSkillDesc] = useState<string>('Large language model adaptation, RAG, and prompt engineering.');

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await institutionService.getSkills();
      setSkills(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await institutionService.createSkill({
        name: newSkillName,
        category_name: newSkillCat,
        description: newSkillDesc
      });
      setShowSkillModal(false);
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSkills = skills.filter(s => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description && s.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !categoryFilter || s.category_name === categoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return <div className="p-8 text-center py-20 text-slate-500 font-medium animate-pulse">Loading Skills Taxonomy Management...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-900/60 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full border border-amber-700/50">
            <Database className="w-3.5 h-3.5" />
            <span>Taxonomy Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold">Skills Taxonomy Editor</h1>
          <p className="text-xs text-slate-300">Manage standardized technical, soft skill, and Ayush domain taxonomy records</p>
        </div>

        <button
          onClick={() => setShowSkillModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill to Taxonomy</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search skill taxonomy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories ({skills.length})
          </button>
          <button
            onClick={() => setCategoryFilter('Technical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'Technical' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Technical
          </button>
          <button
            onClick={() => setCategoryFilter('Soft Skill')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'Soft Skill' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Soft Skills
          </button>
          <button
            onClick={() => setCategoryFilter('Ayush Domain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'Ayush Domain' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ayush Domain
          </button>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Tag className="w-5 h-5 text-amber-600" />
            <span>Taxonomy Records ({filteredSkills.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Skill Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkills.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">#{s.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">{s.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                      s.category_name === 'Technical'
                        ? 'bg-sky-50 text-sky-900 border-sky-200'
                        : s.category_name === 'Soft Skill'
                        ? 'bg-purple-50 text-purple-900 border-purple-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}>
                      {s.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{s.description || 'Standard skill record'}</td>
                  <td className="px-6 py-4">
                    {s.is_custom ? (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                        Custom Added
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        System Standard
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-amber-700 font-bold hover:underline">Edit Record</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Skill to Taxonomy</h3>
            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Soft Skill">Soft Skill</option>
                  <option value="Ayush Domain">Ayush Domain</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none h-20"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
