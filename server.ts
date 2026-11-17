import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLACES_API_BASE = 'https://places.googleapis.com/v1';
const SOLUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';
const PORT = 3000;
const REVIEWS_FILE = path.resolve(__dirname, 'data', 'reviews.json');

interface StoredReview {
  id: string;
  nama: string;
  asal: string;
  destinasi: string;
  rating: number;
  tanggal: string;
  komentar: string;
  rekomendasi: boolean;
  helpfulCount: number;
}

async function readStoredReviews(): Promise<StoredReview[]> {
  try {
    const raw = await fs.readFile(REVIEWS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStoredReviews(reviews: StoredReview[]): Promise<void> {
  await fs.mkdir(path.dirname(REVIEWS_FILE), { recursive: true });
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
}

interface PhotoAttribution {
  displayName: string;
  uri: string;
}

interface PlacePhotoPayload {
  photoUrl: string | null;
  photoAttribution: PhotoAttribution | null;
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  placeName: string | null;
}

interface CacheEntry {
  data: PlacePhotoPayload;
  expiresAt: number;
}

// Short-lived in-memory session deduplication cache (5 minutes) — never persisted to disk/DB
const SESSION_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 200;
const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<PlacePhotoPayload | null>>();

function getGoogleMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
}

function normalizeGoogleUri(uri?: string): string | undefined {
  if (!uri) return undefined;
  return uri.startsWith('//') ? `https:${uri}` : uri;
}

function setSessionCache(key: string, data: PlacePhotoPayload) {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { data, expiresAt: Date.now() + SESSION_TTL_MS });
}

class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

async function fetchPlacePhotoFromGoogle(
  query: string,
  lat?: number,
  lng?: number
): Promise<PlacePhotoPayload | null> {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return null;
  }

  const center =
    typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? { latitude: lat, longitude: lng }
      : { latitude: -6.7559, longitude: 111.038 };

  const radius =
    typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? 15000.0
      : 35000.0;

  const searchRes = await fetch(`${PLACES_API_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.photos.name,places.photos.authorAttributions,places.rating,places.userRatingCount,places.googleMapsLinks.placeUri',
      'X-Goog-Maps-Solution-ID': SOLUTION_ID,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'id',
      regionCode: 'ID',
      pageSize: 1,
      locationBias: {
        circle: {
          center,
          radius,
        },
      },
    }),
  });

  if (searchRes.status === 429) {
    throw new QuotaExceededError('Google Maps Places API quota exceeded (429).');
  }

  if (!searchRes.ok) {
    const bodyText = await searchRes.text();
    if (bodyText.includes('RESOURCE_EXHAUSTED')) {
      throw new QuotaExceededError('Google Maps Places API RESOURCE_EXHAUSTED.');
    }
    throw new Error(`Places Text Search failed (${searchRes.status}): ${bodyText}`);
  }

  const searchJson = (await searchRes.json()) as {
    error?: { status?: string };
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      rating?: number;
      userRatingCount?: number;
      googleMapsLinks?: { placeUri?: string };
      photos?: Array<{
        name?: string;
        authorAttributions?: Array<{ displayName?: string; uri?: string }>;
      }>;
    }>;
  };

  if (searchJson.error?.status === 'RESOURCE_EXHAUSTED') {
    throw new QuotaExceededError('Google Maps Places API RESOURCE_EXHAUSTED.');
  }

  const place = searchJson.places?.[0];
  if (!place) {
    return null;
  }

  const firstPhoto = place.photos?.[0];
  let photoUrl: string | null = null;

  if (firstPhoto?.name) {
    const mediaRes = await fetch(
      `${PLACES_API_BASE}/${firstPhoto.name}/media?maxWidthPx=900&skipHttpRedirect=true`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-Maps-Solution-ID': SOLUTION_ID,
        },
      }
    );

    if (mediaRes.status === 429) {
      throw new QuotaExceededError('Google Maps Place Photos quota exceeded (429).');
    }

    if (mediaRes.ok) {
      const mediaJson = (await mediaRes.json()) as { photoUri?: string };
      photoUrl = mediaJson.photoUri ?? null;
    }
  }

  const rawAuthor = firstPhoto?.authorAttributions?.[0];
  const photoAttribution: PhotoAttribution | null =
    rawAuthor?.displayName && rawAuthor?.uri
      ? {
          displayName: rawAuthor.displayName,
          uri: normalizeGoogleUri(rawAuthor.uri) ?? '#',
        }
      : null;

  return {
    photoUrl,
    photoAttribution,
    googleMapsUri: place.googleMapsLinks?.placeUri ?? null,
    rating: typeof place.rating === 'number' ? place.rating : null,
    userRatingCount: typeof place.userRatingCount === 'number' ? place.userRatingCount : null,
    placeName: place.displayName?.text ?? null,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/reviews', async (_req: Request, res: Response) => {
    try {
      const reviews = await readStoredReviews();
      res.status(200).json({ reviews });
    } catch (error) {
      console.error('[Reviews GET Error]', error);
      res.status(500).json({ error: 'Gagal memuat komentar.' });
    }
  });

  app.post('/api/reviews', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const nama = typeof body.nama === 'string' ? body.nama.trim().slice(0, 80) : '';
      const asal = typeof body.asal === 'string' && body.asal.trim()
        ? body.asal.trim().slice(0, 80)
        : 'Pengunjung';
      const destinasi = typeof body.destinasi === 'string' && body.destinasi.trim()
        ? body.destinasi.trim().slice(0, 120)
        : 'Kabupaten Pati';
      const komentar = typeof body.komentar === 'string' ? body.komentar.trim().slice(0, 1000) : '';
      const rawRating = Number(body.rating);
      const rating = Number.isFinite(rawRating) ? Math.min(5, Math.max(1, Math.round(rawRating))) : 5;
      const rekomendasi = typeof body.rekomendasi === 'boolean' ? body.rekomendasi : rating >= 4;

      if (!nama || komentar.length < 5) {
        res.status(400).json({ error: 'Nama dan komentar (min. 5 karakter) wajib diisi.' });
        return;
      }

      const id = typeof body.id === 'string' && body.id.trim()
        ? body.id.trim().slice(0, 64)
        : `rev-user-${Date.now()}`;

      const tanggal = typeof body.tanggal === 'string' && body.tanggal.trim()
        ? body.tanggal.trim().slice(0, 40)
        : new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date());

      const newReview: StoredReview = {
        id,
        nama,
        asal,
        destinasi,
        rating,
        tanggal,
        komentar,
        rekomendasi,
        helpfulCount: 0,
      };

      const existing = await readStoredReviews();
      const updated = [newReview, ...existing.filter((item) => item.id !== id)].slice(0, 500);
      await writeStoredReviews(updated);

      res.status(201).json({ review: newReview });
    } catch (error) {
      console.error('[Reviews POST Error]', error);
      res.status(500).json({ error: 'Gagal menyimpan komentar.' });
    }
  });

  app.post('/api/reviews/:id/helpful', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const existing = await readStoredReviews();
      let found: StoredReview | undefined;
      const updated = existing.map((item) => {
        if (item.id === id) {
          found = { ...item, helpfulCount: (item.helpfulCount ?? 0) + 1 };
          return found;
        }
        return item;
      });

      if (found) {
        await writeStoredReviews(updated);
      }
      res.status(200).json({ review: found ?? null });
    } catch (error) {
      console.error('[Reviews Helpful Error]', error);
      res.status(500).json({ error: 'Gagal memperbarui tanda membantu.' });
    }
  });

  app.delete('/api/reviews/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const existing = await readStoredReviews();
      const updated = existing.filter((item) => item.id !== id);
      await writeStoredReviews(updated);
      res.status(200).json({ deleted: true });
    } catch (error) {
      console.error('[Reviews DELETE Error]', error);
      res.status(500).json({ error: 'Gagal menghapus komentar.' });
    }
  });

  app.get('/api/places/photo', async (req: Request, res: Response) => {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const lat = typeof req.query.lat === 'string' ? parseFloat(req.query.lat) : undefined;
    const lng = typeof req.query.lng === 'string' ? parseFloat(req.query.lng) : undefined;

    if (!query || query.length > 180) {
      res.status(400).json({ error: 'Parameter q wajib diisi (maks 180 karakter).' });
      return;
    }

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      res.status(200).json({ place: null, configured: false });
      return;
    }

    const cacheKey = `${query.toLowerCase()}|${lat ?? ''}|${lng ?? ''}`;
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.status(200).json({ place: cached.data, configured: true });
      return;
    }

    try {
      let pending = inFlightRequests.get(cacheKey);
      if (!pending) {
        pending = fetchPlacePhotoFromGoogle(query, lat, lng);
        inFlightRequests.set(cacheKey, pending);
      }

      const result = await pending;
      inFlightRequests.delete(cacheKey);

      if (result) {
        setSessionCache(cacheKey, result);
      }

      res.status(200).json({ place: result, configured: true });
    } catch (error) {
      inFlightRequests.delete(cacheKey);

      if (error instanceof QuotaExceededError) {
        res.status(429).json({
          quotaExceeded: true,
          error: { status: 'RESOURCE_EXHAUSTED', message: error.message },
        });
        return;
      }

      console.error('[Places API Proxy Error]', error);
      res.status(500).json({ error: 'Gagal memuat foto dari Google Places API.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIP Pati server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
