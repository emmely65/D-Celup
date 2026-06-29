# PROMPT IMPLEMENTASI FRONTEND — D'Celup Sempol Ayam

> **Untuk:** AI Coding Assistant / Developer Vue.js  
> **Basis:** Frontend Specification D'Celup Sempol Ayam v1.0 Final Clean  
> **Fokus:** State Management (Pinia), Route Guard, dan UX Kasir  
> **Stack:** Vue.js 3 + Vite + Vue Router + Pinia + Axios + Tailwind CSS

---

## KONTEKS PROYEK

Kamu adalah developer Vue.js 3 yang membangun aplikasi web manajemen untuk usaha kuliner kecil bernama **D'Celup Sempol Ayam**. Aplikasi ini dipakai oleh dua jenis pengguna:

- **Admin** — pemilik usaha, akses penuh ke semua modul
- **Kasir** — staf counter, hanya akses transaksi dan lihat stok

Backend sudah tersedia sebagai REST API Laravel 11 di `/api/v1` dengan autentikasi Laravel Sanctum token-based (Bearer Token).

### Aturan bisnis yang TIDAK boleh dilanggar frontend:

1. Transaksi penjualan **tidak mengurangi stok bahan** — stok dikelola manual admin
2. Tidak ada fitur BOM/resep produk di MVP ini
3. Semua label keuangan wajib pakai **"Estimasi Selisih Kas"** — dilarang menulis "Laba Bersih", "Net Profit", atau "Profit Bersih"
4. Tidak ada tombol **hard delete** untuk data master di UI; hanya nonaktifkan/deactivate
5. Expense dengan `source_type = auto_stock` tampil **read-only**, tidak bisa diedit
6. Batas waktu pembatalan transaksi kasir adalah **1 jam dari `created_at` server** — frontend hanya tampilkan tombol conditional, backend yang validasi final
7. Jangan kirim `user_id` dari form manapun — backend pakai user yang sedang login
8. Jangan kirim `trx_date` dari form transaksi — backend yang set waktu server

---

## BAGIAN 1 — SETUP AWAL PROJECT

Buat project baru dengan perintah berikut:

```bash
npm create vite@latest dcelup-frontend -- --template vue
cd dcelup-frontend
npm install
npm install vue-router pinia axios dayjs
npm install lucide-vue-next
npm install chart.js vue-chartjs
npm install -D tailwindcss @tailwindcss/vite
```

### File `.env`

```env
VITE_APP_NAME="D'Celup Sempol Ayam"
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_STORAGE_BASE_URL=http://127.0.0.1:8000/storage
```

### `tailwind.config.js` — Token Warna Brand

Wajib extend dengan token warna D'Celup agar tidak memakai warna Tailwind default secara langsung:

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        dcelup: {
          red:       '#C61F1F',  // identitas utama, tombol, sidebar active
          redDark:   '#9F1414',  // hover / active state
          redSoft:   '#E35A4A',  // aksen ringan, item terpilih
          cream:     '#F6E8D2',  // background halaman
          creamSoft: '#FFF8EE',  // card / modal / table area
          yellow:    '#F4B61C',  // badge harga, accent
          text:      '#40251A',  // teks utama
          textSoft:  '#7A5B4A',  // teks sekunder / hint
          border:    '#E8D6BB',  // border card, input, table
        }
      },
      borderRadius: {
        xl2: '1rem',
      }
    }
  }
}
```

### Aturan warna wajib:

| Area | Warna |
|---|---|
| Background halaman | `dcelup-cream` |
| Card / Modal / Table | `dcelup-creamSoft` atau putih |
| Sidebar & Topbar | `dcelup-red` |
| Button primary | `dcelup-red` teks putih |
| Button primary hover | `dcelup-redDark` |
| Button secondary | border `dcelup-red`, teks `dcelup-red`, bg `dcelup-creamSoft` |
| Badge harga / angka penting | `dcelup-yellow` |
| Status sukses (paid, stok aman) | `#16A34A` (green-600) |
| Status warning (stok menipis) | `#F59E0B` (amber-500) |
| Status danger (canceled, error) | `#DC2626` (red-600) |

---

## BAGIAN 2 — HTTP CLIENT (`src/api/http.js`)

Buat satu instance Axios dengan interceptor untuk token dan error global.

```js
// src/api/http.js
import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Request interceptor — tambah token otomatis
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 global
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default http
```

**Aturan penting:**
- Semua request API wajib memakai instance `http` ini, bukan `axios` langsung
- Untuk download PDF/Excel, tambahkan `responseType: 'blob'` di config request
- Jangan membuat instance Axios baru di tempat lain

---

## BAGIAN 3 — STATE MANAGEMENT PINIA

Buat 4 store berikut. Masing-masing harus berada di file terpisah.

---

### 3.1 `src/stores/authStore.js`

Store ini mengelola autentikasi dan data user yang sedang login.

```js
// src/stores/authStore.js
import { defineStore } from 'pinia'
import { authApi } from '@/api/authApi'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isKasir: (state) => state.user?.role === 'kasir',
    userRole: (state) => state.user?.role ?? null,
    userName: (state) => state.user?.name ?? ''
  },

  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('auth_token', token)
    },

    setUser(user) {
      this.user = user
      this.isAuthenticated = true
      localStorage.setItem('auth_user', JSON.stringify(user))
    },

    clearAuth() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    },

    async login(payload) {
      // payload: { login: 'admin_atau_email', password: '...' }
      this.isLoading = true
      try {
        const response = await authApi.login(payload)
        const { token, user } = response.data.data
        this.setToken(token)
        this.setUser(user)
        return { success: true }
      } catch (error) {
        return { success: false, message: error.response?.data?.message ?? 'Login gagal' }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await authApi.logout()
      } catch (_) {
        // tetap hapus lokal meski API logout gagal
      } finally {
        this.clearAuth()
      }
    },

    async fetchMe() {
      // Dipanggil saat app pertama kali dibuka untuk validasi token
      const savedToken = localStorage.getItem('auth_token')
      if (!savedToken) return false

      this.token = savedToken
      try {
        const response = await authApi.getMe()
        this.setUser(response.data.data)
        return true
      } catch (_) {
        this.clearAuth()
        return false
      }
    }
  }
})
```

**Aturan authStore:**
- Token disimpan di `localStorage` dengan key `auth_token`
- User disimpan di `localStorage` dengan key `auth_user` (sebagai JSON)
- Getter `isAdmin` dan `isKasir` dipakai di guard dan komponen untuk menyembunyikan menu
- `fetchMe()` selalu dipanggil dari `App.vue` saat pertama mount — ini mencegah user ter-logout saat reload halaman
- Jangan pernah expose atau log password dari response

---

### 3.2 `src/stores/cartStore.js`

Store ini mengelola keranjang belanja di halaman kasir.

```js
// src/stores/cartStore.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],           // array item yang ditambahkan ke cart
    customerName: '',    // nama pelanggan (opsional, default 'Pembeli Umum')
    paymentMethod: 'cash',  // 'cash' | 'transfer' | 'qris'
    paidAmount: 0        // nominal yang dibayarkan pelanggan
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),

    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.subtotal, 0),

    isEmpty: (state) => state.items.length === 0,

    changeAmount: (state) => {
      const total = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      return Math.max(0, state.paidAmount - total)
    }
  },

  actions: {
    addItem(variant) {
      // variant shape dari API product-variants:
      // { id, product_id, sauce_name, type, price, qty_per_pack, product: { name } }
      const existing = this.items.find(i => i.product_variant_id === variant.id)
      if (existing) {
        existing.qty += 1
        existing.subtotal = existing.qty * existing.price
      } else {
        this.items.push({
          product_variant_id: variant.id,
          product_name: variant.product?.name ?? '',
          sauce_name: variant.sauce_name,
          type: variant.type,
          price: Number(variant.price),
          qty: 1,
          subtotal: Number(variant.price)
        })
      }
    },

    increaseQty(productVariantId) {
      const item = this.items.find(i => i.product_variant_id === productVariantId)
      if (item) {
        item.qty += 1
        item.subtotal = item.qty * item.price
      }
    },

    decreaseQty(productVariantId) {
      const index = this.items.findIndex(i => i.product_variant_id === productVariantId)
      if (index === -1) return
      if (this.items[index].qty <= 1) {
        this.items.splice(index, 1)
      } else {
        this.items[index].qty -= 1
        this.items[index].subtotal = this.items[index].qty * this.items[index].price
      }
    },

    removeItem(productVariantId) {
      this.items = this.items.filter(i => i.product_variant_id !== productVariantId)
    },

    setPayment(payload) {
      // payload: { customerName?, paymentMethod, paidAmount }
      if (payload.customerName !== undefined) this.customerName = payload.customerName
      if (payload.paymentMethod) this.paymentMethod = payload.paymentMethod
      if (payload.paidAmount !== undefined) this.paidAmount = Number(payload.paidAmount)
    },

    clearCart() {
      this.items = []
      this.customerName = ''
      this.paymentMethod = 'cash'
      this.paidAmount = 0
    },

    // Bangun payload untuk POST /api/v1/transactions
    buildTransactionPayload() {
      return {
        customer_name: this.customerName || 'Pembeli Umum',
        payment_method: this.paymentMethod,
        paid_amount: this.paidAmount,
        // JANGAN kirim trx_date — backend set dari waktu server
        items: this.items.map(item => ({
          product_variant_id: item.product_variant_id,
          qty: item.qty
          // JANGAN kirim unit_price — backend ambil dari database
        }))
      }
    }
  }
})
```

**Aturan cartStore:**
- `price` dan `subtotal` di cart hanya untuk tampilan estimasi di UI — backend yang menghitung nilai final
- Jangan pernah kirim `unit_price` ke endpoint transaksi
- `buildTransactionPayload()` adalah satu-satunya cara membangun payload transaksi — tidak boleh ada pembangunan payload transaksi di luar method ini
- Setelah transaksi berhasil, selalu panggil `clearCart()`
- Cart tidak perlu di-persist ke `localStorage` — jika halaman di-reload, cart kosong adalah perilaku yang benar

---

### 3.3 `src/stores/dashboardStore.js`

Store ini menyimpan data dashboard agar tidak terjadi fetch berulang saat user berpindah tab.

```js
// src/stores/dashboardStore.js
import { defineStore } from 'pinia'
import { dashboardApi } from '@/api/dashboardApi'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    adminSummary: null,      // data KPI admin: pemasukan, pengeluaran, selisih kas
    cashierSummary: null,    // data KPI kasir: transaksi hari ini
    weeklySales: [],         // data grafik 7 hari terakhir
    topProducts: [],         // top 5 produk terlaris
    lowStockMaterials: [],   // bahan baku di bawah minimum stok
    isLoading: false
  }),

  getters: {
    hasLowStock: (state) => state.lowStockMaterials.length > 0,
    lowStockCount: (state) => state.lowStockMaterials.length
  },

  actions: {
    async fetchAdminSummary() {
      // Hanya dipanggil jika role = admin
      try {
        const res = await dashboardApi.getAdminSummary()
        this.adminSummary = res.data.data
      } catch (_) { /* silent fail — dashboard boleh partial */ }
    },

    async fetchCashierSummary() {
      // Hanya dipanggil jika role = kasir
      try {
        const res = await dashboardApi.getCashierSummary()
        this.cashierSummary = res.data.data
      } catch (_) { }
    },

    async fetchWeeklySales(params = {}) {
      try {
        const res = await dashboardApi.getWeeklySales(params)
        this.weeklySales = res.data.data
      } catch (_) { }
    },

    async fetchTopProducts(params = {}) {
      try {
        const res = await dashboardApi.getTopProducts(params)
        this.topProducts = res.data.data
      } catch (_) { }
    },

    async fetchLowStockMaterials() {
      try {
        const res = await dashboardApi.getLowStockMaterials()
        this.lowStockMaterials = res.data.data
      } catch (_) { }
    },

    async fetchAdminDashboard() {
      // Shortcut: fetch semua data dashboard admin sekaligus
      this.isLoading = true
      await Promise.allSettled([
        this.fetchAdminSummary(),
        this.fetchWeeklySales(),
        this.fetchTopProducts(),
        this.fetchLowStockMaterials()
      ])
      this.isLoading = false
    },

    async fetchCashierDashboard() {
      // Shortcut: fetch semua data dashboard kasir
      this.isLoading = true
      await Promise.allSettled([
        this.fetchCashierSummary(),
        this.fetchLowStockMaterials()
      ])
      this.isLoading = false
    },

    clearDashboard() {
      this.adminSummary = null
      this.cashierSummary = null
      this.weeklySales = []
      this.topProducts = []
      this.lowStockMaterials = []
    }
  }
})
```

**Aturan dashboardStore:**
- `adminSummary` hanya boleh di-fetch jika user adalah admin
- `cashierSummary` hanya boleh di-fetch jika user adalah kasir
- Jangan polling otomatis lebih sering dari 5 menit — ini shared hosting
- Sediakan tombol refresh manual di UI dashboard agar user bisa memperbarui data kapan saja
- Gunakan `Promise.allSettled` bukan `Promise.all` agar satu fetch gagal tidak menghentikan yang lain

---

### 3.4 `src/stores/uiStore.js`

Store untuk state UI global: sidebar, loading, dan toast notification.

```js
// src/stores/uiStore.js
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    globalLoading: false,
    toastQueue: []
  }),

  actions: {
    openSidebar()  { this.sidebarOpen = true },
    closeSidebar() { this.sidebarOpen = false },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },

    showToast(type, message) {
      // type: 'success' | 'error' | 'warning' | 'info'
      const id = Date.now()
      this.toastQueue.push({ id, type, message })
      setTimeout(() => {
        this.toastQueue = this.toastQueue.filter(t => t.id !== id)
      }, 4000)
    },

    showConfirm(options) {
      // options: { title, message, confirmLabel, onConfirm }
      // Implementasi: emit ke komponen ConfirmDialog.vue via event bus atau state
      return options
    },

    setGlobalLoading(val) { this.globalLoading = val }
  }
})
```

---

## BAGIAN 4 — ROUTE GUARD (`src/router/`)

### 4.1 Definisi Route (`src/router/index.js`)

Setiap route wajib memiliki `meta.requiresAuth` dan `meta.roles` jika ada pembatasan role.

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guards'

// Lazy load semua view untuk performa
const LoginView              = () => import('@/views/auth/LoginView.vue')
const DashboardView          = () => import('@/views/dashboard/DashboardView.vue')
const CashierView            = () => import('@/views/transactions/CashierView.vue')
const TransactionHistoryView = () => import('@/views/transactions/TransactionHistoryView.vue')
const TransactionDetailView  = () => import('@/views/transactions/TransactionDetailView.vue')
const ProductListView        = () => import('@/views/products/ProductListView.vue')
const ProductVariantListView = () => import('@/views/products/ProductVariantListView.vue')
const RawMaterialListView    = () => import('@/views/stocks/RawMaterialListView.vue')
const StockInView            = () => import('@/views/stocks/StockInView.vue')
const StockOutView           = () => import('@/views/stocks/StockOutView.vue')
const StockAdjustmentView    = () => import('@/views/stocks/StockAdjustmentView.vue')
const StockMovementHistoryView = () => import('@/views/stocks/StockMovementHistoryView.vue')
const ExpenseListView        = () => import('@/views/finance/ExpenseListView.vue')
const ExpenseCategoryView    = () => import('@/views/finance/ExpenseCategoryView.vue')
const ReportView             = () => import('@/views/reports/ReportView.vue')
const UserManagementView     = () => import('@/views/users/UserManagementView.vue')
const ActivityLogView        = () => import('@/views/activity-logs/ActivityLogView.vue')
const ForbiddenView          = () => import('@/views/errors/ForbiddenView.vue')
const NotFoundView           = () => import('@/views/errors/NotFoundView.vue')

const routes = [
  // ── PUBLIC ──────────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: ForbiddenView,
    meta: { requiresAuth: false }
  },

  // ── ADMIN & KASIR ────────────────────────────────────────────────────
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['admin', 'kasir'] }
  },
  {
    path: '/cashier',
    name: 'cashier',
    component: CashierView,
    meta: { requiresAuth: true, roles: ['admin', 'kasir'] }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionHistoryView,
    meta: { requiresAuth: true, roles: ['admin', 'kasir'] }
  },
  {
    path: '/transactions/:id',
    name: 'transaction-detail',
    component: TransactionDetailView,
    meta: { requiresAuth: true, roles: ['admin', 'kasir'] }
  },
  {
    path: '/raw-materials',
    name: 'raw-materials',
    component: RawMaterialListView,
    meta: { requiresAuth: true, roles: ['admin', 'kasir'] }
  },
  {
    path: '/stock/movements',
    name: 'stock-movements',
    component: StockMovementHistoryView,
    meta: { requiresAuth: true, roles: ['admin', 'kasir'] }
  },

  // ── ADMIN ONLY ────────────────────────────────────────────────────────
  {
    path: '/products',
    name: 'products',
    component: ProductListView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/product-variants',
    name: 'product-variants',
    component: ProductVariantListView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/stock/in',
    name: 'stock-in',
    component: StockInView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/stock/out',
    name: 'stock-out',
    component: StockOutView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/stock/adjustment',
    name: 'stock-adjustment',
    component: StockAdjustmentView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpenseListView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/expense-categories',
    name: 'expense-categories',
    component: ExpenseCategoryView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/users',
    name: 'users',
    component: UserManagementView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/activity-logs',
    name: 'activity-logs',
    component: ActivityLogView,
    meta: { requiresAuth: true, roles: ['admin'] }
  },

  // ── REDIRECT & CATCH-ALL ──────────────────────────────────────────────
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupGuards(router)

export default router
```

---

### 4.2 Guard Logic (`src/router/guards.js`)

Guard ini menangani 4 skenario secara berurutan.

```js
// src/router/guards.js
import { useAuthStore } from '@/stores/authStore'

export function setupGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    const requiresAuth = to.meta.requiresAuth !== false
    const allowedRoles = to.meta.roles ?? []

    // ── SKENARIO 1 ──────────────────────────────────────────────────────
    // Route public + user sudah login → redirect ke dashboard
    if (!requiresAuth && authStore.isAuthenticated) {
      return next({ name: 'dashboard' })
    }

    // ── SKENARIO 2 ──────────────────────────────────────────────────────
    // Route public + user belum login → biarkan lewat
    if (!requiresAuth) {
      return next()
    }

    // ── SKENARIO 3 ──────────────────────────────────────────────────────
    // Route protected + belum ada token → coba fetchMe dulu
    if (!authStore.isAuthenticated) {
      const valid = await authStore.fetchMe()
      if (!valid) {
        return next({ name: 'login' })
      }
    }

    // ── SKENARIO 4 ──────────────────────────────────────────────────────
    // Sudah login, cek role
    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.userRole)) {
      return next({ name: 'forbidden' })
    }

    // ── LOLOS SEMUA ──────────────────────────────────────────────────────
    return next()
  })
}
```

**Aturan guard:**
- Guard memanggil `fetchMe()` hanya sekali saat token ada tapi state belum terisi — setelah itu `isAuthenticated` sudah `true` dan tidak perlu panggil API lagi
- Frontend menyembunyikan menu berdasarkan role hanya untuk UX — backend tetap validasi final lewat middleware `role:admin`
- Jika kasir mengetik URL admin secara manual (misal `/reports`), guard redirect ke `/403`
- Jangan pernah melewati guard untuk alasan apapun kecuali 4 skenario di atas

---

## BAGIAN 5 — UX KASIR (`CashierView`)

Halaman ini adalah halaman paling penting. Target: kasir bisa menyelesaikan satu transaksi dalam **< 30 detik**.

### 5.1 Struktur Layout Mobile (`src/views/transactions/CashierView.vue`)

```
┌─────────────────────────────────────┐
│  [Search/Filter Varian]             │  ← input search sederhana, debounce 300ms
├─────────────────────────────────────┤
│                                     │
│  [Card] [Card] [Card]               │  ← Grid 2 kolom di mobile, 3-4 di desktop
│  [Card] [Card] [Card]               │  ← ProductVariantCard per item menu
│  [Card] [Card] [Card]               │
│                                     │
├─────────────────────────────────────┤
│  [🛒 3 item · Rp18.000  ▲ BAYAR]   │  ← Floating bar bawah — selalu terlihat
└─────────────────────────────────────┘
                  ↓ tap BAYAR
┌─────────────────────────────────────┐
│  Bottom Sheet / Modal               │
│  ─────────────────────────────────  │
│  Sempol BBQ Spicy Original   x2     │
│  Sempol Teriyaki Crispy      x1     │
│  ─────────────────────────────────  │
│  Total Estimasi:    Rp 18.000       │
│  Metode Bayar:   [Cash▼] [Tf] [QR] │
│  Bayar:          [_______18000____] │
│  Kembalian:         Rp 0            │
│  ─────────────────────────────────  │
│  [     SIMPAN TRANSAKSI      ]      │  ← brand-red, full width, prominent
└─────────────────────────────────────┘
```

### 5.2 Komponen `ProductVariantCard.vue`

Card harus menampilkan informasi ini dengan **jelas dan besar**:

```
┌──────────────────────┐
│  Sempol Original     │  ← product_name, font-semibold
│  BBQ Spicy           │  ← sauce_name, text-dcelup-red
│  Original · 4 pcs   │  ← type label · qty_per_pack
│                      │
│  Rp 6.000            │  ← harga, badge kuning atau teks bold merah
│                      │
│  [  − 1 +  ]         │  ← jika sudah ada di cart: tampil qty counter
│  [  Tambah  ]        │  ← jika belum di cart: tombol merah penuh
└──────────────────────┘
```

Logika tombol:
- Jika `productVariantId` **tidak ada** di `cartStore.items` → tampilkan tombol `[Tambah]` merah
- Jika **sudah ada** di cart → tampilkan counter `[ − qty + ]` dengan tombol merah
- Tap `+` → `cartStore.increaseQty(id)`
- Tap `−` → `cartStore.decreaseQty(id)` (jika qty = 1 dan di-tap −, item dihapus dari cart)

### 5.3 Flow Submit Transaksi

```
1. User tap "SIMPAN TRANSAKSI"
2. Validasi frontend (sebelum API dipanggil):
   - cart tidak kosong (items.length > 0)
   - paymentMethod terpilih
   - paidAmount >= totalAmount estimasi
3. Tampilkan loading state pada tombol (disabled + spinner)
4. Panggil cartStore.buildTransactionPayload()
5. POST ke /api/v1/transactions
6. Jika 201 success:
   a. Tampilkan toast sukses: "Transaksi berhasil disimpan"
   b. Tutup bottom sheet / modal
   c. cartStore.clearCart()
   d. Tampilkan ringkasan transaksi (kode trx, total, kembalian)
   e. Sediakan tombol "Transaksi Baru" yang menonjol
7. Jika error:
   a. Tampilkan pesan error dari response.data.message
   b. Kembalikan tombol ke state aktif
   c. JANGAN clearCart() — biarkan kasir bisa coba lagi
```

### 5.4 UX Rules Kasir Wajib Diikuti

```
1. Tombol "Tambah" dan counter qty harus minimal 44px tinggi — mudah ditekan jari
2. Floating cart bar di bawah selalu visible saat ada item di cart
3. Total estimasi selalu update real-time saat item ditambah/dikurangi
4. Search/filter varian debounce 300ms — jangan fetch API setiap ketukan
5. Setelah transaksi sukses, halaman TIDAK perlu reload — cukup clear cart dan tampil ringkasan
6. Tampilkan info kecil di halaman kasir: "Stok bahan tidak berkurang otomatis dari transaksi"
   → ini mencegah kasir bingung mengapa stok tidak berubah
7. Jika cart kosong, sembunyikan floating bar (jangan tampilkan bar kosong)
8. Gunakan grid 2 kolom di mobile, 3 kolom di tablet, 4 kolom di desktop
```

### 5.5 Tampilan Pembatalan Transaksi (`CancelTransactionModal.vue`)

Tampilkan tombol "Batalkan" di `TransactionHistoryView` dengan kondisi:
- Admin: selalu tampilkan jika status = `paid`
- Kasir: tampilkan hanya jika `created_at` transaksi belum lebih dari 1 jam **DAN** transaksi adalah milik kasir tersebut

```
Tombol conditional → buka Modal → form alasan wajib diisi
→ POST /api/v1/transactions/{id}/cancel
→ payload: { cancel_reason: "..." }
→ sukses: refresh list, badge status berubah merah "Dibatalkan"
```

**JANGAN** menghitung selisih waktu 1 jam di frontend untuk menyembunyikan tombol secara permanen — frontend hanya UX hint. Backend yang validasi final dan bisa mengembalikan error `403` jika batas waktu terlampaui.

---

## BAGIAN 6 — ATURAN DISPLAY DATA

### 6.1 Format Rupiah

Gunakan utility ini secara konsisten di seluruh aplikasi:

```js
// src/utils/currency.js
export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}
// Output: Rp6.000 / Rp12.500 / Rp1.250.000
```

### 6.2 Label Keuangan — WAJIB

| ✅ Gunakan | ❌ Dilarang |
|---|---|
| Estimasi Selisih Kas | Laba Bersih |
| Pemasukan | Net Profit |
| Pengeluaran | Profit Bersih |

Buat constant untuk label ini agar tidak ada typo:

```js
// src/constants/labels.js
export const LABEL_SELISIH_KAS = 'Estimasi Selisih Kas'
export const LABEL_PEMASUKAN   = 'Pemasukan'
export const LABEL_PENGELUARAN = 'Pengeluaran'
```

### 6.3 Badge Status Transaksi

```js
// Mapping status → warna Tailwind + label
const STATUS_CONFIG = {
  paid:     { label: 'Dibayar',     class: 'bg-green-100 text-green-700' },
  canceled: { label: 'Dibatalkan',  class: 'bg-red-100 text-red-700' }
}
```

### 6.4 Badge Status Stok Bahan

```js
// current_stock dari API raw-materials
function getStockStatus(current, min) {
  if (current <= 0)   return { label: 'Habis',    class: 'bg-red-100 text-red-700' }
  if (current <= min) return { label: 'Menipis',  class: 'bg-amber-100 text-amber-700' }
  return               { label: 'Aman',           class: 'bg-green-100 text-green-700' }
}
```

### 6.5 Download PDF/Excel

```js
// src/utils/fileDownload.js
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// Contoh pemakaian di reportApi.js:
// const response = await http.get('/reports/custom/pdf', {
//   params: { date_from, date_to },
//   responseType: 'blob'
// })
// downloadBlob(response.data, 'laporan-dcelup.pdf')
```

---

## BAGIAN 7 — ERROR HANDLING STANDAR

### 7.1 Mapping HTTP Status

| Status | Aksi Frontend |
|---|---|
| 200/201 | Tampilkan data / toast sukses |
| 400 | Tampilkan `response.data.message` dari backend |
| 401 | Hapus token lokal, redirect ke `/login` (sudah di Axios interceptor) |
| 403 | Redirect ke `/403` atau tampilkan state "Tidak punya akses" |
| 422 | Tampilkan error per field dari `response.data.errors` di bawah input |
| 500 | Tampilkan: "Terjadi kesalahan pada server. Silakan coba lagi." |
| Network error | Tampilkan: "Koneksi terputus. Periksa internet lalu coba lagi." |

### 7.2 Komposabel Error (`src/composables/useApiError.js`)

```js
export function useApiError() {
  function extractErrors(error) {
    if (error.response?.status === 422) {
      return error.response.data.errors ?? {}
    }
    return {}
  }

  function extractMessage(error) {
    return error.response?.data?.message ?? 'Terjadi kesalahan. Silakan coba lagi.'
  }

  return { extractErrors, extractMessage }
}
```

---

## BAGIAN 8 — ENUM DAN KONSTANTA

Semua nilai enum wajib diambil dari konstanta, bukan string hardcode.

```js
// src/constants/roles.js
export const ROLES = { ADMIN: 'admin', KASIR: 'kasir' }

// src/constants/productTypes.js
export const PRODUCT_TYPES = [
  { value: 'original',  label: 'Original' },
  { value: 'crispy',    label: 'Crispy' },
  { value: 'jumbo',     label: 'Jumbo' },
  { value: 'bakar',     label: 'Sempol Bakar' },
  { value: 'twin_cup',  label: 'Twin Cup' }
]

// src/constants/paymentMethods.js
export const PAYMENT_METHODS = [
  { value: 'cash',     label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'qris',     label: 'QRIS' }
]

// src/constants/stockMovementTypes.js
export const STOCK_MOVEMENT_TYPES = [
  { value: 'in',         label: 'Barang Masuk',  color: 'green' },
  { value: 'out',        label: 'Barang Keluar', color: 'orange' },
  { value: 'adjustment', label: 'Koreksi Stok',  color: 'blue' }
]
```

---

## BAGIAN 9 — `App.vue` — ENTRY POINT

`App.vue` bertanggung jawab memvalidasi token saat pertama kali app dibuka.

```vue
<!-- src/App.vue -->
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  // Coba validasi token dari localStorage setiap kali app dimuat
  // Jika token tidak valid, authStore.fetchMe() akan clearAuth() otomatis
  // Route guard kemudian akan redirect ke /login
  await authStore.fetchMe()
})
</script>

<template>
  <RouterView />
</template>
```

---

## BAGIAN 10 — URUTAN IMPLEMENTASI (SPRINT)

Ikuti urutan ini agar integrasi dengan backend berjalan lancar:

**Sprint 1 — Fondasi**
1. Setup project Vue + Vite + Tailwind dengan token warna D'Celup
2. Buat `src/api/http.js` dengan interceptor
3. Buat `authStore`, `uiStore`
4. Buat `router/index.js` + `router/guards.js`
5. Buat `LoginView.vue`
6. Test: login → dapat token → redirect dashboard → reload → tetap login → logout → redirect login

**Sprint 2 — Dashboard**
1. Buat `DashboardLayout.vue` (sidebar merah + topbar + bottom nav mobile)
2. Buat `dashboardStore`
3. Buat `DashboardView.vue` dengan percabangan admin/kasir
4. Buat `KpiCard.vue`, `WeeklySalesChart.vue`, `LowStockWidget.vue`
5. Test: admin dashboard tampil KPI + grafik, kasir dashboard tampil versi ringkas

**Sprint 3 — Kasir (PRIORITAS TERTINGGI)**
1. Buat `cartStore`
2. Buat `CashierView.vue` dengan layout mobile-first
3. Buat `ProductVariantCard.vue` dengan counter qty
4. Buat `CartPanel.vue` + floating bar
5. Buat `PaymentSummary.vue` (bottom sheet)
6. Test: tambah item → ubah qty → pilih metode bayar → submit → toast sukses → cart kosong

**Sprint 4 — Transaksi & Produk**
1. `TransactionHistoryView.vue` + filter + badge status
2. `TransactionDetailView.vue`
3. `CancelTransactionModal.vue`
4. `ProductListView.vue` + `ProductVariantListView.vue`

**Sprint 5 — Stok & Keuangan**
1. `RawMaterialListView.vue` (admin CRUD, kasir lihat)
2. `StockInView.vue`, `StockOutView.vue`, `StockAdjustmentView.vue`
3. `StockMovementHistoryView.vue` dengan `balance_before` dan `balance_after`
4. `ExpenseListView.vue` (auto_stock read-only)
5. `ExpenseCategoryView.vue`

**Sprint 6 — Laporan & Admin Tools**
1. `ReportView.vue` dengan preview + download PDF/Excel
2. `UserManagementView.vue`
3. `ActivityLogView.vue`

**Sprint 7 — QA & UAT**
1. Test semua role guard (kasir tidak bisa akses `/reports`)
2. Test mobile 360px semua halaman
3. Test transaksi end-to-end < 30 detik
4. Test download PDF/Excel
5. UAT bersama pemilik dan kasir
6. Build production

---

## CHECKLIST SEBELUM CODING DIMULAI

- [ ] `tailwind.config.js` sudah punya token warna `dcelup.*`
- [ ] `.env` sudah berisi `VITE_API_BASE_URL`
- [ ] `http.js` sudah punya request interceptor (token) dan response interceptor (401 → redirect)
- [ ] `authStore` sudah punya `fetchMe()` yang dipanggil dari `App.vue`
- [ ] Route guard menangani 4 skenario: public+login, public+belum login, protected+belum login, role mismatch
- [ ] Semua route admin-only punya `meta.roles: ['admin']`
- [ ] `cartStore.buildTransactionPayload()` tidak mengirim `trx_date` dan `unit_price`
- [ ] Label "Estimasi Selisih Kas" dipakai dari konstanta, bukan string langsung
- [ ] Tidak ada `v-html` kecuali benar-benar diperlukan

---

*Prompt ini didasarkan pada Frontend Specification D'Celup Sempol Ayam v1.0 Final Clean.*  
*Backend API: Laravel 11, REST /api/v1, Sanctum Bearer Token.*  
*© 2026 D'Celup Sempol Ayam*