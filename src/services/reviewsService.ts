import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  updateDoc,
} from 'firebase/firestore';
import {
  db,
  firebaseProjectId,
  firestoreDatabaseId,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type { ReviewItem } from '../types';

const REVIEWS_COLLECTION = 'reviews';
const PROOFS_COLLECTION = 'reviewProofs';

// Synchronized with firebase-blueprint.json schema bounds
const LIMITS = {
  namaMax: 80,
  asalMax: 80,
  destinasiMax: 120,
  tanggalMax: 40,
  editedAtMax: 40,
  komentarMin: 5,
  komentarMax: 1000,
  tokenMin: 16,
  tokenMax: 128,
} as const;

export function generateAuthorToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${crypto.randomUUID()}-${crypto.randomUUID().slice(0, 8)}`;
  }
  const arr = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function sanitizeReviewId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  return cleaned || `rev-user-${Date.now()}`;
}

function clampString(value: string, fallback: string, maxLen: number): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

function clampRating(rating: number): number {
  if (!Number.isFinite(rating)) return 5;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export function formatQuotaErrorMessage(rawError: unknown): string {
  const msg = rawError instanceof Error ? rawError.message : String(rawError);
  if (msg.includes('Free daily read units per project') || msg.includes('Quota exceeded')) {
    return `Kuota harian Firestore tercapai dan akan direset besok. Cek info kuota di https://console.firebase.google.com/project/${firebaseProjectId}/firestore/databases/${firestoreDatabaseId}/data?openUpgradeDialog=true`;
  }
  return 'Gagal menyinkronkan komentar. Silakan coba beberapa saat lagi.';
}

export function subscribeToReviews(
  onUpdate: (reviews: ReviewItem[]) => void,
  onError: (friendlyMessage: string) => void
): () => void {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReviewItem[] = snapshot.docs.map((snap) => {
        const data = snap.data() as Record<string, unknown>;
        return {
          id: snap.id,
          nama: typeof data.nama === 'string' ? data.nama : 'Pengunjung',
          asal: typeof data.asal === 'string' ? data.asal : 'Pengunjung',
          destinasi: typeof data.destinasi === 'string' ? data.destinasi : 'Kabupaten Pati',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          tanggal: typeof data.tanggal === 'string' ? data.tanggal : '',
          komentar: typeof data.komentar === 'string' ? data.komentar : '',
          rekomendasi: typeof data.rekomendasi === 'boolean' ? data.rekomendasi : true,
          helpfulCount: typeof data.helpfulCount === 'number' ? data.helpfulCount : 0,
          editedAt: typeof data.editedAt === 'string' ? data.editedAt : undefined,
        };
      });
      onUpdate(items);
    },
    (error) => {
      onError(formatQuotaErrorMessage(error));
      try {
        handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION);
      } catch {
        // Logged via handleFirestoreError; keep UI resilient via onError callback
      }
    }
  );
}

export async function createFirestoreReview(
  review: ReviewItem,
  rawEditToken: string
): Promise<void> {
  const reviewId = sanitizeReviewId(review.id);
  const path = `${REVIEWS_COLLECTION}/${reviewId}`;
  const validToken =
    rawEditToken.length >= LIMITS.tokenMin && rawEditToken.length <= LIMITS.tokenMax
      ? rawEditToken
      : generateAuthorToken();

  const komentar = review.komentar.trim().slice(0, LIMITS.komentarMax);
  if (komentar.length < LIMITS.komentarMin) {
    throw new Error('Komentar minimal 5 karakter.');
  }

  const rating = clampRating(review.rating);
  const editTokenHash = await sha256Hex(validToken);

  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
      nama: clampString(review.nama, 'Pengunjung', LIMITS.namaMax),
      asal: clampString(review.asal, 'Pengunjung', LIMITS.asalMax),
      destinasi: clampString(review.destinasi, 'Kabupaten Pati', LIMITS.destinasiMax),
      rating,
      tanggal: clampString(review.tanggal, 'Hari ini', LIMITS.tanggalMax),
      komentar,
      rekomendasi: rating >= 4,
      helpfulCount: 0,
      editTokenHash,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFirestoreReview(
  reviewId: string,
  updates: {
    nama: string;
    asal: string;
    destinasi: string;
    rating: number;
    komentar: string;
    editedAt: string;
  },
  rawEditToken: string
): Promise<void> {
  const safeId = sanitizeReviewId(reviewId);
  const path = `${REVIEWS_COLLECTION}/${safeId}`;
  const komentar = updates.komentar.trim().slice(0, LIMITS.komentarMax);
  if (komentar.length < LIMITS.komentarMin) {
    throw new Error('Komentar minimal 5 karakter.');
  }

  const rating = clampRating(updates.rating);
  const batch = writeBatch(db);
  batch.set(doc(db, PROOFS_COLLECTION, safeId), {
    token: rawEditToken.slice(0, LIMITS.tokenMax),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, REVIEWS_COLLECTION, safeId), {
    nama: clampString(updates.nama, 'Pengunjung', LIMITS.namaMax),
    asal: clampString(updates.asal, 'Pengunjung', LIMITS.asalMax),
    destinasi: clampString(updates.destinasi, 'Kabupaten Pati', LIMITS.destinasiMax),
    rating,
    komentar,
    rekomendasi: rating >= 4,
    editedAt: clampString(updates.editedAt, 'Diedit', LIMITS.editedAtMax),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreReview(
  reviewId: string,
  rawEditToken: string
): Promise<void> {
  const safeId = sanitizeReviewId(reviewId);
  const path = `${REVIEWS_COLLECTION}/${safeId}`;
  const batch = writeBatch(db);
  batch.set(doc(db, PROOFS_COLLECTION, safeId), {
    token: rawEditToken.slice(0, LIMITS.tokenMax),
    updatedAt: serverTimestamp(),
  });
  batch.delete(doc(db, REVIEWS_COLLECTION, safeId));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function incrementFirestoreReviewHelpful(
  reviewId: string,
  currentHelpfulCount: number
): Promise<void> {
  const safeId = sanitizeReviewId(reviewId);
  const path = `${REVIEWS_COLLECTION}/${safeId}`;

  try {
    await updateDoc(doc(db, REVIEWS_COLLECTION, safeId), {
      helpfulCount: Math.max(0, Math.floor(currentHelpfulCount)) + 1,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
