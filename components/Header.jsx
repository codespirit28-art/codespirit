"use client";
import { LogOut,
} from "lucide-react";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
  export default function Header() {
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("LOGOUT ERROR:", err);
    } finally {
      router.push("/login");
    }
  }
  return (
    <header className="border-b border-slate-800 bg-[#0b0e17] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-12">
        <div className="text-2xl font-bold tracking-tight text-white">CodeSpirit</div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
          <a href="/dashboard" className="hover:text-white transition">Dashboard</a>
          <a href="/problems" className="text-white border-b-2 border-indigo-500 pb-5 -mb-5">Problems</a>
          <a href="/quizzes" className="hover:text-white transition">Quizzes</a>
          <a href="/resources" className="hover:text-white transition">Resources</a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-amber-400 text-sm font-semibold">
           {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="text-[#bbb9c9] transition hover:text-red-400"
            >
              <LogOut size={20} />
            </button>
          </div>
      
        </div>
      
    </header>
  );
}
