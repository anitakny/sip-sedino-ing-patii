import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  MapPin,
  Send,
  Trash2,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { ReviewItem } from '../types';
import { DESTINATIONS_DATA } from '../data/destinationsData';
import confetti from 'canvas-confetti';

export interface ReviewUpdatePayload {
  nama: string;
  asal: string;
  destinasi: string;
  rating: number;
  komentar: string;
}

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  ownedReviewIds?: string[];
  onAddReview: (review: ReviewItem) => void;
  onEditReview?: (id: string, updates: ReviewUpdatePayload) => void;
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
  ownedReviewIds = [],
  onAddReview,
  onEditReview,
  onDeleteReview,
  onHelpfulReview
}) => {
  const ownedSet = new Set(ownedReviewIds);
  const [helpfulClickedMap, setHelpfulClickedMap] = useState<Record<string, boolean>>({});
  const [localHelpfulDelta, setLocalHelpfulDelta] = useState<Record<string, number>>({});

  // Inline add comment form state
  const [formNama, setFormNama] = useState('');
  const [formAsal, setFormAsal] = useState('');
  const [formDestinasi, setFormDestinasi] = useState(DESTINATION_OPTIONS[0]);
  const [formRating, setFormRating] = useState(5);
  const [formKomentar, setFormKomentar] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline edit state (only allowed for comments authored by this user)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editAsal, setEditAsal] = useState('');
  const [editDestinasi, setEditDestinasi] = useState(DESTINATION_OPTIONS[0]);
  const [editRating, setEditRating] = useState(5);
  const [editKomentar, setEditKomentar] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Inline delete confirmation state (avoids window.confirm inside iframe)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

    const uniqueSuffix =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);

    const newRev: ReviewItem = {
      id: `rev-user-${Date.now()}-${uniqueSuffix}`,
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

  const startEditing = (rev: ReviewItem) => {
    setConfirmDeleteId(null);
    setEditError(null);
    setEditingId(rev.id);
    setEditNama(rev.nama);
    setEditAsal(rev.asal);
    setEditDestinasi(rev.destinasi);
    setEditRating(rev.rating);
    setEditKomentar(rev.komentar);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = (id: string) => {
    setEditError(null);
    if (!editNama.trim()) {
      setEditError('Nama wajib diisi.');
      return;
    }
    if (editKomentar.trim().length < 5) {
      setEditError('Komentar minimal 5 karakter.');
      return;
    }

    if (onEditReview) {
      onEditReview(id, {
        nama: editNama.trim(),
        asal: editAsal.trim() || 'Pengunjung',
        destinasi: editDestinasi,
        rating: editRating,
        komentar: editKomentar.trim()
      });
    }
    setEditingId(null);
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
                  Komentar Anda dapat Anda edit atau hapus kapan saja
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
                  const isOwner = ownedSet.has(rev.id);
                  const isEditing = isOwner && editingId === rev.id;
                  const isConfirmingDelete = isOwner && confirmDeleteId === rev.id;
                  const helpfulTotal = (rev.helpfulCount || 0) + (localHelpfulDelta[rev.id] || 0);
                  const alreadyClicked = Boolean(helpfulClickedMap[rev.id]);

                  const editDestOptions = DESTINATION_OPTIONS.includes(editDestinasi)
                    ? DESTINATION_OPTIONS
                    : [editDestinasi, ...DESTINATION_OPTIONS];

                  return (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-slate-800/70 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3.5"
                    >
                      {isEditing ? (
                        /* Inline Edit Form for Author's Own Comment */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                            <span className="text-xs font-bold text-[#0c2b64] dark:text-[#38bdf8] uppercase tracking-wider">
                              Edit Komentar Anda
                            </span>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                              aria-label="Batal edit"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {editError && (
                            <div
                              role="alert"
                              className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold"
                            >
                              {editError}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Nama
                              </label>
                              <input
                                type="text"
                                value={editNama}
                                onChange={(e) => setEditNama(e.target.value)}
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Asal Kota
                              </label>
                              <input
                                type="text"
                                value={editAsal}
                                onChange={(e) => setEditAsal(e.target.value)}
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Destinasi
                              </label>
                              <select
                                value={editDestinasi}
                                onChange={(e) => setEditDestinasi(e.target.value)}
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {editDestOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                Rating
                              </label>
                              <div className="flex items-center gap-1 py-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setEditRating(star)}
                                    aria-label={`Ubah menjadi ${star} bintang`}
                                    className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                                  >
                                    <Star
                                      className={`w-5 h-5 ${
                                        star <= editRating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-300 dark:text-slate-600'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Komentar
                            </label>
                            <textarea
                              rows={3}
                              value={editKomentar}
                              onChange={(e) => setEditKomentar(e.target.value)}
                              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(rev.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 text-[#38bdf8]" />
                              <span>Simpan Perubahan</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal Comment Display */
                        <>
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
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                    {rev.nama}
                                  </h4>
                                  {isOwner && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                      Komentar Anda
                                    </span>
                                  )}
                                </div>
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

                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                            {rev.komentar}
                          </p>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span>{rev.tanggal}</span>
                              {rev.editedAt && (
                                <span className="text-[11px] italic text-slate-400 dark:text-slate-500">
                                  (diedit {rev.editedAt})
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
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

                              {isOwner && !isConfirmingDelete && (
                                <>
                                  {onEditReview && (
                                    <button
                                      type="button"
                                      onClick={() => startEditing(rev)}
                                      title="Edit komentar Anda"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 text-[11px] font-semibold transition cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" />
                                      <span>Edit</span>
                                    </button>
                                  )}
                                  {onDeleteReview && (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(rev.id)}
                                      title="Hapus komentar Anda"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/70 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-300 text-[11px] font-semibold transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Hapus</span>
                                    </button>
                                  )}
                                </>
                              )}

                              {isConfirmingDelete && onDeleteReview && (
                                <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl px-2.5 py-1">
                                  <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                                    Hapus?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteReview(rev.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition cursor-pointer"
                                  >
                                    Ya
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
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
