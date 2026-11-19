import React, { useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  ExternalLink,
  Download,
  Compass,
} from 'lucide-react';
import { MediaItem } from '../types';
import { findMatchingDestination } from '../utils/destinationMediaMatcher';

interface GalleryModalProps {
  item: MediaItem | null;
  items: MediaItem[];
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  onGoToDestination?: (destId: number) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  item,
  items,
  onClose,
  onSelect,
  onGoToDestination,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, items]);

  if (!item) return null;

  const currentIndex = Math.max(
    0,
    items.findIndex((i) => i.id === item.id)
  );
  const handlePrev = () => {
    if (items.length === 0) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onSelect(items[prevIndex]);
  };
  const handleNext = () => {
    if (items.length === 0) return;
    const nextIndex = (currentIndex + 1) % items.length;
    onSelect(items[nextIndex]);
  };

  const matchedDest = findMatchingDestination(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 md:p-6 animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row max-h-[90vh]">
        {/* Media Canvas Area */}
        <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden min-h-[300px] md:min-h-[500px]">
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            {item.tipe === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                playsInline
                className="max-h-[68vh] w-full object-contain"
              />
            ) : (
              <img
                src={item.url}
                alt={item.judul}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] w-full object-contain select-none"
              />
            )}

            {/* Prev / Next navigation buttons */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-all hover:scale-105 cursor-pointer"
                  title="Dokumentasi Sebelumnya (Panah Kiri)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur transition-all hover:scale-105 cursor-pointer"
                  title="Dokumentasi Selanjutnya (Panah Kanan)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Badge media type */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-black/60 text-white backdrop-blur">
              {item.tipe === 'video' ? 'Video Wisata' : 'Foto Wisatawan'}
            </div>
          </div>

          {/* Thumbnail strip for browsing previous & newest photos */}
          {items.length > 1 && (
            <div className="bg-slate-950/90 border-t border-white/10 px-3 py-2 flex items-center gap-2 overflow-x-auto">
              {items.map((thumb, idx) => {
                const isActive = thumb.id === item.id;
                return (
                  <button
                    key={thumb.id}
                    type="button"
                    onClick={() => onSelect(thumb)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                      isActive
                        ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/40'
                        : 'border-white/20 opacity-65 hover:opacity-100'
                    }`}
                    title={`${thumb.judul} (${idx + 1})`}
                  >
                    <img
                      src={thumb.thumbnailUrl || thumb.url}
                      alt={thumb.judul}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="w-full md:w-80 lg:w-96 p-5 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
          <div>
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {currentIndex + 1} dari {items.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {item.judul}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.keterangan}
              </p>
            </div>

            {/* Meta details */}
            <div className="mt-5 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.lokasi}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Oleh: <strong className="text-slate-700 dark:text-slate-200">{item.penulis}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Diunggah {item.tanggal}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {matchedDest && onGoToDestination && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToDestination(matchedDest.id);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white transition shadow-sm cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Lihat Detail &amp; Rute {matchedDest.nama}</span>
              </button>
            )}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              download={item.judul}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Gambar Resolusi Asli
            </a>
            <a
              href={
                matchedDest?.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.lokasi + ' Pati Jawa Tengah')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Lihat Lokasi di Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
