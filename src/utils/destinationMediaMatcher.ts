import { DESTINATIONS_DATA } from '../data/destinationsData';
import type { Destination, MediaItem } from '../types';

export interface MediaDestinationGroup {
  key: string;
  destination?: Destination;
  primary: MediaItem;
  items: MediaItem[];
}

const KEYWORD_TO_DEST_NAME: Array<[RegExp, string]> = [
  [/waduk seloromo|seloromo|gribigan/i, 'Waduk Seloromo'],
  [/waduk gunungrowo|gunungrowo|sitiluhur/i, 'Waduk Gunungrowo'],
  [/grenjengan sewu/i, 'Air Terjun Grenjengan Sewu'],
  [/lorodan semar/i, 'Air Terjun Lorodan Semar'],
  [/tadah hujan/i, 'Air Terjun Tadah Hujan'],
  [/gua pancur|pancur|jimbaran/i, 'Gua Pancur'],
  [/gua wareh/i, 'Gua Wareh'],
  [/kertomulyo/i, 'Pantai Kertomulyo Mangrove'],
  [/pantai idola|banyutowo/i, 'Pantai Idola Banyutowo'],
  [/bukit naga/i, 'Bukit Naga'],
  [/ki santa|pandang ki santa/i, 'Bukit Pandang Ki Santa Mulya'],
  [/hutan pinus|pinus gunungsari/i, 'Hutan Pinus Gunungsari'],
  [/gerbang majapahit|keputren/i, 'Pintu Gerbang Majapahit (Pintu Keputren)'],
  [/pendopo/i, 'Pendopo Kabupaten Pati'],
  [/pg trangkil|pabrik gula trangkil/i, 'Pabrik Gula Trangkil (PG Trangkil)'],
  [/stasiun kereta api|stasiun lama/i, 'Stasiun Kereta Api Pati (Stasiun Lama)'],
  [/genuk kemiri/i, 'Situs Genuk Kemiri'],
  [/tjoe tik bio|klenteng/i, 'Klenteng Tjoe Tik Bio'],
  [/desa wisata jrahi/i, 'Desa Wisata Jrahi'],
  [/embung jrahi/i, 'Embung Jrahi'],
  [/batik.*bakaran|bakaran.*juwana/i, 'Sentra Batik Bakaran Juwana'],
  [/kuningan|kerajinan logam/i, 'Sentra Kerajinan Logam & Kuningan'],
  [/samin/i, 'Komunitas Adat Samin'],
  [/pragolo/i, 'Pasar Pragolo (Plaza Pragolo Pati)'],
  [/syekh jangkung|saridin/i, 'Makam Syekh Jangkung (Saridin)'],
  [/baitunnur|masjid agung/i, 'Masjid Agung Baitunnur Pati'],
  [/mutamakkin|kajen/i, 'Makam Syekh Ahmad Mutamakkin Kajen'],
  [/alun-alun|simpang lima/i, 'Alun-Alun Simpang Lima Pati'],
  [/jolong/i, 'Agrowisata Jolong 1'],
  [/waterboom|mulia klik/i, 'Waterboom Mulia KLIK'],
  [/joyokusumo/i, 'Taman Joyokusumo Pati'],
  [/nasi gandul.*bu mira|bu mira/i, 'Nasi Gandul Bu Mira'],
  [/nasi gandul.*romantis|sardi/i, 'Nasi Gandul Romantis H.S. Sardi'],
  [/soto kemiri|pak kribo/i, 'Soto Kemiri Pak Kribo'],
  [/dua kelinci|waroeng pati/i, 'Pusat Oleh-Oleh Pati Dua Kelinci (Waroeng Pati)'],
  [/manyung|bu fat/i, 'Mangut Kepala Manyung Bu Fat Juwana'],
  [/sego tewel|mbah rasiah/i, 'Sego Tewel Mbah Rasiah'],
  [/bandeng.*ff jaya|ff jaya/i, 'Bandeng Presto FF Jaya'],
  [/ampo|bumiayu/i, 'Kerupuk Ampo Bumiayu (Tanah Liat Tradisional)'],
  [/pamelo|bageng/i, 'Jeruk Pamelo Bageng (Sentra Jeruk Madu)'],
  [/dawet lestari/i, 'Dawet Lestari'],
];

const SORTED_DESTS_BY_NAME_LEN = [...DESTINATIONS_DATA].sort(
  (a, b) => b.nama.length - a.nama.length
);

export function findMatchingDestination(item: {
  lokasi?: string;
  judul?: string;
  tags?: string[];
}): Destination | undefined {
  const lokasiNorm = (item.lokasi || '').trim().toLowerCase();
  const judulNorm = (item.judul || '').trim().toLowerCase();
  const combined = `${lokasiNorm} ${judulNorm} ${(item.tags || []).join(' ').toLowerCase()}`.trim();

  if (!combined) return undefined;

  // 1. Exact destination name match on lokasi
  const exact = DESTINATIONS_DATA.find((d) => d.nama.toLowerCase() === lokasiNorm);
  if (exact) return exact;

  // Disambiguate Masjid Agung Baitunnur Pati (often located at Alun-Alun Simpang Lima)
  if (/baitunnur|masjid agung/i.test(combined)) {
    const masjid = DESTINATIONS_DATA.find((d) => d.nama === 'Masjid Agung Baitunnur Pati');
    if (masjid) return masjid;
  }

  // 2. Specific keyword / curated location match on lokasi first, then combined
  for (const [regex, destName] of KEYWORD_TO_DEST_NAME) {
    if (regex.test(lokasiNorm)) {
      const found = DESTINATIONS_DATA.find((d) => d.nama === destName);
      if (found) return found;
    }
  }

  for (const dest of SORTED_DESTS_BY_NAME_LEN) {
    if (lokasiNorm.includes(dest.nama.toLowerCase())) {
      return dest;
    }
  }

  for (const [regex, destName] of KEYWORD_TO_DEST_NAME) {
    if (regex.test(combined)) {
      const found = DESTINATIONS_DATA.find((d) => d.nama === destName);
      if (found) return found;
    }
  }

  for (const dest of SORTED_DESTS_BY_NAME_LEN) {
    if (combined.includes(dest.nama.toLowerCase())) {
      return dest;
    }
  }

  return undefined;
}

/**
 * Groups media items by destination (or normalized location) while preserving newest-first order.
 * The most recently updated destination moves to the very top, its cover becomes the latest item,
 * and earlier photos for that destination remain attached in `group.items` without duplicate cards.
 */
export function groupMediaByDestination(mediaList: MediaItem[]): MediaDestinationGroup[] {
  const groupMap = new Map<string, MediaDestinationGroup>();
  const orderedKeys: string[] = [];

  for (const item of mediaList) {
    const matchedDest = findMatchingDestination(item);
    const key = matchedDest
      ? `dest-${matchedDest.id}`
      : `loc-${item.lokasi.trim().toLowerCase() || item.id}`;

    const existing = groupMap.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groupMap.set(key, {
        key,
        destination: matchedDest,
        primary: item,
        items: [item],
      });
      orderedKeys.push(key);
    }
  }

  return orderedKeys.map((k) => groupMap.get(k)!);
}
