# Replika Website KOPIFAB

Buka `index.html` di browser, atau di VS Code gunakan ekstensi Live Server (klik kanan index.html > Open with Live Server).

Struktur:
- index.html: struktur semua halaman (Beranda, Lokasi, Surat Kabar, Galeri, Footer)
- css/style.css: seluruh gaya
- js/app.js: data menu, lokasi, artikel, galeri, routing, lightbox

Data (menu, gerai, artikel, galeri) ada di bagian atas js/app.js.

## Cara mengganti gambar
Semua gambar ada di folder `images/` dan dipanggil dari `index.html` (cari komentar HOTSPOT).
- `roastery.svg`: gambar mesin, muncul saat kursor di atas area roastery
- `tukudapan.svg`: gambar etalase kue
- `pesan-online.svg`: gambar kurir (juga muncul saat klik "AMBIL DI SINI")
- `character.svg`: karakter yang mengikuti kursor

Ganti dengan gambar sendiri: simpan file baru (PNG dengan latar transparan paling cocok) di `images/`, lalu ubah nama file di atribut `src` pada `index.html`.
Posisi dan ukuran: ubah `left`, `top`, `width`, `height` (persen) pada elemen `<button class="spot">`.
Kecepatan karakter: ubah `SPEED` di `js/app.js`.
Foto latar kedai: hapus `<svg class="bg">...</svg>` di hero, lalu tambahkan di css/style.css: `.hero{background:url(../images/kedai.jpg) center/cover}`.

## Foto produk dan menu
- Foto panel kiri "Lini produk KOPIFAB": simpan sebagai `images/produk-tuku.jpg`
- Foto panel kanan Toserbaku (toko): `images/toserbaku-toko.jpg`
- Foto 3 produk Toserbaku: `images/toserbaku-botol.jpg`, `images/toserbaku-mukena.jpg`, `images/toserbaku-tas.jpg`
- Nama file, harga, dan link "Beli sekarang" diatur di bagian atas `js/app.js` (IMG dan PR).
- Menu (White-Milk, Black, Non-Coffee, KOPIFABdapan): edit `MENU` di `js/app.js`. Daftar di bawah dan di papan menu hero ikut berubah.

## Lapisan halaman utama (hero)
Urutan dari belakang ke depan: `images/hero-bg.jpg` (foto kedai tanpa meja) → karakter barista (`images/character.svg`) → `images/counter-fg.webp` (meja, PNG transparan, menutupi badan bawah barista) → ojek (`images/courier.svg`) → papan petunjuk dan hotspot.
Kalau mengganti foto, kedua gambar (`hero-bg.jpg` dan `counter-fg.webp`) harus berukuran sama (1728 x 910) dan sejajar. Posisi hotspot diatur dalam persen terhadap foto di `index.html`.

## Foto yang dipakai sekarang
- Panel kiri produk KOPIFAB: images/produk-tuku.jpg (1440x1200, rasio 6/5, diatur lewat --ph-ratio di css/style.css)
- Produk Toserbaku: images/toserbaku-jam.jpg, toserbaku-parfum.jpg, toserbaku-tas.jpg (800x800)
- Panel kanan Toserbaku: images/toserbaku-toko.jpg (tampil utuh, sisi kosong diisi versi blur foto)
- Nama produk, harga, dan link ada di const PR di js/app.js

## Galeri
- Satu bagian: "Cerita Kopi" (const GAL di js/app.js). Tiap foto: [judul, emoji cadangan, keterangan, file foto].
- Foto: images/galeri-1.jpg sampai galeri-8.jpg, ukuran 1600x1200 (4:3). Bingkai polaroid memotong bagian tengahnya menjadi persegi, tampilan besar menampilkan foto utuh.
- Untuk menambah foto, taruh file di images/ lalu tambah satu baris di GAL.

## Ilustrasi halaman Lokasi
Gambar jalan (ruko, plang KOPIFAB, bajaj) adalah SVG di index.html (class "street"). Teks plang ada di elemen <text> berisi KOPIFAB. Gerak bajaj diatur di css/style.css (kata kunci bjgo, durasi 18s).

## Halaman Pesan + Supabase
Menu PESAN di pojok kanan atas: pengunjung mengisi nama dan pesan. Selama `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di atas `js/pesan.js` kosong, pesan hanya tersimpan di browser pengunjung (localStorage).
Agar semua orang melihat pesan yang sama dan Anda bisa mengontrolnya:
1. Buat project gratis di supabase.com.
2. SQL Editor > New query > tempel isi `supabase-setup.sql` > Run.
3. Project Settings > API: salin Project URL dan anon public key, isikan ke `js/pesan.js`.
4. Kelola pesan di Table Editor > `pesan`: hilangkan centang kolom `tampil` untuk menyembunyikan, atau hapus baris.
Jangan pernah memasukkan service_role key ke web.

## Suara
- `js/sound.js`: semua suara dibuat oleh browser (Web Audio API), tidak ada file mp3. Dipanggil di akhir `index.html`.
- Musik lofi chill terus berputar (drum boom-bap dengan swing, bass, piano elektrik, gema). Musiknya dibuat generatif, jadi variasinya tidak persis sama tiap putaran.
- Ikon speaker di pojok kanan atas (di dalam navbar) menghidupkan/mematikan semua suara. Pilihan pengunjung tersimpan di localStorage.
- Browser hanya mengizinkan suara setelah pengunjung mengklik/menyentuh halaman. Karena itu layar loading menampilkan "KLIK UNTUK MASUK"; klik itu langsung menyalakan musik. Layar ini tidak muncul jika pengunjung sebelumnya mematikan suara atau browser mengizinkan autoplay. Untuk menghapusnya, hapus blok "layar masuk" di `js/sound.js` (dan baris `kfGate` di `js/app.js`); musik lalu mulai dari klik pertama di mana saja.
- Efek: klik, hover (mouse), pilih menu/ukuran, buka-tutup papan menu dan foto galeri, langkah barista, ojek datang, pindah halaman, ketik di halaman Pesan, pesan terkirim atau gagal.
- Pengaturan di atas `js/sound.js`: `MUSIC_VOL` (volume musik), `BPM` (tempo), `CH`/`BASS` (akor dan bass, nomor MIDI). Efek ada di objek `S`.
