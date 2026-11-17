import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  MapPin,
  Send,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { ReviewItem } from '../types';
import { DESTINATIONS_DATA } from '../data/destinationsData';
import confetti from 'canvas-confetti';

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  onAddReview: (review: ReviewItem) => void;
  onDeleteReview?: (id: string) => void;
  onHelpfulReview?: (id: string) => void;
}

const DESTINATION_OPTIONS = [
  ...DESTINATIONS_DATA.slice(0, 15).map((d) => d.nama),
  'Wisata Kuliner Pati',
  'Sentra Batik Tulis Bakaran',
  'Lainnya / Wisata Pati'
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  onAddReview,
  onDeleteReview,
  onHelpfulReview
}) => {
  const [helpfulClickedMap, setHelpfulClickedMap] = useState<Record<string, boolean>>({});
  const [localHelpfulDelta, setLocalHelpfulDelta] = useState<Record<string, number>>({});

  // Inline comment form state
  const [formNama, setFormNama] = useState('');
  const [formAsal, setFormAsal] = useState('');
  const [formDestinasi, setFormDestinasi] = useState(DESTINATION_OPTIONS[0]);
  const [formRating, setFormRating] = useState(5);
  const [formKomentar, setFormKomentar] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const positivePct =
    reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)
      : 0;

  const handleHelpful = (id: string) => {
    if (helpfulClickedMap[id]) return;
    setHelpfulClickedMap((prev) => ({ ...prev, [id]: true }));
    if (onHelpfulReview) {
      onHelpfulReview(id);
    } else {
      setLocalHelpfulDelta((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNama.trim()) {
      setFormError('Mohon isi nama Anda terlebih dahulu.');
      return;
    }
    if (formKomentar.trim().length < 5) {
      setFormError('Mohon tuliskan komentar minimal 5 karakter.');
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());

    const newRev: ReviewItem = {
      id: `rev-user-${Date.now()}`,
      nama: formNama.trim(),
      asal: formAsal.trim() || 'Pengunjung',
      destinasi: formDestinasi,
      rating: formRating,
      tanggal: formattedDate,
      komentar: formKomentar.trim(),
      rekomendasi: formRating >= 4,
      helpfulCount: 0
    };

    onAddReview(newRev);

    try {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.75 }
      });
    } catch {}

    setFormNama('');
    setFormAsal('');
    setFormKomentar('');
    setFormRating(5);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);
  };

  return (
    <section
      id="section-ulasan"
      className="py-12 md:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c2b64]/10 dark:bg-[#1a56a4]/30 border border-[#1a56a4]/30 text-[#0c2b64] dark:text-[#38bdf8] text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Ruang Komentar Pengunjung
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ulasan & Komentar{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0c2b64] via-[#1a56a4] to-[#2575fc] dark:from-[#38bdf8] dark:to-[#60a5fa]">
                Pengunjung Pati
              </span>
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl font-normal">
              Bagikan pengalaman, saran, atau ulasan kunjungan Anda di destinasi Kabupaten Pati secara langsung di kolom bawah ini.
            </p>
          </div>

          <a
            href="https://maps.app.goo.gl/5yEZTarDqncaCara8"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold transition self-start md:self-auto"
          >
            <span>Lihat Ulasan Waduk Seloromo di Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Main 2-Column Layout: Inline Comment Form + Submitted Reviews */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Inline Add Comment Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 dark:border-slate-700/80">
              <div className="w-9 h-9 rounded-xl bg-[#0c2b64] text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Tulis Komentar / Ulasan
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Langsung tampil di daftar ulasan website
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5">
              {formSuccess && (
                <div
                  role="status"
                  className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Terima kasih! Komentar Anda telah ditambahkan.</span>
                </div>
              )}

              {formError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Anda <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap / panggilan"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asal Kota
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pati, Kudus, Semarang"
                    value={formAsal}
                    onChange={(e) => setFormAsal(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destinasi yang Dikunjungi
                </label>
                <select
                  value={formDestinasi}
                  onChange={(e) => setFormDestinasi(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DESTINATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rating Kunjungan
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      aria-label={`Beri ${star} bintang`}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {formRating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Komentar Anda <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ceritakan pengalaman asli Anda saat berkunjung (akses jalan, suasana, fasilitas, atau rekomendasi untuk pengunjung lain)..."
                  value={formKomentar}
                  onChange={(e) => setFormKomentar(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="min-h-[44px] w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0c2b64]/25 transition cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#38bdf8]" />
                <span>Kirim Komentar ke Halaman Ini</span>
              </button>
            </form>
          </div>

          {/* Right: Summary + Real Visitor Comments List (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Real Rating Summary Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  {avgRating}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          reviews.length > 0 && i < Math.round(Number(avgRating))
                            ? 'fill-current'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {reviews.length > 0
                      ? `Dari ${reviews.length} komentar pengunjung`
                      : 'Belum ada komentar tersimpan'}
                  </p>
                </div>
              </div>

              {reviews.length > 0 && (
                <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Rekomendasi Positif:{' '}
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {positivePct}%
                  </span>
                </div>
              )}
            </div>

            {/* Comments List or Honest Empty State */}
            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 p-8 sm:p-10 text-center space-y-2.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0c2b64]/10 dark:bg-[#1a56a4]/30 text-[#0c2b64] dark:text-[#38bdf8] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Belum Ada Komentar Pengunjung
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Kami tidak menampilkan ulasan buatan. Silakan tulis komentar atau pengalaman kunjungan Anda melalui formulir di samping agar tampil di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => {
                  const helpfulTotal = (rev.helpfulCount || 0) + (localHelpfulDelta[rev.id] || 0);
                  const alreadyClicked = Boolean(helpfulClickedMap[rev.id]);

                  return (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-slate-800/70 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {rev.avatarUrl ? (
                            <img
                              src={rev.avatarUrl}
                              alt={rev.nama}
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 rounded-full object-cover border border-blue-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#0c2b64] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-[#38bdf8]/40">
                              {getInitials(rev.nama)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {rev.nama}
                            </h4>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                              <span>{rev.asal}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(rev.rating)
                                  ? 'fill-current'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 inline-block">
                          {rev.destinasi}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                        {rev.komentar}
                      </p>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{rev.tanggal}</span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleHelpful(rev.id)}
                            disabled={alreadyClicked}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer ${
                              alreadyClicked
                                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Membantu ({helpfulTotal})</span>
                          </button>

                          {onDeleteReview && (
                            <button
                              type="button"
                              onClick={() => onDeleteReview(rev.id)}
                              title="Hapus komentar"
                              aria-label="Hapus komentar"
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
