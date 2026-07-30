<script setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Menu,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  Package,
  ReceiptText,
  BarChart3,
  Users,
  ScrollText,
  Utensils,
  Layers,
  WalletCards,
  Sparkles,
  ChevronRight
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import logo from '@/assets/logo-dcelup.jpeg'

const authStore = useAuthStore()
const uiStore = useUiStore()
const route = useRoute()
const router = useRouter()
const sidebarNavRef = ref(null)

function scrollToActiveItem() {
  nextTick(() => {
    if (!sidebarNavRef.value) return
    const activeEl = sidebarNavRef.value.querySelector('a.router-link-active, a.bg-white')
    if (activeEl) {
      activeEl.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  })
}

onMounted(() => {
  scrollToActiveItem()
})

watch(
  () => route.path,
  () => {
    scrollToActiveItem()
  }
)

// Grouped navigation for visual hierarchy
const menuSections = computed(() => {
  const role = authStore.userRole

  const sections = [
    {
      title: 'UTAMA',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'kasir'] },
        { name: 'Kasir POS', path: '/cashier', icon: ShoppingCart, roles: ['admin', 'kasir'] }
      ]
    },
    {
      title: 'KEUANGAN',
      items: [
        { name: 'Pemasukan', path: '/transactions', icon: ReceiptText, roles: ['admin', 'kasir'] },
        { name: 'Pengeluaran', path: '/expenses', icon: WalletCards, roles: ['admin'] },
        { name: 'Laporan', path: '/reports', icon: BarChart3, roles: ['admin'] }
      ]
    },
    {
      title: 'INVENTORI',
      items: [
        { name: 'Stok Bahan', path: '/raw-materials', icon: Package, roles: ['admin', 'kasir'] },
        { name: 'Update Stok', path: '/stock/movements', icon: ScrollText, roles: ['admin', 'kasir'] },
        { name: 'Master Produk', path: '/products', icon: Utensils, roles: ['admin'] },
        { name: 'Varian Produk', path: '/product-variants', icon: Layers, roles: ['admin'] }
      ]
    },
    {
      title: 'MANAJEMEN',
      items: [
        { name: 'Pengguna', path: '/users', icon: Users, roles: ['admin'] },
        { name: 'Log Aktivitas', path: '/activity-logs', icon: ScrollText, roles: ['admin'] }
      ]
    }
  ]

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role))
    }))
    .filter((section) => section.items.length > 0)
})

// Flattened list for mobile bottom nav
const bottomItems = computed(() => {
  const allItems = menuSections.value.flatMap((s) => s.items)
  return allItems.filter((item) => ['/dashboard', '/cashier', '/transactions', '/raw-materials'].includes(item.path))
})

const bottomNavGridClass = computed(() => {
  const count = bottomItems.value.length
  return {
    'grid-cols-1': count === 1,
    'grid-cols-2': count === 2,
    'grid-cols-3': count === 3,
    'grid-cols-4': count === 4,
    'grid-cols-5': count === 5
  }
})

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-dcelup-cream text-dcelup-text font-sans antialiased">
    <!-- SIDEBAR -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex flex-col w-72 max-w-[86vw] transform bg-gradient-to-b from-[#8A1111] via-[#B81919] to-[#991212] text-white shadow-2xl transition-transform duration-300 ease-in-out md:w-60 lg:w-64 xl:w-72 border-r border-red-900/30"
      :class="uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <!-- BRAND HEADER -->
      <div class="flex shrink-0 items-center gap-3.5 border-b border-white/10 px-5 py-5 bg-black/10">
        <div class="relative">
          <img :src="logo" alt="Logo D'Celup" class="h-11 w-11 shrink-0 rounded-full bg-white object-cover shadow-lg ring-2 ring-white/30" />
          <span class="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#8A1111]">
            <span class="h-2 w-2 rounded-full bg-white animate-pulse"></span>
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <p class="truncate font-black tracking-tight text-lg leading-none text-white">D'Celup</p>
            <Sparkles class="h-3.5 w-3.5 text-amber-300 shrink-0" />
          </div>
          <p class="truncate text-xs font-semibold text-white/70 mt-0.5">Sempol Ayam POS</p>
        </div>
        <div class="shrink-0 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-300 border border-amber-400/30 shadow-sm backdrop-blur-sm">
          {{ authStore.userRole }}
        </div>
      </div>

      <!-- GROUPED NAVIGATION MENU -->
      <nav ref="sidebarNavRef" class="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        <div v-for="section in menuSections" :key="section.title" class="space-y-1">
          <p class="px-3 text-[10px] font-black uppercase tracking-wider text-white/40 mb-1.5">
            {{ section.title }}
          </p>
          <RouterLink
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            class="group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200"
            :class="[
              route.path === item.path
                ? 'bg-white text-dcelup-red font-bold shadow-lg shadow-black/15 translate-x-1'
                : 'text-white/85 hover:bg-white/12 hover:text-white hover:translate-x-0.5'
            ]"
            @click="uiStore.closeSidebar()"
          >
            <component
              :is="item.icon"
              class="h-5 w-5 shrink-0 transition-transform group-hover:scale-110"
              :class="route.path === item.path ? 'text-dcelup-red' : 'text-white/80 group-hover:text-white'"
            />
            <span class="truncate flex-1">{{ item.name }}</span>
            <ChevronRight
              v-if="route.path === item.path"
              class="h-4 w-4 shrink-0 text-dcelup-red/60"
            />
          </RouterLink>
        </div>
      </nav>

      <!-- LOGOUT BUTTON -->
      <div class="shrink-0 border-t border-white/10 bg-black/15 p-3">
        <button
          class="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl bg-white/10 px-4 py-2.5 font-bold text-sm text-white transition-all hover:bg-white/20 active:scale-98 shadow-sm"
          @click="logout"
        >
          <LogOut class="h-4 w-4 shrink-0 text-white/90" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>

    <!-- MOBILE OVERLAY -->
    <div
      v-if="uiStore.sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
      @click="uiStore.closeSidebar()"
    ></div>

    <!-- MAIN CONTENT AREA -->
    <div class="md:pl-60 lg:pl-64 xl:pl-72 transition-all duration-300">
      <!-- HEADER -->
      <header class="sticky top-0 z-20 border-b border-dcelup-border/70 glass-header shadow-xs">
        <div class="flex min-h-[64px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            class="shrink-0 rounded-xl bg-dcelup-red p-2 text-white shadow-sm hover:bg-dcelup-redDark active:scale-95 transition-all md:hidden"
            @click="uiStore.toggleSidebar()"
          >
            <Menu class="h-5 w-5" />
          </button>
          <div class="min-w-0 flex-1">
            <slot name="header-text"></slot>
          </div>
          <div class="flex items-center gap-2">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </header>

      <!-- PAGE MAIN CONTENT -->
      <main class="px-3 py-5 pb-24 sm:px-6 md:pb-8 lg:px-8 max-w-7xl mx-auto">
        <Transition name="page" mode="out-in">
          <div :key="route.fullPath">
            <slot />
          </div>
        </Transition>
      </main>
    </div>

    <!-- MOBILE BOTTOM NAVIGATION -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-30 grid border-t border-dcelup-border bg-dcelup-creamSoft/95 backdrop-blur-md px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden"
      :class="bottomNavGridClass"
    >
      <RouterLink
        v-for="item in bottomItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-all"
        :class="route.path === item.path ? 'bg-dcelup-red text-white shadow-sm font-bold' : 'text-dcelup-textSoft hover:text-dcelup-text'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span class="truncate max-w-[64px] text-center">{{ item.name }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

