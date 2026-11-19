import React, { useEffect, useRef, useState } from 'react';
import {
  fetchGooglePlacePhoto,
  type GooglePlacePhotoData,
} from '../services/placesPhotoService';

interface GooglePlaceImageProps {
  query: string;
  alt: string;
  fallbackUrl: string;
  lat?: number;
  lng?: number;
  className?: string;
  eager?: boolean;
  showAttribution?: boolean;
  onPlaceLoaded?: (data: GooglePlacePhotoData) => void;
}

export const GooglePlaceImage: React.FC<GooglePlaceImageProps> = ({
  query,
  alt,
  fallbackUrl,
  lat,
  lng,
  className = 'w-full h-full object-cover',
  eager = false,
  showAttribution = true,
  onPlaceLoaded,
}) => {
  const isDirectVerifiedPhoto = Boolean(fallbackUrl) && !fallbackUrl.includes('unsplash.com');
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldFetch, setShouldFetch] = useState<boolean>(eager && !isDirectVerifiedPhoto);
  const [placeData, setPlaceData] = useState<GooglePlacePhotoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    if (isDirectVerifiedPhoto) {
      setShouldFetch(false);
      return;
    }

    if (eager) {
      setShouldFetch(true);
      return;
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldFetch(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldFetch(true);
          observer.disconnect();
        }
      },
      { rootMargin: '140px', threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, query, isDirectVerifiedPhoto]);

  useEffect(() => {
    if (!shouldFetch || isDirectVerifiedPhoto) return;

    let cancelled = false;
    setIsLoading(true);
    setImgError(false);

    fetchGooglePlacePhoto(query, lat, lng)
      .then((data) => {
        if (cancelled) return;
        setPlaceData(data);
        if (data && onPlaceLoaded) {
          onPlaceLoaded(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldFetch, query, lat, lng, isDirectVerifiedPhoto]);

  const activeSrc =
    !imgError && placeData?.photoUrl ? placeData.photoUrl : fallbackUrl;
  const hasMapsPhoto = !imgError && Boolean(placeData?.photoUrl);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {isLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-slate-200 animate-pulse z-10"
        />
      )}

      <img
        src={activeSrc}
        alt={alt}
        className={className}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />

      {showAttribution && hasMapsPhoto && placeData?.photoAttribution && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-1.5 right-1.5 z-20 max-w-[85%] truncate rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-xs"
        >
          Google Maps •{' '}
          <a
            href={placeData.photoAttribution.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-300"
          >
            {placeData.photoAttribution.displayName}
          </a>
        </div>
      )}
    </div>
  );
};
