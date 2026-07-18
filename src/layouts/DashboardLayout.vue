<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// BUG-19: Import icon yang lebih spesifik agar tidak ada duplikasi icon di sidebar
import { Menu, LogOut, LayoutDashboard, ShoppingCart, Package, PackagePlus, PackageMinus, ClipboardList, ReceiptText, BarChart3, Users, ScrollText, Utensils, Layers, WalletCards } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import logo from '@/assets/logo-dcelup.jpeg'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()
const router = useRouter()

const menuItems = computed(() => [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'kasir'] },
  { name: 'Kasir', path: '/cashier', icon: ShoppingCart, roles: ['admin', 'kasir'] },
  { name: 'Pemasukan', path: '/transactions', icon: ReceiptText, roles: ['admin', 'kasir'] },
  { name: 'Pengeluaran', path: '/expenses', icon: WalletCards, roles: ['admin'] },
  { name: 'Kategori Pengeluaran', path: '/expense-categories', icon: WalletCards, roles: ['admin'] },
  { name: 'Laporan', path: '/reports', icon: BarChart3, roles: ['admin'] },
  { name: 'Stok Bahan', path: '/raw-materials', icon: Package, roles: ['admin', 'kasir'] },
  { name: 'Update Stok', path: '/stock/movements', icon: ScrollText, roles: ['admin', 'kasir'] },
  { name: 'Produk', path: '/products', icon: Utensils, roles: ['admin'] },
  { name: 'Varian Produk', path: '/product-variants', icon: Layers, roles: ['admin'] },
  { name: 'User', path: '/users', icon: Users, roles: ['admin'] },
  { name: 'Activity Log', path: '/activity-logs', icon: ScrollText, roles: ['admin'] }
].filter((item) => item.roles.includes(authStore.userRole)))

const bottomItems = computed(() => menuItems.value.filter((item) => ['/dashboard', '/cashier', '/transactions', '/raw-materials'].includes(item.path)))

// BUG-14: Computed class untuk grid bottom nav agar tidak hardcode grid-cols-4
const bottomNavGridClass = computed(() => {
  const count = bottomItems.value.length
  return {
    'grid-cols-1': count === 1,
    'grid-cols-2': count === 2,
    'grid-cols-3': count === 3,
    'grid-cols-4': count === 4,
    'grid-cols-5': count === 5,
  }
})

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-dcelup-cream text-dcelup-text">
    <aside
      class="fixed inset-y-0 left-0 z-40 w-72 max-w-[86vw] transform bg-dcelup-red text-white shadow-xl transition-transform md:w-56 md:translate-x-0 lg:w-64 xl:w-72"
      :class="uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center gap-3 border-b border-white/20 px-4 py-4">
        <img :src="logo" alt="Logo D'Celup" class="h-11 w-11 shrink-0 rounded-full bg-white object-cover shadow-sm" />
        <div class="flex-1 min-w-0">
          <p class="truncate font-extrabold leading-tight text-white">D'Celup</p>
          <p class="truncate text-[11px] font-medium text-white/80">Sempol Ayam</p>
        </div>
        <div class="shrink-0 rounded-md bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm border border-white/30 shadow-sm">
          {{ authStore.userRole }}
        </div>
      </div>

      <nav class="h-[calc(100vh-8rem)] overflow-y-auto px-3 py-4 no-scrollbar">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-white/15"
          :class="route.path === item.path ? 'bg-white text-dcelup-red shadow' : 'text-white'"
          @click="uiStore.closeSidebar()"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-white/20 p-3">
        <button class="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-semibold hover:bg-white/20" @click="logout">
          <LogOut class="h-5 w-5" /> Logout
        </button>
      </div>
    </aside>

    <div v-if="uiStore.sidebarOpen" class="fixed inset-0 z-30 bg-black/30 md:hidden" @click="uiStore.closeSidebar()"></div>

    <div class="md:pl-56 lg:pl-64 xl:pl-72">
      <header class="sticky top-0 z-20 border-b border-dcelup-border bg-dcelup-cream/90 backdrop-blur">
        <div class="flex min-h-[68px] items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6">
          <button class="shrink-0 rounded-xl bg-dcelup-red p-2 text-white md:hidden" @click="uiStore.toggleSidebar()">
            <Menu class="h-5 w-5" />
          </button>
          <div class="min-w-0 flex-1">
            <slot name="header-text"></slot>
          </div>
          <slot name="header-actions"></slot>
        </div>
      </header>

      <main class="px-3 py-4 pb-24 sm:px-4 md:pb-8 lg:px-6">
        <slot />
      </main>
    </div>

    <!-- BUG-14: Ganti grid-cols-4 hardcode dengan class dinamis sesuai jumlah item -->
    <nav class="fixed bottom-0 left-0 right-0 z-30 grid border-t border-dcelup-border bg-dcelup-creamSoft px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden" :class="bottomNavGridClass">
      <RouterLink
        v-for="item in bottomItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold"
        :class="route.path === item.path ? 'bg-dcelup-red text-white' : 'text-dcelup-textSoft'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
