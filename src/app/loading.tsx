export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6 transition-colors">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-[#FF9933] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium animate-pulse">Loading Nyaya AI...</p>
      </div>
    </div>
  );
}
