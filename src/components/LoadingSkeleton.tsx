import React from 'react';

export const PageSkeleton: React.FC = () => (
  <div className="py-10 md:py-16 bg-slate-50 dark:bg-slate-950 animate-pulse" aria-busy="true" aria-label="Memuat halaman...">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-3 max-w-2xl">
        <div className="h-6 w-44 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-3/4 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="aspect-16/10 bg-slate-200 dark:bg-slate-800" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const MapSkeleton: React.FC = () => (
  <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 animate-pulse" aria-busy="true" aria-label="Memuat peta interaktif...">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-2 max-w-xl">
        <div className="h-6 w-48 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[460px] md:h-[560px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="lg:col-span-4 h-[460px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  </section>
);
