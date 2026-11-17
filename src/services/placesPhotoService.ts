export interface GooglePhotoAttribution {
  displayName: string;
  uri: string;
}

export interface GooglePlacePhotoData {
  photoUrl: string | null;
  photoAttribution: GooglePhotoAttribution | null;
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  placeName: string | null;
}

const sessionPhotoCache = new Map<string, GooglePlacePhotoData | null>();
const inflightMap = new Map<string, Promise<GooglePlacePhotoData | null>>();

const MAX_CONCURRENT = 3;
let activeCount = 0;
const waitQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waitQueue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  activeCount = Math.max(0, activeCount - 1);
  const next = waitQueue.shift();
  if (next) next();
}

export async function fetchGooglePlacePhoto(
  query: string,
  lat?: number,
  lng?: number
): Promise<GooglePlacePhotoData | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const cacheKey = `${trimmed.toLowerCase()}|${lat ?? ''}|${lng ?? ''}`;
  if (sessionPhotoCache.has(cacheKey)) {
    return sessionPhotoCache.get(cacheKey) ?? null;
  }

  const existing = inflightMap.get(cacheKey);
  if (existing) {
    return existing;
  }

  const task = (async () => {
    await acquireSlot();
    try {
      const params = new URLSearchParams({ q: trimmed });
      if (typeof lat === 'number' && typeof lng === 'number') {
        params.set('lat', String(lat));
        params.set('lng', String(lng));
      }

      const res = await fetch(`/api/places/photo?${params.toString()}`);

      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        sessionPhotoCache.set(cacheKey, null);
        return null;
      }

      const json = (await res.json()) as {
        place?: GooglePlacePhotoData | null;
        quotaExceeded?: boolean;
        error?: { status?: string };
      };

      if (json?.quotaExceeded || json?.error?.status === 'RESOURCE_EXHAUSTED') {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        sessionPhotoCache.set(cacheKey, null);
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const placeData = json.place ?? null;
      sessionPhotoCache.set(cacheKey, placeData);
      return placeData;
    } catch {
      return null;
    } finally {
      releaseSlot();
      inflightMap.delete(cacheKey);
    }
  })();

  inflightMap.set(cacheKey, task);
  return task;
}
