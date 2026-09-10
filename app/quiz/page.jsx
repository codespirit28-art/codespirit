'use client';

import React, { useState } from 'react';


export default function QuizPage() {
  // Simple state tracking for the selected option letter (e.g., 'A', 'B', etc.)
  const [selectedOption, setSelectedOption] = useState('A');

  const options = [
    { id: 'A', text: 'extends' },
    { id: 'B', text: 'implements' },
    { id: 'C', text: 'super' },
    { id: 'D', text: 'interface' },
  ];

  return (
    <div className="bg-[#0b0f19] text-gray-300 font-sans min-h-screen flex flex-col justify-between">
      
   
      <header className="px-8 py-5 border-b border-gray-900 bg-[#0b0f19]">
        <span className="text-xl font-bold text-white tracking-wide">CodeQuest</span>
      </header>

   
      <main className="max-w-4xl w-full mx-auto px-6 py-8 flex-grow flex flex-col justify-center">
        
        {/* Navigation & Reward Strip */}
        <div className="flex items-center justify-between text-xs tracking-wider mb-6">
          <button className="text-gray-400 hover:text-white font-medium flex items-center gap-1.5 transition">
            &larr; EXIT QUIZ
          </button>
          <div className="border border-gray-800 text-gray-400 px-3 py-1.5 rounded-full flex items-center gap-1">
            <span className="text-amber-500 font-mono text-sm">🖻</span> Up to 20 Coins
          </div>
        </div>

        {/* Header Block & Count */}
        <div className="flex items-end justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-white">Java OOP Quiz</h1>
          <span className="text-sm font-semibold text-indigo-400 tracking-wide">Question 7 / 10</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-gray-900 rounded-full h-1.5 mb-10 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full w-[70%]" />
        </div>

        {/* Question Panel Display */}
        <div className="bg-[#0d1222] border border-gray-800/50 rounded-xl p-10 text-center mb-8 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-200 tracking-wide max-w-xl mx-auto leading-relaxed">
            Which keyword is used to inherit a class in Java?
          </h2>
        </div>

        {/* Multi-Choice Answers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {options.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`flex items-center justify-between p-5 rounded-xl border text-left transition group ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.08)]'
                    : 'border-gray-800/80 bg-[#0d1222] hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Indicator Letter Ball */}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/60'
                    }`}
                  >
                    {option.id}
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-indigo-300 font-medium' : 'text-gray-400'}`}>
                    {option.text}
                  </span>
                </div>
                
                {/* Active Checkmark Marker */}
                {isSelected && (
                  <span className="text-indigo-400 text-sm font-bold bg-indigo-500/10 p-1 rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Primary Page Workflow Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-900/60">
          <button className="border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/5 px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest transition uppercase">
            &larr; Previous
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-lg text-xs font-bold tracking-widest transition uppercase shadow-md flex items-center gap-2">
            Next &rarr;
          </button>
        </div>

      </main>

      {/* Empty buffer box to center the viewport gracefully */}
      <footer className="py-4" />
    </div>
  );
}
