# PARAMA LAGA

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)

> Sistem manajemen proyek berbasis web yang dikembangkan dengan Next.js.

## 📑 Daftar Isi
- [Tentang Aplikasi](#tentang-aplikasi)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Cara Memulai](#cara-memulai)
- [Struktur Aplikasi](#struktur-aplikasi)
- [Autentikasi](#autentikasi)
- [Pengembangan Lanjutan](#pengembangan-lanjutan)

## 🚀 Tentang Aplikasi
Parama Laga adalah aplikasi manajemen proyek yang memungkinkan pengguna untuk mengelola proyek, anggota tim, dan status proyek dengan antarmuka yang intuitif. Aplikasi ini dikembangkan menggunakan Next.js, Prisma, dan PostgreSQL.

## 💻 Teknologi yang Digunakan
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Autentikasi:** NextAuth.js

## 🏁 Cara Memulai

### Prasyarat
- Node.js (versi 16.x atau lebih tinggi)
- PostgreSQL
- npm atau yarn

### Langkah Instalasi

1. **Kloning repositori**
    ```bash
    git clone https://github.com/yourusername/parama-laga.git
    cd parama-laga
    ```

2. **Instalasi Dependensi**
    ```bash
    npm install
    # atau
    yarn install
    ```

3. **Konfigurasi Lingkungan**
    ```bash
    cp .env.example .env
    ```
    Sesuaikan konfigurasi database pada file `.env`

    Ubah username, password, serta nama data base pada kode:
    ```bash
    DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
    ```

    Jangan lupa untuk membuat database Postgres terlebih dahulu di perangkatn Anda.

4. **Install ts-node**
   ```
   npm install --save-dev ts-node
   ```

6. **Inisialisasi Database**
    ```bash
    npx prisma migrate dev --name init
    ```

7. **Pengisian Data Awal**
    ```bash
    npx prisma db seed
    ```

8. **Menjalankan Aplikasi**
    ```bash
    npm run dev
    # atau
    yarn dev
    ```

9. **Mengakses Aplikasi**
    Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi.

## 📂 Struktur Aplikasi
- `prisma/`: Berisi konfigurasi database dan model Prisma
- `app/`: Komponen dan halaman React
- `api/`: API endpoints
- `public/`: Asset publik seperti gambar dan favicon

## 🔐 Autentikasi
Aplikasi ini menggunakan NextAuth.js untuk autentikasi. Setelah menjalankan seed, Anda dapat login menggunakan kredensial berikut:

### PM:
- **Email:** pm@paramalaga.com
- **Password:** Manager123!

## 📚 Pengembangan Lanjutan
Untuk informasi lebih lanjut tentang pengembangan menggunakan Next.js:

- [Dokumentasi Next.js](https://nextjs.org/docs)
- [Dokumentasi Prisma](https://www.prisma.io/docs)
- [Dokumentasi NextAuth.js](https://next-auth.js.org)

## 📝 Lisensi
[MIT](LICENSE)

---
