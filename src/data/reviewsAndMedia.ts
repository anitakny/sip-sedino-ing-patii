import { MediaItem, ReviewItem } from '../types';

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1',
    judul: 'Kabut Pagi & Savana Hijau Waduk Seloromo',
    keterangan: 'Pemandangan asri di Waduk Seloromo berlatar Gunung Muria. Suasana sangat damai dan menyejukkan hati.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLd4oP3kX9UW5WMLphoqM2Q4HkWtWDAG-Zxb2-1fEvSSfAEBJjIjJBBJ5yuRNe9aqKKC4-62I8WowtEDtfpaeG8jUcqKSnHJ0HTLMVElzZAvJnM4PgJlHMSU5mO0gskVtNtg0kWpBFFIpPzR=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLd4oP3kX9UW5WMLphoqM2Q4HkWtWDAG-Zxb2-1fEvSSfAEBJjIjJBBJ5yuRNe9aqKKC4-62I8WowtEDtfpaeG8jUcqKSnHJ0HTLMVElzZAvJnM4PgJlHMSU5mO0gskVtNtg0kWpBFFIpPzR=w600-h400-k-no',
    penulis: 'Dokumentasi Google Maps',
    lokasi: 'Gribigan, Gembong',
    tanggal: 'Terverifikasi Maps',
    likes: 142,
    tags: ['WadukSeloromo', 'SunriseMuria', 'CampingPati']
  },
  {
    id: 'media-2',
    judul: 'Eksotisme Gua Pancur Jimbaran Kayen',
    keterangan: 'Wisata gua karst bersejarah di lereng Pegunungan Kendeng dengan aliran sungai bawah tanah jernih dan taman wisata air.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeo-Tfsy8Vucp5jcD1rR-KfUOnY0R4xnhi8f-U4YiCsvjflIyq2QIloQ7TQiZpSopAxi-grzwkUmzu3cOvYE4ZsYB7JamfvuXEIURAwy7m34dQ5iXOEoXkSdwn-Zxxw0MpF3c-R=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeo-Tfsy8Vucp5jcD1rR-KfUOnY0R4xnhi8f-U4YiCsvjflIyq2QIloQ7TQiZpSopAxi-grzwkUmzu3cOvYE4ZsYB7JamfvuXEIURAwy7m34dQ5iXOEoXkSdwn-Zxxw0MpF3c-R=w600-h400-k-no',
    penulis: 'Dokumentasi Google Maps',
    lokasi: 'Jimbaran, Kayen',
    tanggal: 'Terverifikasi Maps',
    likes: 118,
    tags: ['Caving', 'GuaPancur', 'GeoparkKendeng']
  },
  {
    id: 'media-3',
    judul: 'Sentra Batik Tulis Bakaran Bu Sri P. Sarni',
    keterangan: 'Proses detail pembuatan batik tulis Bakaran khas pesisir Juwana dengan motif klasik Sigar Penjalin dan pewarnaan alami.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfXLBi5HhkmC5tvK2auHw8ClhcLmyvKym3y9zZQBe4J8d3PsCK5u4HWB4mD-4_NEm9ZkqR1KQOKucfdRXTarNbvMhAu7Qt_dJDp-DyNEfsKI6dl3g72zPsVGgCpwKXIE53te8Q3hZn1qOND=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfXLBi5HhkmC5tvK2auHw8ClhcLmyvKym3y9zZQBe4J8d3PsCK5u4HWB4mD-4_NEm9ZkqR1KQOKucfdRXTarNbvMhAu7Qt_dJDp-DyNEfsKI6dl3g72zPsVGgCpwKXIE53te8Q3hZn1qOND=w600-h400-k-no',
    penulis: 'Dokumentasi Google Maps',
    lokasi: 'Bakaran, Juwana',
    tanggal: 'Terverifikasi Maps',
    likes: 187,
    tags: ['BatikBakaran', 'EkrafPati', 'WarisanBudaya']
  },
  {
    id: 'media-4',
    judul: 'Panorama Waduk Gunungrowo Lereng Muria',
    keterangan: 'Suasana tenang tepi waduk peninggalan kolonial di Sitiluhur, Gembong yang sejuk dan dikelilingi sentra kuliner ikan bakar.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TCtSCvxPGGLeeeDHdd6AV5uoqmtb7el6hx-zcAFIINHdil-1FPuwx9OvfuzqMXvTFJ2ORq1hHsHBZWmDVPTlQRGMZeoljoFRWbW_1dY3GYk0hWj2D4qZpUfFO-7Dk35QHbQJmJlkuI6QY=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TCtSCvxPGGLeeeDHdd6AV5uoqmtb7el6hx-zcAFIINHdil-1FPuwx9OvfuzqMXvTFJ2ORq1hHsHBZWmDVPTlQRGMZeoljoFRWbW_1dY3GYk0hWj2D4qZpUfFO-7Dk35QHbQJmJlkuI6QY=w600-h400-k-no',
    penulis: 'Dokumentasi Google Maps',
    lokasi: 'Sitiluhur, Gembong',
    tanggal: 'Terverifikasi Maps',
    likes: 164,
    tags: ['WadukGunungrowo', 'Gembong', 'WisataAlam']
  },
  {
    id: 'media-5',
    judul: 'Jembatan Kayu Mangrove Pantai Kertomulyo',
    keterangan: 'Menyusuri hutan bakau pesisir Pantura menuju bibir Pantai Kertomulyo Trangkil dengan udara laut yang menyegarkan.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeDMG1FLvKfr1m08o0HFdQd_WyLG50i9_7CmgUr2zt6zcviuyRWaj-MQbw7PPU5mMaXjR6QZrfdU72NW8_tWhFkDfVtjkPG_0vqffZThxjT5U8Wit_trU2Q4kI10SmHuQZ_u-N7=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLeDMG1FLvKfr1m08o0HFdQd_WyLG50i9_7CmgUr2zt6zcviuyRWaj-MQbw7PPU5mMaXjR6QZrfdU72NW8_tWhFkDfVtjkPG_0vqffZThxjT5U8Wit_trU2Q4kI10SmHuQZ_u-N7=w600-h400-k-no',
    penulis: 'Dokumentasi Google Maps',
    lokasi: 'Kertomulyo, Trangkil',
    tanggal: 'Terverifikasi Maps',
    likes: 152,
    tags: ['PantaiKertomulyo', 'MangrovePati', 'PesisirUtara']
  },
  {
    id: 'media-6',
    judul: 'Kemegahan Masjid Agung Baitunnur Pati',
    keterangan: 'Masjid kebanggaan warga Kabupaten Pati tepat di sisi barat Alun-Alun Simpang Lima Pati.',
    tipe: 'foto',
    url: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Qm46ZZvAi6ire8RMCBZ5CjNnoM5IDr0bmRfWIEivvgM6iS4JHhGWSYW4CtcZJ-Nn1uyu_nz10VTkrR6YPOWMZmLSbbX1KEaUDIPqnneQI_Hsba7X8GUvQcdDzs1AQJfhCZCReu=w1200-h800-k-no',
    thumbnailUrl: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Qm46ZZvAi6ire8RMCBZ5CjNnoM5IDr0bmRfWIEivvgM6iS4JHhGWSYW4CtcZJ-Nn1uyu_nz10VTkrR6YPOWMZmLSbbX1KEaUDIPqnneQI_Hsba7X8GUvQcdDzs1AQJfhCZCReu=w600-h400-k-no',
    penulis: 'Dokumentasi Google Maps',
    lokasi: 'Alun-Alun Simpang Lima, Pati Kota',
    tanggal: 'Terverifikasi Maps',
    likes: 194,
    tags: ['MasjidBaitunnur', 'ReligiPati', 'PusatKota']
  }
];

export const INITIAL_REVIEWS: ReviewItem[] = [];
