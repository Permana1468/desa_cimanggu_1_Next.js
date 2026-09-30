# Catatan Komprehensif Matakuliah Sistem Informasi (Semester 1 - Semester Akhir)

> **Dokumen Catatan Pembahasan Studi Sistem Informasi (SI)**  
> *Dibuat sebagai panduan rangkuman materi perkuliahan, persiapan ujian, penyusunan skripsi/tugas akhir, dan referensi karir di bidang Teknologi Informasi.*

---

## 📑 Daftar Isi Matakuliah
1. [Algoritma & Pemrograman](#1-algoritma--pemrograman)
2. [Kalkulus](#2-kalkulus)
3. [Logika Informatika](#3-logika-informatika)
4. [Struktur Data](#4-struktur-data)
5. [Basis Data](#5-basis-data)
6. [Pemrograman Web Dasar](#6-pemrograman-web-dasar)
7. [Matematika Diskrit](#7-matematika-diskrit)
8. [Pemrograman Berorientasi Objek (PBO)](#8-pemrograman-berorientasi-objek-pbo)
9. [Jaringan Komputer](#9-jaringan-komputer)
10. [Analisis & Perancangan Sistem (APS)](#10-analisis--perancangan-sistem-aps)
11. [Sistem Operasi](#11-sistem-operasi)
12. [Pemrograman Web Lanjutan](#12-pemrograman-web-lanjutan)
13. [Enterprise Resource Planning (ERP)](#13-enterprise-resource-planning-erp)
14. [Rekayasa Perangkat Lunak (RPL)](#14-rekayasa-perangkat-lunak-rpl)
15. [Data Warehouse & Business Intelligence](#15-data-warehouse--business-intelligence)
16. [Desain UI/UX](#16-desain-uiux)
17. [Manajemen Proyek TI](#17-manajemen-proyek-ti)
18. [Keamanan Sistem Informasi](#18-keamanan-sistem-informasi)

---

### 1. Algoritma & Pemrograman
* **Konsep Utama**: Urutan langkah-langkah logis dan sistematis yang disusun untuk menyelesaikan masalah komputasi.
* **Tipe Data & Variabel**:
  * *Tipe Data Primitif*: `Integer` (bilangan bulat), `Float/Double` (desimal), `Char` (karakter), `Boolean` (`true`/`false`).
  * *Tipe Data Komposit*: `String` (teks), `Array` (kumpulan data sejenis), `Struct/Record` (kumpulan data beda tipe).
* **Struktur Kontrol**:
  * *Percabangan*: `if-else`, `else-if`, `switch-case`.
  * *Perulangan*: `for` (perulangan pasti), `while` (pemeriksaan di awal), `do-while` (pemeriksaan di akhir).
* **Fungsi dan Prosedur**:
  * *Fungsi*: Subrutin yang mengembalikan nilai (`return`).
  * *Prosedur*: Subrutin yang tidak mengembalikan nilai (`void`).
* **Kompleksitas Algoritma (Notasi Big-O)**:
  * $O(1)$: Constant Time.
  * $O(\log n)$: Logarithmic Time (misal: *Binary Search*).
  * $O(n)$: Linear Time (misal: *Linear Search*).
  * $O(n \log n)$: Log-Linear Time (misal: *Merge Sort*, *Quick Sort*).
  * $O(n^2)$: Quadratic Time (misal: *Bubble Sort*, *Selection Sort*).

---

### 2. Kalkulus
* **Konsep Utama**: Cabang matematika yang mempelajari perubahan kontinu (laju perubahan dan akumulasi).
* **Limit & Kontinuitas**: Mengukur perilaku suatu fungsi saat variabel mendekati nilai tertentu.
* **Diferensial (Turunan)**:
  * Mengukur laju perubahan instan (kemiringan garis singgung kurva).
  * *Aturan Turunan*: Aturan Rantai (Chain Rule), Aturan Perkalian (Product Rule), Aturan Pembagian (Quotient Rule).
  * *Aplikasi di TI*: Optimasi algoritma (*Gradient Descent* pada Machine Learning), deteksi tepi pada pengolahan citra (*Image Processing*).
* **Integral**:
  * *Integral Tak Tentu*: Kebalikan dari turunan (antiturunan).
  * *Integral Tentu*: Menghitung luas daerah di bawah kurva.
  * *Aplikasi di TI*: Pemodelan statistik, perhitungan akumulasi trafik data jaringan.

---

### 3. Logika Informatika
* **Konsep Utama**: Dasar penalaran matematis dan pemrosesan instruksi boolean pada komputer.
* **Logika Proposisi**:
  * Negasi ($\neg$), Konjungsi ($\land$), Disjungsi ($\lor$), Implikasi ($\rightarrow$), Biimplikasi ($\leftrightarrow$).
  * *Tabel Kebenaran*: Pemetaan kombinasi nilai kebenaran input (True/False).
  * *Hukum-hukum Logika*: Hukum De Morgan, Distributif, Komutatif, Asosiatif, Idempoten.
* **Gerbang Logika (Logic Gates)**: `AND`, `OR`, `NOT`, `NAND`, `NOR`, `XOR`, `XNOR`.
* **Logika Predikat & Kuantor**:
  * *Kuantor Universal* ($\forall$ - "Untuk semua"): Menyatakan seluruh elemen himpunan memenuhi kondisi.
  * *Kuantor Eksistensial* ($\exists$ - "Ada/Terdapat"): Menyatakan minimal satu elemen memenuhi kondisi.
* **Induksi Matematika**: Metode pembuktian formal untuk pembuktian rumus perulangan dan struktur diskrit.

---

### 4. Struktur Data
* **Konsep Utama**: Cara mengorganisasi, mengelola, dan menyimpan data di memori agar dapat diakses dan dimanipulasi secara efisien.
* **Struktur Data Linear**:
  * **Array**: Urutan elemen dengan lokasi memori berdampingan (akses acak berbasis indeks).
  * **Linked List**: Elemen (node) terhubung melalui pointer (Singly, Doubly, Circular Linked List).
  * **Stack (Tumpukan)**: Prinsip **LIFO** (*Last In First Out*). Operasi: `push()`, `pop()`, `peek()`.
  * **Queue (Antrean)**: Prinsip **FIFO** (*First In First Out*). Operasi: `enqueue()`, `dequeue()`.
* **Struktur Data Non-Linear**:
  * **Tree (Pohon)**: Struktur hierarkis bertingkat (Root, Parent, Child, Leaf). Contoh: *Binary Search Tree (BST)*, *AVL Tree*.
  * **Graph**: Kumpulan simpul (Vertex) dan jalur (Edge). Digunakan untuk pemodelan jaringan/peta. Algoritma pencarian: *Breadth-First Search (BFS)*, *Depth-First Search (DFS)*.
* **Hash Table**: Pasangan Key-Value berbasis fungsi Hash untuk pencarian super cepat ($O(1)$). Penanganan *collision*: *Chaining*, *Open Addressing*.

---

### 5. Basis Data
* **Konsep Utama**: Pengelolaan data terstruktur yang disimpan secara permanen pada media penyimpanan.
* **Model Data Relasional**: Data disimpan dalam bentuk Tabel (Relasi) yang terdiri dari Baris (Tuple) dan Kolom (Atribut).
* **Prinsip Transaksi (ACID)**:
  * **Atomicity**: Transaksi harus sukses seluruhnya atau batal seluruhnya (Rollback).
  * **Consistency**: Data harus selalu valid sesuai batasan (Constraint).
  * **Isolation**: Transaksi yang berjalan bersamaan tidak boleh saling mengganggu.
  * **Durability**: Data yang telah di-commit tersimpan permanen walau sistem *crash*.
* **Normalisasi Data**: Proses menghilangkan redundansi dan anomali data (1NF, 2NF, 3NF, BCNF).
* **SQL (Structured Query Language)**:
  * **DDL** (*Data Definition Language*): `CREATE`, `ALTER`, `DROP`.
  * **DML** (*Data Manipulation Language*): `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
  * **DCL** (*Data Control Language*): `GRANT`, `REVOKE`.

---

### 6. Pemrograman Web Dasar
* **HTML5**: Bahasa markah untuk membangun struktur halaman web bermakna semantik (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
* **CSS3**: Bahasa tata letak dan penataan gaya visual:
  * *Flexbox*: Tata letak 1 dimensi (penataan per baris/kolom).
  * *CSS Grid*: Tata letak 2 dimensi (baris dan kolom simultan).
  * *Responsive Web Design*: Penggunaan Media Queries (`@media`) untuk menyesuaikan tampilan HP, Tablet, dan Desktop.
* **JavaScript Dasar (ES6+)**:
  * Manipulasi DOM (Document Object Model): Mengubah isi dan style elemen secara dinamis.
  * Penanganan Event: `addEventListener('click', ...)`
  * Komunikasi Asinkron: `Promise`, `async/await`, dan `Fetch API`.

---

### 7. Matematika Diskrit
* **Himpunan & Operasi**: Irisan ($\cap$), Gabungan ($\cup$), Selisih ($-$), Komplemen ($A^c$), Himpunan Kuasa.
* **Relasi & Fungsi**: Relasi Refleksif, Simetris, Transitif, Sifat Fungsi (Injektif, Surjektif, Bijektif).
* **Kombinatorika**:
  * *Permutasi*: Memperhatikan urutan urutan $P(n, r) = \frac{n!}{(n-r)!}$
  * *Kombinasi*: Tidak memperhatikan urutan $C(n, r) = \frac{n!}{r!(n-r)!}$
* **Teori Graf**: Graf Terhubung, Pewarnaan Graf, Lintasan Euler, Lintasan Hamilton, Tree Traversal.

---

### 8. Pemrograman Berorientasi Objek (PBO)
* **Konsep Utama**: Paradigma pemrograman berpatokan pada *Object* yang merepresentasikan entitas nyata.
* **4 Pilar Utama PBO**:
  1. **Encapsulation**: Pembungkusan data menggunakan hak akses (`private`, `protected`, `public`) dan getter/setter.
  2. **Inheritance**: Pewarisan kelas turunan (Subclass) dari kelas induk (Superclass).
  3. **Polymorphism**:
     * *Overloading*: Nama method sama, beda parameter (Compile-time).
     * *Overriding*: Method pada subclass menggantikan implikasi induk (Runtime).
  4. **Abstraction**: Penyembunyian detail implementasi rumit menggunakan *Abstract Class* & *Interface*.
* **Design Patterns**: *Singleton*, *Factory Method*, *Observer Pattern*, *Model-View-Controller (MVC)*.

---

### 9. Jaringan Komputer
* **Model Layer Jaringan**:
  * **OSI 7 Layer**: Physical, Data Link, Network, Transport, Session, Presentation, Application.
  * **TCP/IP 4 Layer**: Network Access, Internet, Transport, Application.
* **Pengalamatan IP (IPv4)**:
  * Subnetting (CIDR Notation): Menghitung Network ID, Broadcast ID, Host Range, Subnet Mask.
* **Protokol Utama**:
  * HTTP / HTTPS (Port 80 / 443).
  * DNS (Domain Name System - Port 53).
  * DHCP (Dynamic Host Configuration Protocol).
  * TCP (Reliable, Connection-oriented) vs UDP (Fast, Connectionless).

---

### 10. Analisis & Perancangan Sistem (APS)
* **SDLC (Software Development Life Cycle)**:
  * *Waterfall*: Sekuensial bertahap (Persyaratan -> Desain -> Impl -> Pengujian -> Maintenance).
  * *Agile / Scrum*: Pengembangan iteratif cepat melalui *Sprint*, *Daily Standup*, *Backlog*.
* **Analisis Kebutuhan**:
  * Kebutuhan Fungsional (Perilaku/fitur yang disediakan sistem).
  * Kebutuhan Non-Fungsional (Kecepatan, Keamanan, Usability, Reliabilitas).
* **Pemodelan UML (Unified Modeling Language)**:
  * **Use Case Diagram**: Aktor dan fungsionalitas utama.
  * **Activity Diagram**: Alur kerja proses bisnis.
  * **Class Diagram**: Struktur kelas, atribut, metode, dan keterkaitan antar kelas.
  * **Sequence Diagram**: Interaksi pesan antar objek berdasarkan urutan waktu.

---

### 11. Sistem Operasi
* **Peran Sistem Operasi**: Perantara antara hardware komputer dengan pengguna/aplikasi software.
* **Manajemen Proses**:
  * Status Proses: *New*, *Ready*, *Running*, *Waiting*, *Terminated*.
  * Algoritma Penjadwalan CPU: FCFS, SJF, Round Robin (RR), Priority Scheduling.
* **Manajemen Memori**:
  * Virtual Memory, Paging, Segmentation, Algoritma Page Replacement (LRU, FIFO).
* **Deadlock**: Kondisi saling mengunci antar proses. Syarat Deadlock: *Mutual Exclusion*, *Hold and Wait*, *No Preemption*, *Circular Wait*.

---

### 12. Pemrograman Web Lanjutan
* **Arsitektur Web Modern**:
  * Single Page Application (SPA), Server-Side Rendering (SSR), Static Site Generation (SSG).
  * Framework Modern: Next.js, React, Vue.js, Svelte.
* **Backend & API Integrasi**:
  * Arsitektur RESTful API & GraphQL.
  * Otentikasi & Otorisasi: JWT (JSON Web Token), OAuth2, WebAuthn/Passkey.
* **Manajemen Status & Database**:
  * ORM (Object-Relational Mapping): Prisma, TypeORM, Drizzle.
  * State Management: Zustand, Redux Toolkit, React Context.

---

### 13. Enterprise Resource Planning (ERP)
* **Konsep Utama**: Sistem informasi terpadu yang mengintegrasikan seluruh operasional dan sumber daya perusahaan ke dalam satu basis data terpusat.
* **Modul Utama ERP**:
  * Finance & Accounting (Keuangan).
  * Human Capital Management / HR (Sumber Daya Manusia).
  * Supply Chain Management / SCM (Rantai Pasok & Logistik).
  * Customer Relationship Management / CRM (Manajemen Pelanggan).
* **Sistem ERP Populer**: Odoo, SAP, Oracle NetSuite.
* **Manfaat & Tantangan**: Efisiensi proses bisnis vs Biaya implementasi & penyesuaian budaya organisasi.

---

### 14. Rekayasa Perangkat Lunak (RPL)
* **Prinsip Clean Code**: Kode yang mudah dibaca, mudah dirawat, dan teruji secara otomatis.
* **Prinsip S.O.L.I.D**:
  1. *Single Responsibility Principle*: Satu kelas hanya memiliki satu alasan untuk berubah.
  2. *Open/Closed Principle*: Terbuka untuk perluasan, tertutup untuk modifikasi.
  3. *Liskov Substitution Principle*: Subclass harus dapat menggantikan Superclass tanpa membuat program error.
  4. *Interface Segregation Principle*: Interface kecil dan spesifik lebih baik daripada interface raksasa.
  5. *Dependency Inversion Principle*: Ketergantungan harus pada abstraksi, bukan konpresi.
* **Pengujian Software**:
  * **Black-box Testing**: Menguji masukan dan luaran tanpa melihat internal kode.
  * **White-box Testing**: Menguji struktur logika internal kode (*Unit Test*, *Code Coverage*).

---

### 15. Data Warehouse & Business Intelligence
* **OLTP vs OLAP**:
  * **OLTP** (*Online Transaction Processing*): Pemrosesan transaksi harian (Cepat, Normalisasi tinggi, Read/Write seimbang).
  * **OLAP** (*Online Analytical Processing*): Analisis keputusan bisnis (Query kompleks, Data historis besar, Read-heavy).
* **Proses ETL (Extract, Transform, Load)**:
  * *Extract*: Mengambil data dari berbagai sumber operasional.
  * *Transform*: Pembersihan, validasi, dan penyelarasan format data.
  * *Load*: Memasukkan data ke Data Warehouse.
* **Skema Pemodelan Data**:
  * Skema Bintang (*Star Schema*): Tabel Dimensi langsung terhubung ke Tabel Fakta.
  * Skema Salju (*Snowflake Schema*): Tabel Dimensi dinormalisasi lebih lanjut.

---

### 16. Desain UI/UX
* **Definisi**:
  * **UX (User Experience)**: Persepsi dan kemudahan pengguna saat menggunakan produk.
  * **UI (User Interface)**: Elemen visual interaktif (warna, skema layout, pola tombol, tipografi).
* **Metode Design Thinking**:
  1. *Empathize*: Memahami kendala pengguna.
  2. *Define*: Menentukan inti permasalahan.
  3. *Ideate*: Mencari solusi kreatif.
  4. *Prototype*: Membuat contoh rancangan visual interaktif.
  5. *Test*: Menguji ke calon pengguna.
* **Prinsip Heuristik Nielsen**: Feedback status sistem, pencegahan kesalahan (*error prevention*), konsistensi standar, fleksibilitas penggunaan.

---

### 17. Manajemen Proyek TI
* **PMBOK (Project Management Body of Knowledge)**:
  * 5 Kelompok Proses: Initiating, Planning, Executing, Monitoring & Controlling, Closing.
  * Batasan Proyek (*Triple Constraint*): Scope (Cakupan), Time (Waktu), Cost (Biaya).
* **Alat & Manajemen Visual**:
  * **WBS (Work Breakdown Structure)**: Pemecahan proyek menjadi tugas-tugas kecil yang terukur.
  * **Gantt Chart**: Visualisasi linimasa pengerjaan proyek.
  * **CPM (Critical Path Method)**: Jalur aktivitas kritis yang menentukan durasi tercepat penyelesaian proyek.

---

### 18. Keamanan Sistem Informasi
* **Trilogi Keamanan (CIA Triad)**:
  * **Confidentiality**: Menjaga kerahasiaan data (e.g., Enkripsi AES, RSA).
  * **Integrity**: Menjaga keaslian data dari perubahan tanpa izin (e.g., Hash SHA-256, Checksum).
  * **Availability**: Menjaga sistem tetap beroperasi saat dibutuhkan (e.g., Mitigasi DDoS, Redundansi server).
* **OWASP Top 10**: Kerentanan web paling berbahaya (Broken Access Control, Cryptographic Failures, Injection, XSS, SSRF).
* **Manajemen Risiko & Standar**: Implementasi ISO/IEC 27001, Kebijakan Password, Autentikasi Multifaktor (MFA).

---
*Dokumen ini dibuat otomatis sebagai rangkuman komprehensif kurikulum Program Studi Sistem Informasi.*
