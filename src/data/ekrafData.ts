import { EkrafCategory, EkrafProduct } from '../types';

export const EKRAF_CATEGORIES: EkrafCategory[] = [
  {
    id: 'kriya-tekstil',
    nama: 'Kriya Tekstil & Batik Bakaran',
    deskripsi: 'Warisan adiluhung batik tulis pesisir dengan motif klasik Majapahit seperti Sigar Penjalin, Gandrung, dan Manggar.',
    ikon: 'Scissors',
    jumlahPelaku: '120+ Pengrajin Aktif',
    sentra: 'Desa Bakaran Wetan & Bakaran Kulon, Juwana'
  },
  {
    id: 'kriya-logam',
    nama: 'Kriya Logam & Kuningan Juwana',
    deskripsi: 'Pusat industri pengecoran kuningan dan tembaga nomor satu di Indonesia yang menembus pasar ekspor perabot & interior.',
    ikon: 'Hammer',
    jumlahPelaku: '85+ Industri Rumahan',
    sentra: 'Kecamatan Juwana'
  },
  {
    id: 'kuliner-kreatif',
    nama: 'Kuliner Tradisi & Olahan Bandeng',
    deskripsi: 'Inovasi olahan bandeng duri lunak tanpa tulang, Nasi Gandul kemasan steril, serta camilan khas kacang oven.',
    ikon: 'UtensilsCrossed',
    jumlahPelaku: '350+ UMKM Kuliner',
    sentra: 'Pati Kota, Juwana, & Margorejo'
  },
  {
    id: 'kriya-bambu-tanah',
    nama: 'Kriya Bambu & Warisan Ampo',
    deskripsi: 'Eksotisme anyaman bambu Gunungsari dan seni pengasapan kerupuk tanah liat murni (Ampo) tertua di nusantara.',
    ikon: 'Layers',
    jumlahPelaku: '60+ Pengrajin Desa',
    sentra: 'Gunungsari (Tlogowungu) & Bumiayu (Wedarijaksa)'
  },
  {
    id: 'agro-kreatif',
    nama: 'Agroindustri Kopi Muria & Pamelo',
    deskripsi: 'Pengembangan biji kopi robusta lereng Muria bernuansa cokelat rempah dan budidaya jeruk bali manis raksasa tanpa rasa getir.',
    ikon: 'Coffee',
    jumlahPelaku: '180+ Petani & Roastery',
    sentra: 'Jolong (Gembong) & Bageng'
  },
  {
    id: 'seni-pertunjukan',
    nama: 'Seni Pertunjukan & Ketoprak Pati',
    deskripsi: 'Pusat barometer pagelaran seni sandiwara rakyat ketoprak klasik Jawa teraktif dengan sanggar tata rias dan kostum adat.',
    ikon: 'Drama',
    jumlahPelaku: '45+ Perkumpulan Seni',
    sentra: 'Margorejo & Tayu'
  }
];

export const EKRAF_PRODUCTS: EkrafProduct[] = [
  {
    id: 'ekraf-1',
    kategoriId: 'kriya-tekstil',
    nama: 'Kain Batik Tulis Motif Sigar Penjalin Bakaran',
    kategori: 'Kriya Tekstil',
    deskripsi: 'Motif mahakarya batik tulis Bakaran berfilosofi kerendahan hati dan keteguhan jiwa, menggunakan pewarnaan sogan alam eksklusif.',
    harga: 'Rp 275.000 - Rp 1.500.000',
    lokasiSentra: 'Bakaran Wetan, Kec. Juwana',
    pengrajin: 'Paguyuban Batik Tulis Bakaran Indah',
    kontakWa: '6281234567890',
    keunggulan: ['100% Canting Tulis Tangan', 'Pewarna Alami Tahan Lama', 'Sertifikat Hak Kekayaan Intelektual (HAKI)'],
    imageUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLfXLBi5HhkmC5tvK2auHw8ClhcLmyvKym3y9zZQBe4J8d3PsCK5u4HWB4mD-4_NEm9ZkqR1KQOKucfdRXTarNbvMhAu7Qt_dJDp-DyNEfsKI6dl3g72zPsVGgCpwKXIE53te8Q3hZn1qOND=w1200-h800-k-no'
  },
  {
    id: 'ekraf-2',
    kategoriId: 'kriya-logam',
    nama: 'Lampu Gantung Antik & Kerajinan Kuningan Juwana',
    kategori: 'Kriya Logam',
    deskripsi: 'Lampu gantung ornamen klasik bergaya Eropa kolonial dan ukiran Jawa, berbahan kuningan tempa padat mengkilap tahan karat.',
    harga: 'Rp 450.000 - Rp 4.500.000',
    lokasiSentra: 'Kawasan Pengecoran Logam Juwana',
    pengrajin: 'Koperasi Pengrajin Kuningan Juwana Sejahtera',
    kontakWa: '6281298765432',
    keunggulan: ['Kuningan Murni Mutu Ekspor', 'Custom Desain Sesuai Permintaan Arsitek', 'Finishing Coating Anti Kusam'],
    imageUrl: 'https://rumahpengrajintembaga.com/wp-content/uploads/2025/06/IMG-20250614-WA0012-scaled.jpg'
  },
  {
    id: 'ekraf-3',
    kategoriId: 'kuliner-kreatif',
    nama: 'Bandeng Duri Lunak Vakum & Otak-Otak Spesial',
    kategori: 'Kuliner Olahan Pesisir',
    deskripsi: 'Ikan bandeng segar tambak Juwana dengan duri lunak sempurna hingga tulang kepala, dibumbui rempah kunyit jahe gurih.',
    harga: 'Rp 45.000 - Rp 95.000 / pack',
    lokasiSentra: 'Pusat Sentra Bandeng Juwana & Alun-Alun Pati',
    pengrajin: 'Sentra Bandeng Mina Makmur Juwana',
    kontakWa: '6281311223344',
    keunggulan: ['Kemasan Vakum Tahan 3 Bulan', 'Bebas Bau Tanah', 'Termasuk Sambal Terasi Khas Pati'],
    imageUrl: 'https://blue.kumparan.com/image/upload/fl_progressive,fl_lossy,c_fill,f_auto,q_auto:best,w_1200/v1602988818/rz8uilq1tdazjopxgkpr.jpg'
  },
  {
    id: 'ekraf-4',
    kategoriId: 'kriya-bambu-tanah',
    nama: 'Kerupuk Ampo Murni Tanah Liat Bumiayu',
    kategori: 'Seni Kuliner Purba & Kriya',
    deskripsi: 'Satu-satunya kuliner purba dari gulungan serutan tanah liat alluvial bersih, dipanggang di atas tungku kayu arang bertradisi ratusan tahun.',
    harga: 'Rp 20.000 - Rp 40.000 / besek',
    lokasiSentra: 'Desa Bumiayu, Kec. Wedarijaksa',
    pengrajin: 'Mbah Ampo Warisan Leluhur',
    kontakWa: '6285223344556',
    keunggulan: ['Tanah Liat Khusus Pilihan Bebas Polutan', 'Proses Panggang Tradisional', 'Kemasan Besek Anyaman Bambu Estetik'],
    imageUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLdSOK-6R-cZTSs4JKZMVF06Jb0BMin_LsHEdd8Yuyv8ZhEf8pcl7AEZ88Tpivs3zMf6XRUxmBGvA3DYzeEPkXIgbvK4qXUsYyaI1Mwwjuu1qZKUIekDrdPHaaXyY9dKIpH1_Yrecg=w1200-h800-k-no'
  },
  {
    id: 'ekraf-5',
    kategoriId: 'agro-kreatif',
    nama: 'Kopi Robusta Muria Jolong Specialty Roast',
    kategori: 'Agroindustri & Kopi',
    deskripsi: 'Biji kopi robusta dipetik matang merah (red cherry) dari kebun bersejarah peninggalan Belanda ketinggian 800 mdpl lereng Gunung Muria.',
    harga: 'Rp 45.000 - Rp 110.000 / 250gr',
    lokasiSentra: 'Perkebunan Kopi Jolong, Kec. Gembong',
    pengrajin: 'Roastery Kopi Petani Jrahi & Jolong',
    kontakWa: '6281778899001',
    keunggulan: ['Notes Cokelat Karamel Pekat', 'Medium-Dark Roast Segar', 'Single Origin Asli Pegunungan Muria'],
    imageUrl: 'https://static-tokodaring.tisera.id/prod/images/produk_gambar/68f398d592e1a.png'
  },
  {
    id: 'ekraf-6',
    kategoriId: 'agro-kreatif',
    nama: 'Jeruk Madu Pamelo Bageng Grade Super',
    kategori: 'Agro Buah Unggulan',
    deskripsi: 'Jeruk bali raksasa khas desa Bageng bertekstur bulir merah muda juicy yang renyah manis alami tanpa rasa pahit sedikitpun.',
    harga: 'Rp 30.000 - Rp 65.000 / buah',
    lokasiSentra: 'Desa Bageng, Kec. Gembong',
    pengrajin: 'Kelompok Tani Jeruk Pamelo Lestari',
    kontakWa: '6285712349988',
    keunggulan: ['Kaya Vitamin C & Antioksidan', 'Ukuran Jumbo 1.5 - 2.5 kg', 'Dapat Disimpan Segar Hingga 1 Bulan'],
    imageUrl: 'https://lh3.googleusercontent.com/grass-cs/AABkmLcbxInnjfrIv_Lk8FTWD6f8atZsZSCOgHKfN3mnvepsYNpbZ-tBNt8D_i8cMmNKFz5u5j04GeLha9InYndvDYxWA18U77wAVdf_zBDusRPp8lmc-zY9zoZctrmI2om8-AmnWYVT=w1200-h800-k-no'
  },
  {
    id: 'ekraf-7',
    kategoriId: 'kriya-bambu-tanah',
    nama: 'Anyaman Bambu Artistik & Besek Ramah Lingkungan Gunungsari',
    kategori: 'Kriya Bambu',
    deskripsi: 'Perlengkapan rumah tangga ramah lingkungan dari bambu apus pilihan, mulai dari tudung saji, tas jinjing modern, hingga packaging besek oleh-oleh.',
    harga: 'Rp 15.000 - Rp 180.000',
    lokasiSentra: 'Desa Wisata Gunungsari, Kec. Tlogowungu',
    pengrajin: 'Kelompok Anyam Bambu Muria Asri',
    kontakWa: '6285800112233',
    keunggulan: ['Bambu Awet Anti Rayap Alami', 'Desain Anyaman Rapi Halus', 'Zero-Plastic Packaging'],
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/Besek_Atau_Tumbu_Dari_Bahan_Bambu_Di_Kebumen_Jateng_NKRI.jpg/1280px-Besek_Atau_Tumbu_Dari_Bahan_Bambu_Di_Kebumen_Jateng_NKRI.jpg'
  },
  {
    id: 'ekraf-8',
    kategoriId: 'kuliner-kreatif',
    nama: 'Nasi Gandul Bumbu Rempah Instan Khas Pati',
    kategori: 'Inovasi Pangan Kemasan',
    deskripsi: 'Pasta bumbu rempah Nasi Gandul otentik khas Gajahmati, memungkinkan siapa pun memasak kuliner legendaris Pati di mana pun dengan mudah.',
    harga: 'Rp 35.000 / jar (porsi 5 mangkuk)',
    lokasiSentra: 'Gajahmati, Pati Kota',
    pengrajin: 'Gandul Nusantara Kreatif',
    kontakWa: '6282133445566',
    keunggulan: ['Tanpa Pengawet Buatan', 'Rasa Autentik Resep Mbah Pati', 'Telah Uji Sertifikasi Halal'],
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Nasi_Gandul_2.jpg/1280px-Nasi_Gandul_2.jpg'
  }
];
