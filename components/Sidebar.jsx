"use client";
import { useState } from "react";

export default function Sidebar() {
  const [lang, setLang] = useState("Python 3");

  return (
    <aside className="w-64 bg-[#0b0e17] border-r border-slate-800 p-6 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-8">
        <div>
          <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Current Language</label>
          <div className="relative">
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-[#131722] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Python 3">&lt;&gt; &nbsp; Python 3</option>
              <option value="TypeScript">&lt;&gt; &nbsp; TypeScript</option>
              <option value="Go">&lt;&gt; &nbsp; Go Lang</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wider text-slate-500 uppercase mb-3">Topic Categories</label>
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 px-3 py-2 rounded-r-md text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              <span>Data Structures</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 px-3 py-2 rounded-md text-sm font-medium transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span>Algorithms</span>
            </a>
          </nav>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-amber-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-1.661-.91-3.034a6.748 6.748 0 00-.645-1.463z" clipRule="evenodd" /></svg>
          <span className="text-sm font-semibold tracking-wide uppercase">Daily Challenge</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">Solve today's puzzle for 50 bonus coins.</p>
        <a href="#" className="inline-flex items-center text-xs font-semibold text-amber-400 hover:underline">
          Attempt Now &rarr;
        </a>
      </div>
    </aside>
  );
}
