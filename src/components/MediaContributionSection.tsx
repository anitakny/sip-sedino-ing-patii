import React, { useMemo, useState } from 'react';
import {
  Camera,
  Video,
  PlusCircle,
  Heart,
  Maximize2,
  Play,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Upload,
  Trash2,
  Loader2,
  Images,
  ArrowRight,
  Compass,
  Calendar,
} from 'lucide-react';
import { MediaItem } from '../types';
import { DESTINATIONS_DATA } from '../data/destinationsData';
import { isValidMediaUrl, MEDIA_LIMITS } from '../services/mediaService';
import { groupMediaByDestination } from '../utils/destinationMediaMatcher';
import confetti from 'canvas-confetti';

interface MediaContributionSectionProps {
  mediaList: MediaItem[];
  ownedMediaIds?: string[];
  isLoading?: boolean;
  syncError?: string | null;
  onAddMedia: (newMedia: MediaItem) => Promise<void> | void;
  onLikeMedia?: (id: string) => void;
  onDeleteMedia?: (id: string) => void;
  onOpenLightbox: (item: MediaItem, contextItems?: MediaItem[]) => void;
  onOpenDestination?: (destId: number) => void;
  onExploreWisata?: () => void;
  onExploreItinerary?: () => void;
}

const CUSTOM_LOCATION_VALUE = '__custom__';

const DEFAULT_VIDEO_THUMBNAIL =
  'https://lh3.googleusercontent.com/grass-cs/AABkmLd4oP3kX9UW5WMLphoqM2Q4HkWtWDAG-Zxb2-1fEvSSfAEBJjIjJBBJ5yuRNe9aqKKC4-62I8WowtEDtfpaeG8jUcqKSnHJ0HTLMVElzZAvJnM4PgJlHMSU5mO0gskVtNtg0kWpBFFIpPzR=w600-h400-k-no';

async function compressImageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Berkas harus berupa gambar (JPG, PNG, WEBP).');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca berkas gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Format gambar tidak dapat diproses oleh browser.'));
    image.src = rawDataUrl;
  });

  const maxTargetChars = 380000;
  const maxDimensions = [1080, 840, 640];
  const qualities = [0.76, 0.6, 0.45];

  for (const maxDim of maxDimensions) {
    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Browser tidak mendukung pemrosesan kanvas gambar.');
    }
    ctx.drawImage(img, 0, 0, width, height);

    for (const q of qualities) {
      const compressed = canvas.toDataURL('image/jpeg', q);
      if (compressed.length <= maxTargetChars) {
        return compressed;
      }
    }
  }

  throw new Error(
    'Ukuran gambar masih terlalu besar setelah kompresi. Silakan pilih foto lain atau gunakan tautan gambar.'
  );
}

export const MediaContributionSection: React.FC<MediaContributionSectionProps> = ({
  mediaList,
  ownedMediaIds = [],
  isLoading = false,
  syncError = null,
  onAddMedia,
  onLikeMedia,
  onDeleteMedia,
  onOpenLightbox,
  onOpenDestination,
  onExploreWisata,
  onExploreItinerary,
}) => {
  const ownedSet = new Set(ownedMediaIds);
  const [filterType, setFilterType] = useState<'all' | 'foto' | 'video'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [localLikesDelta, setLocalLikesDelta] = useState<Record<string, number>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [formJudul, setFormJudul] = useState('');
  const [formTipe, setFormTipe] = useState<'foto' | 'video'>('foto');
  const [formUrl, setFormUrl] = useState('');
  const [formPenulis, setFormPenulis] = useState('');
  const [formLokasiOption, setFormLokasiOption] = useState<string>(DESTINATIONS_DATA[0].nama);
  const [formLokasiCustom, setFormLokasiCustom] = useState<string>('');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formTags, setFormTags] = useState('PatiWisata, SedinaIngPati');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset sample pictures matching dropdown options
  const samplePictures = [
    {
      label: 'Waduk Seloromo',
      lokasi: 'Waduk Seloromo',
      url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLd4oP3kX9UW5WMLphoqM2Q4HkWtWDAG-Zxb2-1fEvSSfAEBJjIjJBBJ5yuRNe9aqKKC4-62I8WowtEDtfpaeG8jUcqKSnHJ0HTLMVElzZAvJnM4PgJlHMSU5mO0gskVtNtg0kWpBFFIpPzR=w1200-h800-k-no',
    },
    {
      label: 'Gua Pancur',
      lokasi: 'Gua Pancur',
      url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeo-Tfsy8Vucp5jcD1rR-KfUOnY0R4xnhi8f-U4YiCsvjflIyq2QIloQ7TQiZpSopAxi-grzwkUmzu3cOvYE4ZsYB7JamfvuXEIURAwy7m34dQ5iXOEoXkSdwn-Zxxw0MpF3c-R=w1200-h800-k-no',
    },
    {
      label: 'Batik Bakaran',
      lokasi: 'Sentra Batik Bakaran Juwana',
      url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfXLBi5HhkmC5tvK2auHw8ClhcLmyvKym3y9zZQBe4J8d3PsCK5u4HWB4mD-4_NEm9ZkqR1KQOKucfdRXTarNbvMhAu7Qt_dJDp-DyNEfsKI6dl3g72zPsVGgCpwKXIE53te8Q3hZn1qOND=w1200-h800-k-no',
    },
    {
      label: 'Alun-Alun Pati',
      lokasi: 'Alun-Alun Simpang Lima Pati',
      url: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TXnvdRueroZ3w_PCAH_UvfqHzOvRFQVK2q6_DW-jNvi9XXbVumHWVDTvfc2OFz0q0NHOOYk7rsz-mjnanrrAzUNbDTap3kN0AFyNC5eb656ps_jKOTvjf8n8BGEB_-QzoUeZz0IQ=w1200-h800-k-no',
    },
  ];

  // Grouped counts for tabs (so same wisata isn't counted/displayed double-double)
  const allGroups = useMemo(() => groupMediaByDestination(mediaList), [mediaList]);
  const fotoGroups = useMemo(
    () => groupMediaByDestination(mediaList.filter((m) => m.tipe === 'foto')),
    [mediaList]
  );
  const videoGroups = useMemo(
    () => groupMediaByDestination(mediaList.filter((m) => m.tipe === 'video')),
    [mediaList]
  );

  const displayedGroups = useMemo(() => {
    if (filterType === 'foto') return fotoGroups;
    if (filterType === 'video') return videoGroups;
    return allGroups;
  }, [filterType, allGroups, fotoGroups, videoGroups]);

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (likedMap[id]) return;
    setLikedMap((prev) => ({
      ...prev,
      [id]: true,
    }));
    if (onLikeMedia) {
      onLikeMedia(id);
    } else {
      setLocalLikesDelta((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);
    setIsCompressingImage(true);
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file);
      setFormUrl(compressedDataUrl);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Gagal memproses berkas gambar. Silakan coba foto lain.'
      );
    } finally {
      setIsCompressingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isCompressingImage) return;
    setFormError(null);

    const resolvedLokasi =
      formLokasiOption === CUSTOM_LOCATION_VALUE
        ? formLokasiCustom.trim()
        : formLokasiOption.trim();

    if (!formJudul.trim()) {
      setFormError('Mohon isi judul dokumentasi terlebih dahulu.');
      return;
    }
    if (!formUrl.trim()) {
      setFormError('Mohon masukkan tautan foto/video atau unggah berkas gambar.');
      return;
    }
    if (!isValidMediaUrl(formUrl)) {
      setFormError(
        'Tautan harus diawali https:// atau berupa foto yang diunggah (maks ~450 KB setelah kompresi).'
      );
      return;
    }
    if (!resolvedLokasi) {
      setFormError('Mohon pilih atau isi lokasi wisata di Kabupaten Pati.');
      return;
    }
    if (!formPenulis.trim()) {
      setFormError('Mohon isi nama kontributor Anda.');
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    const uniqueSuffix =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);

    const trimmedUrl = formUrl.trim();
    const newMedia: MediaItem = {
      id: `media-user-${Date.now()}-${uniqueSuffix}`,
      judul: formJudul.trim().slice(0, MEDIA_LIMITS.judulMax),
      keterangan: (
        formKeterangan.trim() || 'Dokumentasi perjalanan wisata di Kabupaten Pati.'
      ).slice(0, MEDIA_LIMITS.keteranganMax),
      tipe: formTipe,
      url: trimmedUrl,
      thumbnailUrl:
        formTipe === 'video'
          ? DEFAULT_VIDEO_THUMBNAIL
          : trimmedUrl.startsWith('data:')
            ? undefined
            : trimmedUrl.slice(0, MEDIA_LIMITS.thumbnailMax),
      penulis: formPenulis.trim().slice(0, MEDIA_LIMITS.penulisMax),
      lokasi: resolvedLokasi.slice(0, MEDIA_LIMITS.lokasiMax),
      tanggal: formattedDate,
      likes: 1,
      tags: formTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, '').slice(0, MEDIA_LIMITS.tagMaxLen))
        .filter(Boolean)
        .slice(0, MEDIA_LIMITS.tagsMaxCount),
    };

    setIsSubmitting(true);
    try {
      await onAddMedia(newMedia);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setIsModalOpen(false);
        setFormJudul('');
        setFormUrl('');
        setFormPenulis('');
        setFormKeterangan('');
        setFormLokasiCustom('');
      }, 1200);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan dokumentasi ke database. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-12 md:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c2b64]/10 dark:bg-[#1a56a4]/30 border border-[#1a56a4]/30 text-[#0c2b64] dark:text-[#38bdf8] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Galeri Wisatawan &amp; Ruang Interaktif
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Cerita &amp; Dokumentasi{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0c2b64] via-[#1a56a4] to-[#2575fc] dark:from-[#38bdf8] dark:to-[#60a5fa]">
                Sedina ing Pati
              </span>
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl font-normal">
              Pilih destinasi Pati dan bagikan foto atau video perjalanan Anda. Kontribusi terbaru untuk wisata terkait otomatis tampil paling atas tanpa menggandakan kartu, dan klik galeri untuk melihat seluruh dokumentasi sebelumnya.
            </p>
          </div>

          {/* Action Buttons & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#0c2b64] text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua ({allGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('foto')}
                className={`min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === 'foto'
                    ? 'bg-[#0c2b64] text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Foto ({fotoGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('video')}
                className={`min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filterType === 'video'
                    ? 'bg-[#0c2b64] text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Video ({videoGroups.length})
              </button>
            </div>

            {/* Add Media Button */}
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setFormSuccess(false);
                setIsModalOpen(true);
              }}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0c2b64]/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-[#38bdf8]/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#38bdf8]" />
              <span>Tambah Foto / Video</span>
            </button>
          </div>
        </div>

        {/* Direct Navigation Shortcuts to Wisata & Rute SIP */}
        {(onExploreWisata || onExploreItinerary) && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ingin melihat informasi lengkap, tiket masuk, atau rute searah destinasi di atas?
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {onExploreWisata && (
                <button
                  type="button"
                  onClick={onExploreWisata}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Jelajahi Destinasi Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
                </button>
              )}
              {onExploreItinerary && (
                <button
                  type="button"
                  onClick={onExploreItinerary}
                  className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-[#0c2b64] dark:text-[#38bdf8] hover:border-[#1a56a4] text-xs font-bold transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lihat Rute Itinerary SIP</span>
                </button>
              )}
            </div>
          </div>
        )}

        {syncError && (
          <div
            role="alert"
            className="mt-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-medium"
          >
            {syncError}
          </div>
        )}

        {/* Gallery Grid (Grouped by Wisata, Newest Updated First) */}
        {isLoading && displayedGroups.length === 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-hidden animate-pulse"
              >
                <div className="aspect-4/3 bg-slate-200 dark:bg-slate-700" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGroups.map((group) => {
              const item = group.primary;
              const isLiked = likedMap[item.id];
              const isOwner = ownedSet.has(item.id);
              const isConfirmingDelete = isOwner && confirmDeleteId === item.id;
              const currentLikes = item.likes + (localLikesDelta[item.id] || 0);
              const extraCount = group.items.length - 1;
              const matchedDest = group.destination;

              return (
                <div
                  key={group.key}
                  onClick={() => onOpenLightbox(item, group.items)}
                  className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Media Image / Video Preview */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.judul}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Media Type Badge & Owner Badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white backdrop-blur shadow-xs flex items-center gap-1.5">
                        {item.tipe === 'video' ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Foto</span>
                          </>
                        )}
                      </div>
                      {isOwner && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#0c2b64]/90 text-[#38bdf8] backdrop-blur border border-[#38bdf8]/40 shadow-xs">
                          Kontribusi Anda
                        </span>
                      )}
                    </div>

                    {/* Multi-photo collection badge + Zoom indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {extraCount > 0 && (
                        <span
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-black/70 text-white backdrop-blur border border-white/20 flex items-center gap-1 shadow-xs"
                          title={`Tersedia ${group.items.length} foto/video untuk lokasi ini`}
                        >
                          <Images className="w-3 h-3 text-[#38bdf8]" />
                          <span>{group.items.length} Dokumentasi</span>
                        </span>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-lg backdrop-blur">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Play icon overlay for videos */}
                    {item.tipe === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 ml-1 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Location badge on bottom of thumbnail */}
                    <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-100 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                        <span className="truncate">
                          {matchedDest ? matchedDest.nama : item.lokasi}
                        </span>
                      </div>
                      {extraCount > 0 && (
                        <span className="text-[10px] font-semibold text-[#38bdf8] shrink-0">
                          +{extraCount} foto lama
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {item.judul}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.keterangan}
                      </p>
                    </div>

                    {/* Direct link to Destination Detail when matched */}
                    {matchedDest && onOpenDestination && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDestination(matchedDest.id);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0c2b64] dark:text-[#38bdf8] hover:underline cursor-pointer"
                        >
                          <span>Lihat Info &amp; Rute {matchedDest.nama}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Footer: User, Delete (if owner) & Likes */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                          {item.penulis}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {item.tanggal}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOwner && onDeleteMedia && (
                          isConfirmingDelete ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-full px-2 py-0.5"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteMedia(item.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] font-bold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
                              >
                                Hapus
                              </button>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(item.id);
                              }}
                              className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Hapus kontribusi terbaru Anda"
                              aria-label="Hapus kontribusi terbaru Anda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleLike(e, item.id)}
                          disabled={Boolean(isLiked)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                            isLiked
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title="Sukai foto/video ini"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                            }`}
                          />
                          <span className="font-semibold text-[11px]">{currentLikes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add Photo / Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Tambah Foto atau Video Wisata
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pilih destinasi Pati dan bagikan momen terbaru Anda ke galeri bersama
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} noValidate className="p-5 overflow-y-auto space-y-4">
              {formSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    Berhasil Ditambahkan!
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xs mx-auto">
                    Dokumentasi Anda kini tampil paling atas di galeri utama Sedina ing Pati dan melengkapi koleksi foto destinasi terkait.
                  </p>
                </div>
              ) : (
                <>
                  {formError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold"
                    >
                      {formError}
                    </div>
                  )}
                  {/* Media Type Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tipe Konten
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormTipe('foto')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          formTipe === 'foto'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        Foto Dokumentasi
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormTipe('video')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          formTipe === 'video'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        Video Wisata (MP4 / Reel)
                      </button>
                    </div>
                  </div>

                  {/* Judul */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Dokumentasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={MEDIA_LIMITS.judulMax}
                      placeholder="Contoh: Sunset Indah di Waduk Seloromo"
                      value={formJudul}
                      onChange={(e) => setFormJudul(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* URL / File Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formTipe === 'foto'
                          ? 'Tautan Gambar (URL) atau Unggah Foto'
                          : 'Tautan Video (MP4 / Web Video)'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder={
                          formTipe === 'foto'
                            ? 'https://... atau klik Pilih Foto'
                            : 'https://assets.mixkit.co/.../video.mp4'
                        }
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        className="flex-1 min-w-0 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formTipe === 'foto' && (
                        <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition shrink-0">
                          {isCompressingImage ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-1.5" />
                          )}
                          <span>{isCompressingImage ? 'Memproses...' : 'Pilih Foto'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isCompressingImage}
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Preview for uploaded or URL image */}
                    {formTipe === 'foto' && formUrl && isValidMediaUrl(formUrl) && (
                      <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <img
                          src={formUrl}
                          alt="Pratinjau"
                          referrerPolicy="no-referrer"
                          className="w-16 h-12 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Pratinjau Foto Siap Diunggah
                          </p>
                          <p className="truncate text-slate-500 dark:text-slate-400">
                            {formUrl.startsWith('data:')
                              ? `Foto terkompresi (${Math.round(formUrl.length / 1024)} KB)`
                              : formUrl}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Preset Samples */}
                    {formTipe === 'foto' && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <span>Pilihan Cepat:</span>
                        {samplePictures.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormUrl(sample.url);
                              setFormLokasiOption(sample.lokasi);
                              if (!formJudul) setFormJudul(sample.label);
                            }}
                            className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:underline cursor-pointer"
                          >
                            {sample.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lokasi (Pilihan Destinasi Wisata) & Nama Pengirim */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pilih Lokasi Wisata Pati <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formLokasiOption}
                        onChange={(e) => setFormLokasiOption(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DESTINATIONS_DATA.map((dest) => (
                          <option key={dest.id} value={dest.nama}>
                            {dest.nama} ({dest.kecamatan})
                          </option>
                        ))}
                        <option value={CUSTOM_LOCATION_VALUE}>
                          Lokasi Lainnya di Kabupaten Pati...
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Wisatawan / Kontributor <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={MEDIA_LIMITS.penulisMax}
                        placeholder="Nama Anda"
                        value={formPenulis}
                        onChange={(e) => setFormPenulis(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {formLokasiOption === CUSTOM_LOCATION_VALUE && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Lokasi Khusus di Pati <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={MEDIA_LIMITS.lokasiMax}
                        placeholder="Contoh: Desa Wisata Lahar, Tlogowungu"
                        value={formLokasiCustom}
                        onChange={(e) => setFormLokasiCustom(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Cerita Singkat / Keterangan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Deskripsi &amp; Pengalaman Singkat
                    </label>
                    <textarea
                      rows={2}
                      maxLength={MEDIA_LIMITS.keteranganMax}
                      placeholder="Ceritakan serunya pengalaman Anda di tempat ini..."
                      value={formKeterangan}
                      onChange={(e) => setFormKeterangan(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tagar (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      placeholder="PatiWisata, SedinaIngPati, KulinerNusantara"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isCompressingImage}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{isSubmitting ? 'Menyimpan...' : 'Tayangkan di Galeri'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
