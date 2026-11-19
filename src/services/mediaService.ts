import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  db,
  firebaseProjectId,
  firestoreDatabaseId,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { generateAuthorToken } from './reviewsService';
import type { MediaItem } from '../types';

const MEDIA_COLLECTION = 'media';
const MEDIA_PROOFS_COLLECTION = 'mediaProofs';

// Synchronized with firebase-blueprint.json Media bounds
export const MEDIA_LIMITS = {
  judulMax: 120,
  keteranganMax: 1000,
  urlMin: 5,
  urlMax: 450000,
  thumbnailMax: 250000,
  penulisMax: 80,
  lokasiMax: 120,
  tanggalMax: 40,
  tagsMaxCount: 10,
  tagMaxLen: 40,
  tokenMin: 16,
  tokenMax: 128,
} as const;

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function sanitizeMediaId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  return cleaned || `media-user-${Date.now()}`;
}

function clampString(value: string, fallback: string, maxLen: number): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

export function isValidMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length < MEDIA_LIMITS.urlMin || trimmed.length > MEDIA_LIMITS.urlMax) {
    return false;
  }
  return (
    /^https?:\/\/.+/i.test(trimmed) ||
    trimmed.startsWith('/assets/') ||
    /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)
  );
}

function sanitizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => String(t).trim().replace(/^#/, '').slice(0, MEDIA_LIMITS.tagMaxLen))
    .filter(Boolean)
    .slice(0, MEDIA_LIMITS.tagsMaxCount);
}

export function formatMediaQuotaErrorMessage(rawError: unknown): string {
  const msg = rawError instanceof Error ? rawError.message : String(rawError);
  if (msg.includes('Free daily read units per project') || msg.includes('Quota exceeded')) {
    return `Kuota harian Firestore tercapai dan akan direset besok. Cek info kuota di https://console.firebase.google.com/project/${firebaseProjectId}/firestore/databases/${firestoreDatabaseId}/data?openUpgradeDialog=true`;
  }
  if (msg.includes('ukuran') || msg.includes('terlalu besar') || msg.includes('exceeds the maximum allowed size')) {
    return 'Ukuran foto terlalu besar untuk disimpan. Silakan pilih foto beresolusi lebih kecil atau gunakan tautan gambar.';
  }
  return 'Gagal menyinkronkan galeri foto & video. Silakan coba beberapa saat lagi.';
}

export function subscribeToMedia(
  onUpdate: (items: MediaItem[]) => void,
  onError: (friendlyMessage: string) => void
): () => void {
  const q = query(
    collection(db, MEDIA_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MediaItem[] = snapshot.docs.map((snap) => {
        const data = snap.data() as Record<string, unknown>;
        const tipe = data.tipe === 'video' ? 'video' : 'foto';
        const url = typeof data.url === 'string' ? data.url : '';
        return {
          id: snap.id,
          judul: typeof data.judul === 'string' ? data.judul : 'Dokumentasi Wisata Pati',
          keterangan:
            typeof data.keterangan === 'string'
              ? data.keterangan
              : 'Dokumentasi perjalanan wisata di Kabupaten Pati.',
          tipe,
          url,
          thumbnailUrl: typeof data.thumbnailUrl === 'string' ? data.thumbnailUrl : undefined,
          penulis: typeof data.penulis === 'string' ? data.penulis : 'Wisatawan Pati',
          lokasi: typeof data.lokasi === 'string' ? data.lokasi : 'Kabupaten Pati',
          tanggal: typeof data.tanggal === 'string' ? data.tanggal : 'Baru saja',
          likes: typeof data.likes === 'number' ? data.likes : 1,
          tags: Array.isArray(data.tags)
            ? data.tags.filter((t): t is string => typeof t === 'string')
            : undefined,
        };
      });
      onUpdate(items);
    },
    (error) => {
      onError(formatMediaQuotaErrorMessage(error));
      try {
        handleFirestoreError(error, OperationType.LIST, MEDIA_COLLECTION);
      } catch {
        // Logged via handleFirestoreError; UI informed via onError callback
      }
    }
  );
}

export async function createFirestoreMedia(
  media: MediaItem,
  rawEditToken: string
): Promise<void> {
  const mediaId = sanitizeMediaId(media.id);
  const path = `${MEDIA_COLLECTION}/${mediaId}`;
  const validToken =
    rawEditToken.length >= MEDIA_LIMITS.tokenMin && rawEditToken.length <= MEDIA_LIMITS.tokenMax
      ? rawEditToken
      : generateAuthorToken();

  const url = media.url.trim();
  if (!isValidMediaUrl(url)) {
    throw new Error(
      'Tautan foto/video tidak valid atau ukuran file melebihi batas penyimpanan (maks ~450 KB setelah kompresi).'
    );
  }

  const editTokenHash = await sha256Hex(validToken);
  const tags = sanitizeTags(media.tags);

  const payload: Record<string, unknown> = {
    judul: clampString(media.judul, 'Dokumentasi Wisata Pati', MEDIA_LIMITS.judulMax),
    keterangan: clampString(
      media.keterangan,
      'Dokumentasi perjalanan wisata di Kabupaten Pati.',
      MEDIA_LIMITS.keteranganMax
    ),
    tipe: media.tipe === 'video' ? 'video' : 'foto',
    url,
    penulis: clampString(media.penulis, 'Wisatawan Pati', MEDIA_LIMITS.penulisMax),
    lokasi: clampString(media.lokasi, 'Kabupaten Pati', MEDIA_LIMITS.lokasiMax),
    tanggal: clampString(media.tanggal, 'Baru saja', MEDIA_LIMITS.tanggalMax),
    likes: 1,
    editTokenHash,
    createdAt: serverTimestamp(),
  };

  if (
    media.thumbnailUrl &&
    media.thumbnailUrl.trim().length >= MEDIA_LIMITS.urlMin &&
    media.thumbnailUrl.trim().length <= MEDIA_LIMITS.thumbnailMax &&
    isValidMediaUrl(media.thumbnailUrl)
  ) {
    payload.thumbnailUrl = media.thumbnailUrl.trim();
  }

  if (tags.length > 0) {
    payload.tags = tags;
  }

  try {
    await setDoc(doc(db, MEDIA_COLLECTION, mediaId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteFirestoreMedia(
  mediaId: string,
  rawEditToken: string
): Promise<void> {
  const safeId = sanitizeMediaId(mediaId);
  const path = `${MEDIA_COLLECTION}/${safeId}`;
  const batch = writeBatch(db);
  batch.set(doc(db, MEDIA_PROOFS_COLLECTION, safeId), {
    token: rawEditToken.slice(0, MEDIA_LIMITS.tokenMax),
    updatedAt: serverTimestamp(),
  });
  batch.delete(doc(db, MEDIA_COLLECTION, safeId));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function incrementFirestoreMediaLikes(
  mediaId: string,
  currentLikes: number
): Promise<void> {
  const safeId = sanitizeMediaId(mediaId);
  const path = `${MEDIA_COLLECTION}/${safeId}`;

  try {
    await updateDoc(doc(db, MEDIA_COLLECTION, safeId), {
      likes: Math.max(0, Math.floor(currentLikes)) + 1,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
