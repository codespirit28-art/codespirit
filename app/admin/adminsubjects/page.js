'use client';

import { useMemo, useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Check, Loader2 } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '' });

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const sortedSubjects = useMemo(
    () => [...subjects].sort((a, b) => a.order - b.order),
    [subjects]
  );

  async function addSubject() {
    if (!form.name.trim()) return;

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      });
      if (res.ok) {
        setForm({ name: '' });
        fetchSubjects();
      }
    } catch (err) {
      console.error('Error creating subject:', err);
    }
  }

  async function removeSubject(id) {
    if (!confirm('Delete this subject? Its chapters/topics will remain but become orphaned.')) return;
    try {
      const res = await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchSubjects();
    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  }

  function startEdit(subject) {
    setEditingId(subject._id);
    setEditForm({ name: subject.name });
  }

  async function saveEdit(id) {
    try {
      const res = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchSubjects();
      }
    } catch (err) {
      console.error('Error updating subject:', err);
    }
  }

  async function moveSubject(id, dir) {
    const i = sortedSubjects.findIndex((s) => s._id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= sortedSubjects.length) return;

    const subjectA = sortedSubjects[i];
    const subjectB = sortedSubjects[j];

    try {
      await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subjectA._id, order: subjectB.order }),
      });
      await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subjectB._id, order: subjectA.order }),
      });
      fetchSubjects();
    } catch (err) {
      console.error('Error reordering subjects:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0e14]/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-slate-100">Content Admin</span>
          <span className="text-slate-600">/</span>
          <span className="text-violet-300">Subjects</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-100">Add a new subject</h2>
          <div className="flex gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="e.g. Python, Java, C++"
              onKeyDown={(e) => e.key === 'Enter' && addSubject()}
              className="flex-1 rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500"
            />
            <button
              onClick={addSubject}
              className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Subjects ({sortedSubjects.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
              <Loader2 className="animate-spin text-violet-500" size={18} /> Loading subjects...
            </div>
          ) : sortedSubjects.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No subjects yet.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {sortedSubjects.map((s, i) => (
                <li key={s._id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="w-5 shrink-0 text-xs text-slate-600">#{s.order}</span>

                  {editingId === s._id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ name: e.target.value })}
                      className="flex-1 rounded-md border border-violet-500 bg-[#0b0e14] px-2.5 py-1 text-sm outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-slate-200">{s.name}</span>
                  )}

                  <div className="flex shrink-0 items-center gap-1.5">
                    {editingId === s._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(s._id)}
                          className="rounded bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded bg-white/5 p-1 text-slate-400 border border-white/10 hover:bg-white/10"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled={i === 0}
                          onClick={() => moveSubject(s._id, 'up')}
                          className="rounded p-1 text-slate-400 hover:bg-white/5 disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          disabled={i === sortedSubjects.length - 1}
                          onClick={() => moveSubject(s._id, 'down')}
                          className="rounded p-1 text-slate-400 hover:bg-white/5 disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => startEdit(s)}
                          className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-violet-400"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => removeSubject(s._id)}
                          className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}