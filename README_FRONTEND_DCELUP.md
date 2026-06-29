# D'Celup Sempol Ayam — Frontend Vue.js

Frontend ini dibuat sesuai `PROMPT IMPLEMENTASI FRONTEND — D'Celup Sempol Ayam` dan Backend Laravel `/api/v1` yang sudah berjalan.

## Stack

- Vue 3 + Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS dengan token warna `dcelup.*`
- Day.js
- Lucide Vue Icons
- Chart.js + vue-chartjs

## Cara Menjalankan

```bash
cd dcelup-frontend
npm install
npm run dev
```

Saat mode dummy aktif, backend Laravel tidak perlu berjalan. Jika ingin kembali memakai backend, ubah `VITE_USE_MOCK_API=false` lalu pastikan backend tersedia di:

```text
http://127.0.0.1:8000
```

File `.env` default:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Saat `VITE_USE_MOCK_API=true`, seluruh request memakai data dummy lokal dari `src/api/mockBackend.js` dan tidak memanggil backend Laravel.

## Login Admin Default

```json
{
  "login": "admin",
  "password": "password123"
}
```

## Modul yang Sudah Disiapkan

- Auth flow + route guard
- Dashboard admin/kasir
- Kasir/POS mobile-first dengan cart store
- Product & product variants
- Transaction history + cancel modal
- Raw materials + stock movements
- Expenses + categories
- Reports PDF/Excel download
- User management
- Activity logs

## Business Rules yang Dikunci

- Transaksi tidak mengurangi stok otomatis.
- Tidak ada BOM/resep di MVP.
- Label keuangan memakai `Estimasi Selisih Kas`.
- Tidak ada hard delete di UI, hanya deactivate/nonaktifkan.
- `auto_stock` expense read-only.
- Frontend tidak mengirim `user_id`, `trx_date`, atau `unit_price` untuk transaksi.

## Catatan Engineering

Beberapa view CRUD dibuat sebagai implementasi operasional dasar agar cepat terhubung ke backend. Polishing lanjutan bisa dilakukan setelah UAT kasir dan admin.

## Catatan Payload Transaksi

Backend aktif menggunakan `items[].variant_id` untuk POST transaksi. Store tetap menyimpan `product_variant_id` secara internal di cart, lalu dipetakan menjadi `variant_id` saat `buildTransactionPayload()`.
