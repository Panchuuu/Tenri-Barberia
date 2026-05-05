export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 animate-pulse">
      <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 mb-6 mx-auto"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
    </div>
  );
}