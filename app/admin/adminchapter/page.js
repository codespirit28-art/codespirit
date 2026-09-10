'use client';

import { useMemo, useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, X, Check, LogOut, Loader2 } from 'lucide-react';

export default function ChaptersPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeSubject, setActiveSubject] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [subjectsRes, chaptersRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/chapters'),
      ]);
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
        setActiveSubject((prev) => prev || subjectsData[0]?._id || '');
      }
      if (chaptersRes.ok) {
        setChapters(await chaptersRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const res = await fetch('/api/chapters');
      if (res.ok) setChapters(await res.json());
    } catch (err) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const chaptersForSubject = useMemo(
    () =>
      chapters
        .filter((c) => c.subjectId === activeSubject)
        .sort((a, b) => a.order - b.order),
    [chapters, activeSubject]
  );

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.href = '/admin/login';
  };

  async function addChapter() {
    if (!form.title.trim() || !activeSubject) return;
    const payload = {
      subjectId: activeSubject,
      title: form.title.trim(),
      description: form.description.trim(),
      order: chaptersForSubject.length + 1,
    };

    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setForm({ title: '', description: '' });
        fetchChapters();
      }
    } catch (err) {
      console.error('Error creating chapter:', err);
    }
  }

  async function removeChapter(id) {
    if (!confirm('Delete this chapter completely from MongoDB?')) return;
    try {
      const res = await fetch(`/api/chapters?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchChapters();
    } catch (err) {
      console.error('Error destroying chapter:', err);
    }
  }

  function startEdit(chapter) {
    setEditingId(chapter._id);
    setEditForm({ title: chapter.title, description: chapter.description });
  }

  async function saveEdit(id) {
    try {
      const res = await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchChapters();
      }
    } catch (err) {
      console.error('Error updating chapter:', err);
    }
  }

  async function moveChapter(id, dir) {
    const i = chaptersForSubject.findIndex((c) => c._id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= chaptersForSubject.length) return;

    const chapterA = chaptersForSubject[i];
    const chapterB = chaptersForSubject[j];

    try {
      await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chapterA._id, order: chapterB.order }),
      });
      await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chapterB._id, order: chapterA.order }),
      });
      fetchChapters();
    } catch (err) {
      console.error('Error reordering chapters:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0e14]/95 px-6 py-3 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-semibold text-slate-100">Content Admin</span>
          <span className="text-slate-600">/</span>
          <span className="text-violet-300">Main Topics</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-rose-400 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition">
          <LogOut size={14} /> Logout
        </button>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        <aside className="w-52 shrink-0">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Subjects</p>
          {subjects.length === 0 && !isLoading ? (
            <p className="text-xs text-amber-400/80">
              No subjects yet — add one on the Subjects page first.
            </p>
          ) : (
            <div className="space-y-1">
              {subjects.map((s) => (
                <button key={s._id} onClick={() => setActiveSubject(s._id)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${activeSubject === s._id ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                  {s.name}
                  <span className={`text-xs ${activeSubject === s._id ? 'text-violet-200' : 'text-slate-600'}`}>
                    {chapters.filter((c) => c.subjectId === s._id).length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-100">Add chapter to <span className="text-violet-300">{subjects.find((s) => s._id === activeSubject)?.name ?? '—'}</span></h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Chapter title..." className="rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500" />
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description (optional)" className="rounded-md border border-white/10 bg-[#0b0e14] px-3 py-2 text-sm outline-none focus:border-violet-500" />
            </div>
            <button onClick={addChapter} disabled={!activeSubject} className="mt-3 flex items-center gap-1.5 rounded-md bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"><Plus size={15} /> Add chapter</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-100">Chapters ({chaptersForSubject.length})</h2>
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center py-12 gap-2 text-sm text-slate-400"><Loader2 className="animate-spin text-violet-500" size={18} /> Loading chapters...</div>
            ) : chaptersForSubject.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No chapters found in database.</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {chaptersForSubject.map((c, i) => (
                  <li key={c._id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-white/[0.01] transition">
                    {editingId === c._id ? (
                      <div className="flex-1 grid gap-2 sm:grid-cols-2">
                        <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="rounded-md border border-violet-500 bg-[#0b0e14] px-2.5 py-1 text-sm outline-none" />
                        <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} className="rounded-md border border-violet-500 bg-[#0b0e14] px-2.5 py-1 text-sm outline-none" />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-violet-400 w-5">#{c.order}</span>
                          <h3 className="text-sm font-medium text-slate-200 truncate">{c.title}</h3>
                        </div>
                        {c.description && <p className="text-xs text-slate-400 pl-7 mt-0.5 truncate">{c.description}</p>}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {editingId === c._id ? (
                        <>
                          <button onClick={() => saveEdit(c._id)} className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 rounded bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button disabled={i === 0} onClick={() => moveChapter(c._id, 'up')} className="p-1 rounded text-slate-400 hover:bg-white/5 disabled:opacity-30"><ArrowUp size={14} /></button>
                          <button disabled={i === chaptersForSubject.length - 1} onClick={() => moveChapter(c._id, 'down')} className="p-1 rounded text-slate-400 hover:bg-white/5 disabled:opacity-30"><ArrowDown size={14} /></button>
                          <button onClick={() => startEdit(c)} className="p-1 rounded text-slate-400 hover:bg-white/5 hover:text-violet-400"><Pencil size={14} /></button>
                          <button onClick={() => removeChapter(c._id)} className="p-1 rounded text-slate-400 hover:bg-white/5 hover:text-rose-400"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}