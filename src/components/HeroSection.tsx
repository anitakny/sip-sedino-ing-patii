import React from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Layers,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

import { QuickSearchBar, QuickSearchResult } from './QuickSearchBar';

interface HeroSectionProps {
  onExploreWisata: () => void;
  onExploreItinerary: () => void;
  onExploreEkraf: () => void;
  onOpenMap: () => void;
  onSelectSearchResult: (result: QuickSearchResult) => void;
  onQuickFilter: (filterType: 'alam' | 'kuliner' | 'religi' | 'itinerary' | 'ekraf') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreWisata,
  onExploreItinerary,
  onExploreEkraf,
  onOpenMap,
  onSelectSearchResult,
  onQuickFilter
}) => {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 py-12 md:py-20 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-400/10 dark:bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Eksplorasi Pesona Wisata & Kreativitas{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0c2b64] via-[#1a56a4] to-[#2575fc] dark:from-[#38bdf8] dark:to-[#60a5fa]">
              Bumi Mina Tani
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal">
            Panduan harian terpadu <strong>Itinerary SIP (Sedina ing Pati)</strong>, direktori <strong>destinasi terlengkap</strong>, peta interaktif terintegrasi Google Maps, dan etalase ekonomi kreatif (Ekraf) Kabupaten Pati.
          </p>

          {/* Fast Search & Auto-Suggest Bar */}
          <QuickSearchBar
            onSelectResult={onSelectSearchResult}
            onQuickFilter={onQuickFilter}
          />

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onExploreWisata}
              className="min-h-[46px] px-6 py-3 rounded-2xl bg-[#0c2b64] hover:bg-[#164b91] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0c2b64]/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-[#38bdf8]/30 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#38bdf8]" />
              <span>Jelajahi Destinasi Wisata</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-[#38bdf8]" />
            </button>

            <button
              type="button"
              onClick={onExploreItinerary}
              className="min-h-[46px] px-5 py-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-[#0c2b64] dark:text-[#38bdf8] border border-sky-200 dark:border-sky-800 font-bold text-xs sm:text-sm shadow-xs hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Rute Itinerary SIP</span>
            </button>

            <button
              type="button"
              onClick={onOpenMap}
              className="min-h-[46px] px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm shadow-xs hover:border-[#1a56a4] dark:hover:border-[#38bdf8] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#0c2b64] dark:text-[#38bdf8]" />
              <span>Buka Peta Interaktif</span>
            </button>

            <button
              type="button"
              onClick={onExploreEkraf}
              className="min-h-[46px] px-5 py-3 rounded-2xl bg-[#0c2b64]/10 dark:bg-[#1a56a4]/20 text-[#0c2b64] dark:text-[#38bdf8] font-bold text-xs sm:text-sm hover:bg-[#0c2b64]/20 dark:hover:bg-[#1a56a4]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Direktori Ekraf</span>
            </button>
          </div>
        </div>

        {/* Interactive Feature Strip (Direct Navigation Shortcuts) */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={onExploreWisata}
            className="group text-left bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-[#1a56a4] dark:hover:border-[#38bdf8] shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#0c2b64] dark:text-[#38bdf8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#0c2b64] dark:group-hover:text-[#38bdf8] transition-colors">
                  Destinasi
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                  Wisata &amp; Kuliner Pati
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0c2b64] dark:group-hover:text-[#38bdf8] group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
          </button>

          <button
            type="button"
            onClick={onExploreItinerary}
            className="group text-left bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-sky-500 dark:hover:border-[#38bdf8] shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                  Itinerary SIP
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                  Rute Harian Terpadu
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
          </button>

          <button
            type="button"
            onClick={onExploreEkraf}
            className="group text-left bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  Ekraf Pati
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                  Produk &amp; Sentra UMKM
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="group text-left bg-white/90 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  Google Maps
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                  Foto &amp; Navigasi Aktif
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
          </button>
        </div>
      </div>
    </div>
  );
};
