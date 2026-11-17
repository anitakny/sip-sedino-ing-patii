import { MediaItem, ReviewItem } from '../types';

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1',
    judul: 'Kabut Pagi & Savana Hijau Waduk Seloromo',
    keterangan: 'Pemandangan dramatis saat matahari terbit di Waduk Seloromo berlatar Gunung Muria. Suasana sangat damai dan menyejukkan hati.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLd4oP3kX9UW5WMLphoqM2Q4HkWtWDAG-Zxb2-1fEvSSfAEBJjIjJBBJ5yuRNe9aqKKC4-62I8WowtEDtfpaeG8jUcqKSnHJ0HTLMVElzZAvJnM4PgJlHMSU5mO0gskVtNtg0kWpBFFIpPzR=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLd4oP3kX9UW5WMLphoqM2Q4HkWtWDAG-Zxb2-1fEvSSfAEBJjIjJBBJ5yuRNe9aqKKC4-62I8WowtEDtfpaeG8jUcqKSnHJ0HTLMVElzZAvJnM4PgJlHMSU5mO0gskVtNtg0kWpBFFIpPzR=w600-h400-k-no',
    penulis: 'Rian Pratama',
    lokasi: 'Gribigan, Gembong',
    tanggal: '3 hari yang lalu',
    likes: 142,
    tags: ['WadukSeloromo', 'SunriseMuria', 'CampingPati']
  },
  {
    id: 'media-2',
    judul: 'Eksplorasi Stalaktit & Sungai Bawah Tanah Gua Pancur',
    keterangan: 'Video susur gua karst sejauh 127 meter di Jimbaran Kayen. Airnya jernih dingin dan formasi batuannya luar biasa indah!',
    tipe: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    penulis: 'Dian Safitri (Traveler)',
    lokasi: 'Jimbaran, Kayen',
    tanggal: '5 hari yang lalu',
    likes: 98,
    tags: ['Caving', 'GuaPancur', 'GeoparkKendeng']
  },
  {
    id: 'media-3',
    judul: 'Mencanting Motif Sigar Penjalin di Sentra Batik Bakaran',
    keterangan: 'Dokumentasi proses detail pembuatan batik tulis Bakaran kuno oleh pengrajin generasi ketiga Juwana. Bangga budaya nusantara!',
    tipe: 'foto',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
    penulis: 'Budi Santoso',
    lokasi: 'Bakaran Wetan, Juwana',
    tanggal: '1 minggu yang lalu',
    likes: 187,
    tags: ['BatikBakaran', 'EkrafPati', 'WarisanBudaya']
  },
  {
    id: 'media-4',
    judul: 'Nikmatnya Nasi Gandul Asli Gajahmati Beralas Daun Pisang',
    keterangan: 'Kuah santan gurih manis berpadu lauk lidah dan paru goreng garing dower. Wajib dicoba kalau mampir ke Pati!',
    tipe: 'foto',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    penulis: 'Maya Anggraini (Food Blogger)',
    lokasi: 'Gajahmati, Pati Kota',
    tanggal: '1 minggu yang lalu',
    likes: 245,
    tags: ['KulinerPati', 'NasiGandul', 'MakanMalam']
  },
  {
    id: 'media-5',
    judul: 'Pemandangan Udara Perkebunan Kopi Jolong Lereng Muria',
    keterangan: 'Suasana asri nan damai di kebun kopi peninggalan kolonial Belanda. Udaranya sangat sejuk dan bebas polusi.',
    tipe: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-green-mountain-range-42907-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    penulis: 'Ahmad Fauzi (Drone Pilot)',
    lokasi: 'Sitiluhur, Gembong',
    tanggal: '2 minggu yang lalu',
    likes: 310,
    tags: ['Jolong', 'KopiMuria', 'WisataAlam']
  },
  {
    id: 'media-6',
    judul: 'Kemegahan Arsitektur Masjid Agung Baitunnur Saat Senja',
    keterangan: 'Pancaran lampu malam Alun-Alun Simpang Lima Pati berpadu anggun dengan kubah hijau masjid kebanggaan warga Pati.',
    tipe: 'foto',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=85',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
    penulis: 'Hendra Gunawan',
    lokasi: 'Alun-Alun Simpang Lima, Pati Kota',
    tanggal: '2 minggu yang lalu',
    likes: 164,
    tags: ['MasjidBaitunnur', 'ReligiPati', 'PusatKota']
  }
];

export const INITIAL_REVIEWS: ReviewItem[] = [];
