/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MediaContributionSection } from './components/MediaContributionSection';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { PageSkeleton, MapSkeleton } from './components/LoadingSkeleton';
import { GooglePlaceImage } from './components/GooglePlaceImage';
import type { QuickSearchResult } from './components/QuickSearchBar';

const GalleryModal = lazy(() => import('./components/GalleryModal').then((m) => ({ default: m.GalleryModal })));
const InteractiveMap = lazy(() => import('./components/InteractiveMap').then((m) => ({ default: m.InteractiveMap })));
const WisataView = lazy(() => import('./components/WisataView').then((m) => ({ default: m.WisataView })));
const EkrafView = lazy(() => import('./components/EkrafView').then((m) => ({ default: m.EkrafView })));
const TentangKamiView = lazy(() => import('./components/TentangKamiView').then((m) => ({ default: m.TentangKamiView })));
const KontakView = lazy(() => import('./components/KontakView').then((m) => ({ default: m.KontakView })));

import { MediaItem, ReviewItem, Destination } from './types';
import { INITIAL_MEDIA_ITEMS, INITIAL_REVIEWS } from './data/reviewsAndMedia';
import { DESTINATIONS_DATA } from './data/destinationsData';
import { PACKAGES_DATA } from './data/packagesData';
import { EKRAF_CATEGORIES, EKRAF_PRODUCTS } from './data/ekrafData';
import {
  Compass,
  Layers,
  ShoppingBag,
  Info,
  Phone,
  ArrowRight,
  Calendar,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  Heart,
  Star,
  Clock,
  ShieldCheck,
  Award,
  Send,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export default function App() {
  // Navigation state: 'home' | 'tentang' | 'wisata' | 'ekraf' | 'kontak'
  const [activePage, setActivePage] = useState<string>('home');
  const [wisataTarget, setWisataTarget] = useState<{
    tab?: 'katalog' | 'itinerary';
    category?: string;
    destId?: number | null;
    packageId?: number | null;
    nonce: number;
  }>({ nonce: 0 });
  const [ekrafTarget, setEkrafTarget] = useState<{
    productId?: string | null;
    nonce: number;
  }>({ nonce: 0 });
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);


  // Media gallery items
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('sip_pati_media');
      if (saved) {
        const parsed: MediaItem[] = JSON.parse(saved);
        const seloromoMedia = INITIAL_MEDIA_ITEMS.find((m) => m.id === 'media-1');
        return parsed.map((item) =>
          item.id === 'media-1' && seloromoMedia && item.url.includes('unsplash.com')
            ? { ...item, url: seloromoMedia.url, thumbnailUrl: seloromoMedia.thumbnailUrl }
            : item
        );
      }
      return INITIAL_MEDIA_ITEMS;
    } catch {
      return INITIAL_MEDIA_ITEMS;
    }
  });

  // Lightbox modal item
  const [activeLightboxItem, setActiveLightboxItem] = useState<MediaItem | null>(null);

  const LEGACY_AI_REVIEW_IDS = new Set(['rev-1', 'rev-2', 'rev-3', 'rev-4']);

  // Reviews items (only real user-submitted comments)
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('sip_pati_reviews');
      if (saved) {
        const parsed: ReviewItem[] = JSON.parse(saved);
        return parsed.filter((rev) => !LEGACY_AI_REVIEW_IDS.has(rev.id));
      }
      return INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  useEffect(() => {
    let active = true;
    fetch('/api/reviews')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { reviews?: ReviewItem[] } | null) => {
        if (!active || !payload?.reviews) return;
        setReviewsList((prev) => {
          const map = new Map<string, ReviewItem>();
          payload.reviews!.forEach((r) => map.set(r.id, r));
          prev.forEach((r) => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('sip_pati_reviews', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Add media handler
  const handleAddMedia = (newMedia: MediaItem) => {
    const updated = [newMedia, ...mediaList];
    setMediaList(updated);
    try {
      localStorage.setItem('sip_pati_media', JSON.stringify(updated));
    } catch {}
  };

  // Add review handler
  const handleAddReview = (newReview: ReviewItem) => {
    const updated = [newReview, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem('sip_pati_reviews', JSON.stringify(updated));
    } catch {}
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview),
    }).catch(() => {});
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviewsList.filter((r) => r.id !== id);
    setReviewsList(updated);
    try {
      localStorage.setItem('sip_pati_reviews', JSON.stringify(updated));
    } catch {}
    fetch(`/api/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleHelpfulReview = (id: string) => {
    const updated = reviewsList.map((r) =>
      r.id === id ? { ...r, helpfulCount: (r.helpfulCount ?? 0) + 1 } : r
    );
    setReviewsList(updated);
    try {
      localStorage.setItem('sip_pati_reviews', JSON.stringify(updated));
    } catch {}
    fetch(`/api/reviews/${encodeURIComponent(id)}/helpful`, { method: 'POST' }).catch(() => {});
  };

  const handleNavigate = (page: string) => {
    if (page === 'wisata') {
      setWisataTarget((prev) => ({ nonce: prev.nonce + 1 }));
    } else if (page === 'ekraf') {
      setEkrafTarget((prev) => ({ nonce: prev.nonce + 1 }));
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSearchResult = (result: QuickSearchResult) => {
    if (result.type === 'destination') {
      setWisataTarget((prev) => ({
        tab: 'katalog',
        category: 'all',
        destId: result.id,
        packageId: null,
        nonce: prev.nonce + 1
      }));
      setActivePage('wisata');
    } else if (result.type === 'package') {
      setWisataTarget((prev) => ({
        tab: 'itinerary',
        category: 'all',
        destId: null,
        packageId: result.id,
        nonce: prev.nonce + 1
      }));
      setActivePage('wisata');
    } else {
      setEkrafTarget((prev) => ({
        productId: result.id,
        nonce: prev.nonce + 1
      }));
      setActivePage('ekraf');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickFilter = (filterType: 'alam' | 'kuliner' | 'religi' | 'itinerary' | 'ekraf') => {
    if (filterType === 'ekraf') {
      setEkrafTarget((prev) => ({ productId: null, nonce: prev.nonce + 1 }));
      setActivePage('ekraf');
    } else if (filterType === 'itinerary') {
      setWisataTarget((prev) => ({ tab: 'itinerary', category: 'all', nonce: prev.nonce + 1 }));
      setActivePage('wisata');
    } else {
      setWisataTarget((prev) => ({ tab: 'katalog', category: filterType, nonce: prev.nonce + 1 }));
      setActivePage('wisata');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick light-box trigger from anywhere
  const handleOpenSimpleImage = (imgUrl: string, title: string) => {
    setActiveLightboxItem({
      id: `quick-${Date.now()}`,
      judul: title,
      keterangan: 'Foto dokumentasi autentik Kabupaten Pati.',
      tipe: 'foto',
      url: imgUrl,
      penulis: 'SIP Sedina ing Pati',
      lokasi: 'Kabupaten Pati, Jawa Tengah',
      tanggal: 'Terkini',
      likes: 24
    });
  };

  // Featured destinations for Home preview
  const featuredDestinations = DESTINATIONS_DATA.slice(0, 4);

  // Inisiator photo asset
  const saqibPhoto = '/assets/aistudio/IMG-20261110-WA0031_932b902a.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* ================= PAGE: HOME ================= */}
        {activePage === 'home' && (
          <div>
            {/* 1. Hero Section */}
            <HeroSection
              onExploreWisata={() => handleNavigate('wisata')}
              onExploreEkraf={() => handleNavigate('ekraf')}
              onOpenMap={() => {
                const el = document.getElementById('section-map');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectSearchResult={handleSelectSearchResult}
              onQuickFilter={handleQuickFilter}
            />

            {/* 2. Profil Inisiator & Duta Wisata (Mas Saqib) */}
            <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-linear-to-br from-[#071736] via-[#0c2b64] to-[#164b91] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#2071dc]/30">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Photo Container */}
                    <div className="lg:col-span-4 flex justify-center">
                      <div className="relative group max-w-xs w-full">
                        <div className="absolute -inset-1.5 bg-linear-to-r from-[#38bdf8] via-[#fbbf24] to-[#2071dc] rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
                        <div className="relative rounded-3xl overflow-hidden border-2 border-white/30 bg-[#071736] shadow-2xl">
                          <img
                            src={saqibPhoto}
                            alt="Ahmad Husnus Saqib - Finalis Mas Mbak Jateng 2026 Kab. Pati"
                            className="w-full h-auto object-cover group-hover:scale-102 transition duration-500"
                            fetchPriority="high"
                            decoding="async"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 text-center">
                            <span className="text-[11px] font-bold text-[#fbbf24] tracking-wide uppercase">
                              Finalis Mas Mbak Jateng 2026
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text Statement & Credentials */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-bold tracking-wider uppercase text-[#38bdf8]">
                        <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
                        <span>Inisiator Gerakan Advokasi Pariwisata</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Ahmad Husnus Saqib
                      </h2>
                      <p className="text-sm font-semibold text-[#fbbf24]">
                        Duta Wisata Kabupaten Pati • Pemilihan Mas Mbak Jawa Tengah 2026
                      </p>

                      <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                        "Melalui program <strong>Sedina ing Pati (SIP)</strong>, kami mendedikasikan rute harian terpadu, direktori destinasi wisata, dan katalog sentra ekonomi kreatif untuk membangkitkan kebanggaan warga Pati dan menggerakkan ekonomi masyarakat secara berkelanjutan."
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleNavigate('tentang')}
                          className="px-5 py-2.5 rounded-xl bg-white text-[#0c2b64] font-bold text-xs sm:text-sm hover:bg-blue-50 transition shadow-md inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>Baca Visi & Profil Selengkapnya</span>
                          <ArrowRight className="w-4 h-4 text-[#0c2b64]" />
                        </button>
                        <a
                          href="https://instagram.com/husnussaqibb"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs inline-flex items-center gap-2 border border-white/20 transition"
                        >
                          <span>Instagram @husnussaqibb</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Interactive Photo & Video Addition Section (Cerita & Dokumentasi Sedina ing Pati) */}
            <MediaContributionSection
              mediaList={mediaList}
              onAddMedia={handleAddMedia}
              onOpenLightbox={(item) => setActiveLightboxItem(item)}
            />

            {/* 3. Section Destinasi Wisata Pilihan (Katalog 135 Wisata Preview) */}
            <section className="py-12 md:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0c2b64] dark:text-[#38bdf8] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Direktori Wisata Terpadu
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                      Destinasi Wisata & <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0c2b64] via-[#1a56a4] to-[#2575fc] dark:from-[#38bdf8] dark:to-[#60a5fa]">Kuliner Khas Pati</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-xl font-normal">
                      Dari panorama alam lereng Gunung Muria, gua karst Kendeng, situs bersejarah Kadipaten Pesantenan, hingga kuliner Nasi Gandul otentik.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('wisata')}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition shadow-md border border-[#38bdf8]/30 shrink-0 self-start md:self-auto cursor-pointer"
                  >
                    <span>Lihat Destinasi Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
                  </button>
                </div>

                {/* Grid 4 sample destinations */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => handleNavigate('wisata')}
                      className="group bg-slate-50 dark:bg-slate-800/60 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 hover:border-[#1a56a4] dark:hover:border-[#38bdf8] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <GooglePlaceImage
                          query={`${dest.nama} ${dest.kecamatan} Pati`}
                          alt={dest.nama}
                          fallbackUrl={dest.imageUrl}
                          lat={dest.lat}
                          lng={dest.lng}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#071736]/85 backdrop-blur-md text-white text-[10px] font-bold">
                          {dest.kategori.toUpperCase()}
                        </div>
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          ⭐ {dest.rating}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            <MapPin className="w-3 h-3 text-[#0c2b64] dark:text-[#38bdf8] shrink-0" />
                            <span className="truncate">{dest.lokasi}</span>
                          </div>
                          <h3 className="mt-1 font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0c2b64] dark:group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                            {dest.nama}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 line-clamp-2 font-normal leading-relaxed">
                            {dest.dayaTarik}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#0c2b64] dark:text-[#38bdf8]">
                            {dest.tiket}
                          </span>
                          <div className="flex items-center gap-2">
                            {dest.googleMapsReviewUrl && (
                              <a
                                href={dest.googleMapsReviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-0.5"
                                title="Buka Ulasan di Google Maps"
                              >
                                Ulasan Maps <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              Selengkapnya <ChevronRight className="w-3.5 h-3.5 text-[#1a56a4]" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Featured Itinerary SIP Showcase */}
            <section className="py-12 md:py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0c2b64] dark:text-[#38bdf8] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Rencana Perjalanan 1 Hari Penuh
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                      Sorotan <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0c2b64] via-[#1a56a4] to-[#2575fc] dark:from-[#38bdf8] dark:to-[#60a5fa]">Itinerary SIP</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-normal">
                      Rute searah efisien (08.00 - 17.30 WIB): 3 Destinasi Utama (Alam, Religi/Sejarah, Budaya) + 1 Titik Kuliner Legendaris tanpa macet.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('wisata')}
                    className="px-5 py-2.5 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition shadow-md border border-[#38bdf8]/30 shrink-0 self-start md:self-auto"
                  >
                    <span>Jelajah Itinerary SIP Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
                  </button>
                </div>

                {/* Grid 4 sample packages */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {PACKAGES_DATA.slice(0, 4).map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => handleNavigate('wisata')}
                      className="group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-[#1a56a4] dark:hover:border-[#38bdf8] hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="w-7 h-7 rounded-lg bg-[#0c2b64] text-white text-xs font-black flex items-center justify-center border border-[#38bdf8]/40">
                            #{pkg.nomor}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            08.00 - 17.30 WIB
                          </span>
                        </div>

                        <h3 className="mt-3 font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0c2b64] dark:group-hover:text-[#38bdf8] transition-colors line-clamp-2">
                          {pkg.judul}
                        </h3>

                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-normal">
                          {pkg.deskripsi}
                        </p>

                        <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          {pkg.stops.map((stop, i) => (
                            <div key={i} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1a56a4] shrink-0" />
                              <span className="truncate">{stop.namaDestinasi}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0c2b64] dark:text-[#38bdf8]">
                          {pkg.estimasiBiaya.split('/')[0]}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Lihat Rute <ArrowRight className="w-3 h-3 text-[#1a56a4]" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Interactive Map Section */}
            <div id="section-map">
              <Suspense fallback={<MapSkeleton />}>
                <InteractiveMap
                  onSelectDestination={(dest) => {
                    setWisataTarget((prev) => ({
                      tab: 'katalog',
                      category: 'all',
                      destId: dest.id,
                      packageId: null,
                      nonce: prev.nonce + 1
                    }));
                    setActivePage('wisata');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </Suspense>
            </div>

            {/* 6. Section Ekonomi Kreatif (Ekraf) & UMKM */}
            <section className="py-12 md:py-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0c2b64] dark:text-[#38bdf8] flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Pemberdayaan UMKM & Kerajinan
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                      Ekonomi Kreatif <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0c2b64] via-[#1a56a4] to-[#2575fc] dark:from-[#38bdf8] dark:to-[#60a5fa]">(Ekraf) Pati</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-xl font-normal">
                      Dukung perajin lokal dari sentra Batik Tulis Bakaran Juwana, kerajinan kuningan, olahan bandeng duri lunak, hingga kopi robusta Muria.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('ekraf')}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition shadow-md border border-[#38bdf8]/30 shrink-0 self-start md:self-auto cursor-pointer"
                  >
                    <span>Lihat Katalog Ekraf Selengkapnya</span>
                    <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
                  </button>
                </div>

                {/* Grid 4 sample Ekraf categories & top products */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {EKRAF_PRODUCTS.slice(0, 4).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleNavigate('ekraf')}
                      className="group bg-slate-50 dark:bg-slate-800/60 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 hover:border-[#1a56a4] dark:hover:border-[#38bdf8] hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <GooglePlaceImage
                          query={`${prod.nama} ${prod.lokasiSentra} Pati`}
                          alt={prod.nama}
                          fallbackUrl={prod.imageUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#071736]/80 backdrop-blur-md text-white text-[10px] font-bold">
                          {prod.kategori}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-[#0c2b64] dark:text-[#38bdf8] block truncate">
                            {prod.pengrajin} • {prod.lokasiSentra}
                          </span>
                          <h3 className="mt-1 font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0c2b64] dark:group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                            {prod.nama}
                          </h3>
                          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-normal leading-relaxed">
                            {prod.deskripsi}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0c2b64] dark:text-[#38bdf8]">
                            {prod.harga}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Hubungi Pengrajin <ChevronRight className="w-3.5 h-3.5 text-[#1a56a4]" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>



            {/* 8. User Reviews & Comments Section */}
            <ReviewsSection
              reviews={reviewsList}
              onAddReview={handleAddReview}
              onDeleteReview={handleDeleteReview}
              onHelpfulReview={handleHelpfulReview}
            />

            {/* 9. Kontak & Layanan Cepat (Call to Action) */}
            <section className="py-12 md:py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-8 md:p-12 text-center space-y-4">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0c2b64]/10 dark:bg-[#1a56a4]/30 text-[#0c2b64] dark:text-[#38bdf8] inline-flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Sekretariat Resmi & Kolaborasi
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Punya Pertanyaan atau Ingin Konsultasi Rute Wisata?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
                    Formulir kontak terintegrasi langsung dengan email resmi pengelola (<strong>sipsaqib1@gmail.com</strong>) untuk konsultasi itinerary rombongan, pemandu lokal, dan kemitraan UMKM ekraf.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleNavigate('kontak')}
                      className="px-6 py-2.5 rounded-xl bg-[#0c2b64] hover:bg-[#164b91] text-white font-bold text-xs sm:text-sm transition shadow-md border border-[#38bdf8]/30 inline-flex items-center gap-2"
                    >
                      <span>Buka Halaman Kontak Lengkap</span>
                      <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
                    </button>
                    <a
                      href="mailto:sipsaqib1@gmail.com"
                      className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition inline-flex items-center gap-2"
                    >
                      <span>Kirim Email Langsung</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= PAGE: TENTANG KAMI ================= */}
        {activePage === 'tentang' && (
          <Suspense fallback={<PageSkeleton />}>
            <TentangKamiView />
          </Suspense>
        )}

        {/* ================= PAGE: WISATA ================= */}
        {activePage === 'wisata' && (
          <Suspense fallback={<PageSkeleton />}>
            <WisataView
              key={wisataTarget.nonce}
              initialTab={wisataTarget.tab}
              initialCategory={wisataTarget.category}
              initialDestId={wisataTarget.destId}
              initialPackageId={wisataTarget.packageId}
            />
          </Suspense>
        )}

        {/* ================= PAGE: EKRAF ================= */}
        {activePage === 'ekraf' && (
          <Suspense fallback={<PageSkeleton />}>
            <EkrafView
              key={ekrafTarget.nonce}
              initialProductId={ekrafTarget.productId}
              onOpenLightbox={handleOpenSimpleImage}
            />
          </Suspense>
        )}

        {/* ================= PAGE: KONTAK ================= */}
        {activePage === 'kontak' && (
          <Suspense fallback={<PageSkeleton />}>
            <KontakView />
          </Suspense>
        )}
      </main>

      {/* Global Lightbox / Zoom Modal */}
      {activeLightboxItem && (
        <Suspense fallback={null}>
          <GalleryModal
            item={activeLightboxItem}
            items={mediaList}
            onClose={() => setActiveLightboxItem(null)}
            onSelect={(item) => setActiveLightboxItem(item)}
          />
        </Suspense>
      )}

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
      />

      {/* Mobile Bottom Navigation Bar for Responsive Convenience */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Compass },
          { id: 'wisata', label: 'Wisata', icon: Layers },
          { id: 'ekraf', label: 'Ekraf', icon: ShoppingBag },
          { id: 'tentang', label: 'Tentang', icon: Info },
          { id: 'kontak', label: 'Kontak', icon: Phone }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`min-h-[46px] min-w-[56px] flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-xl transition ${
                isActive
                  ? 'text-[#0c2b64] dark:text-[#38bdf8] font-bold bg-[#0c2b64]/5 dark:bg-[#1a56a4]/20'
                  : 'text-slate-700 dark:text-slate-300 font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
