'use client';

/**
 * Modern shimmer skeleton loader components for tables, cards, and list views.
 */

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full glass-card rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-xl animate-pulse">
      <div className="p-4 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
            {Array.from({ length: cols }).map((_, j) => (
              <div 
                key={j} 
                className={`h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg ${
                  j === 0 ? 'w-24 font-mono' : j === cols - 1 ? 'w-16 ml-auto' : 'flex-1'
                }`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800/60 rounded-md" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
