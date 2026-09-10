export default function MetricCard({ solved, total, progress }) {
  return (
    <div className="bg-[#111422] border border-slate-800 rounded-xl p-5 min-w-[240px]">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-medium text-slate-400">Overall Progress</span>
        <span className="text-xl font-bold text-indigo-400">{progress}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="text-right text-xs text-slate-500 font-medium">
        {solved} / {total} Solved
      </div>
    </div>
  );
}
