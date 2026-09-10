"use client";

import { useEffect, useState } from "react";

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProblems();
  }, []);

  async function loadProblems() {
    try {
      const response = await fetch("/api/problems");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load problems");
      }

      setProblems(data.problems || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-300 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <p className="text-indigo-400 text-sm font-mono">
            CODESPIRIT / PROBLEMS
          </p>

          <h1 className="text-3xl font-bold text-white mt-2">
            Coding Problems
          </h1>

          <p className="text-gray-500 mt-2">
            Solve coding problems and earn coins.
          </p>
        </div>

        {loading && (
          <p className="text-gray-500">
            Loading problems...
          </p>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && problems.length === 0 && (
          <div className="bg-[#0d1222] border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-500">
              No coding problems available yet.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="bg-[#0d1222] border border-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">
                  {problem.title}
                </h2>

                <span className="text-xs text-indigo-400">
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {problem.description}
              </p>

              <div className="flex items-center justify-between mt-6">
                <span className="text-amber-400 text-sm">
                  🪙 {problem.points || 10} Coins
                </span>

                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm">
                  Solve →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}