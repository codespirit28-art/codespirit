import React from 'react';

export default function MCQCard({
  title,
  isCompleted,
  points,
  description,
  questionsCount,
  topic,
  difficulty,
  bestScore,
}) {
  return (
    <div className="bg-[#0d1222] border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            {title}
            {isCompleted ? (
              <span className="text-emerald-500 text-sm">✓</span>
            ) : (
              <span className="text-gray-600 text-sm">○</span>
            )}
          </h4>
          <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
            ⭐ +{points}
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center gap-3 text-xs">
          <span className={`font-semibold ${
            difficulty === 'Easy' ? 'text-emerald-500' : 
            difficulty === 'Medium' ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {difficulty}
          </span>
          <span className="text-gray-500">{topic}</span>
          <span className="text-gray-600 font-medium">{questionsCount} Questions</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800/60">
        {isCompleted ? (
          <>
            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              ✓ Completed <span className="text-gray-500 ml-1">(Best: {bestScore})</span>
            </span>
            <button className="border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1">
              Retake Quiz &rarr;
            </button>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">⊖ Unattempted</span>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1">
              Start Quiz &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
}
