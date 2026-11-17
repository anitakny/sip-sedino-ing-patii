import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowRight,
  Compass
} from 'lucide-react';
import { DESTINATIONS_DATA } from '../data/destinationsData';
import { PACKAGES_DATA } from '../data/packagesData';
import { EKRAF_PRODUCTS } from '../data/ekrafData';

export type QuickSearchResult =
  | { type: 'destination'; id: number; title: string; subtitle: string; badge: string }
  | { type: 'package'; id: number; title: string; subtitle: string; badge: string }
  | { type: 'ekraf'; id: string; title: string; subtitle: string; badge: string };

interface QuickSearchBarProps {
  onSelectResult: (result: QuickSearchResult) => void;
  onQuickFilter: (filterType: 'alam' | 'kuliner' | 'religi' | 'itinerary' | 'ekraf') => void;
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({
  onSelectResult,
  onQuickFilter
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo<QuickSearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Show curated popular quick suggestions when focused with empty query
      return [
        ...DESTINATIONS_DATA.filter((d) => d.isPopular).slice(0, 3).map((d) => ({
          type: 'destination' as const,
          id: d.id,
          title: d.nama,
          subtitle: `${d.lokasi} • ${d.tiket}`,
          badge: d.kategoriLabel
        })),
        ...PACKAGES_DATA.slice(0, 2).map((p) => ({
          type: 'package' as const,
          id: p.id,
          title: `Paket #${p.nomor}: ${p.judul}`,
          subtitle: p.ruteRingkas,
          badge: 'Itinerary SIP'
        })),
        ...EKRAF_PRODUCTS.slice(0, 2).map((e) => ({
          type: 'ekraf' as const,
          id: e.id,
          title: e.nama,
          subtitle: `${e.lokasiSentra} • ${e.harga}`,
          badge: 'Ekraf Pati'
        }))
      ];
    }

    const destMatches: QuickSearchResult[] = DESTINATIONS_DATA.filter(
      (d) =>
        d.nama.toLowerCase().includes(trimmed) ||
        d.lokasi.toLowerCase().includes(trimmed) ||
        d.kecamatan.toLowerCase().includes(trimmed) ||
        d.kategoriLabel.toLowerCase().includes(trimmed) ||
        d.dayaTarik.toLowerCase().includes(trimmed)
    )
      .slice(0, 4)
      .map((d) => ({
        type: 'destination',
        id: d.id,
        title: d.nama,
        subtitle: `${d.lokasi} • ${d.tiket}`,
        badge: d.kategoriLabel
      }));

    const pkgMatches: QuickSearchResult[] = PACKAGES_DATA.filter(
      (p) =>
        p.judul.toLowerCase().includes(trimmed) ||
        p.ruteRingkas.toLowerCase().includes(trimmed) ||
        p.destinasiUtama.some((d) => d.toLowerCase().includes(trimmed))
    )
      .slice(0, 2)
      .map((p) => ({
        type: 'package',
        id: p.id,
        title: `Paket #${p.nomor}: ${p.judul}`,
        subtitle: p.ruteRingkas,
        badge: 'Itinerary SIP'
      }));

    const ekrafMatches: QuickSearchResult[] = EKRAF_PRODUCTS.filter(
      (e) =>
        e.nama.toLowerCase().includes(trimmed) ||
        e.kategori.toLowerCase().includes(trimmed) ||
        e.lokasiSentra.toLowerCase().includes(trimmed) ||
        e.pengrajin.toLowerCase().includes(trimmed)
    )
      .slice(0, 2)
      .map((e) => ({
        type: 'ekraf',
        id: e.id,
        title: e.nama,
        subtitle: `${e.lokasiSentra} • ${e.harga}`,
        badge: 'Ekraf Pati'
      }));

    return [...destMatches, ...pkgMatches, ...ekrafMatches];
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      const chosen = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      onSelectResult(chosen);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-2xl mx-auto mt-6 text-left">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-4 text-[#0c2b64] dark:text-[#38bdf8] pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Cari cepat destinasi, Nasi Gandul, Gua Pancur, Batik, atau Itinerary..."
          aria-label="Pencarian cepat destinasi, itinerary, dan ekraf"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className="w-full min-h-[48px] pl-12 pr-12 py-3 text-sm rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-md focus:outline-none focus:border-[#0c2b64] dark:focus:border-[#38bdf8] transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveIndex(-1);
            }}
            aria-label="Hapus pencarian"
            className="absolute right-2.5 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Filter Chips (Mobile-First Touch Targets) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'alam' as const, label: 'Wisata Alam' },
          { id: 'kuliner' as const, label: 'Kuliner Khas' },
          { id: 'religi' as const, label: 'Sejarah & Religi' },
          { id: 'itinerary' as const, label: 'Paket SIP' },
          { id: 'ekraf' as const, label: 'Produk Ekraf' }
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onQuickFilter(chip.id)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-[#0c2b64] hover:text-[#0c2b64] dark:hover:border-[#38bdf8] dark:hover:text-[#38bdf8] text-xs font-bold shadow-xs transition cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Auto-Suggest Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[54px] z-30 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden max-h-[340px] overflow-y-auto"
        >
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            <span>{query.trim() ? `Hasil Pencarian (${suggestions.length})` : 'Rekomendasi Populer'}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5"
            >
              Tutup
            </button>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-5 text-center text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              Tidak ditemukan hasil untuk <strong>"{query}"</strong>. Coba kata kunci lain seperti <em>Seloromo</em>, <em>Gandul</em>, atau <em>Bakaran</em>.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectResult(item);
                        setIsOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition min-h-[52px] ${
                        isActive
                          ? 'bg-blue-50 dark:bg-slate-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#0c2b64]/10 dark:bg-[#1a56a4]/30 text-[#0c2b64] dark:text-[#38bdf8] flex items-center justify-center shrink-0 mt-0.5">
                          {item.type === 'destination' && <MapPin className="w-4 h-4" />}
                          {item.type === 'package' && <Calendar className="w-4 h-4" />}
                          {item.type === 'ekraf' && <ShoppingBag className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#0c2b64] dark:text-[#38bdf8] shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
