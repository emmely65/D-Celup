import { useAuthStore } from '@/stores/authStore'

export function setupGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth !== false
    const allowedRoles = to.meta.roles ?? []

    // Hydrate state dari localStorage saat pertama kali akses
    if (!authStore.isAuthenticated) {
      authStore.hydrateFromStorage()
    }

    // Route tidak butuh auth tapi user sudah login → arahkan ke dashboard
    if (!requiresAuth && authStore.isAuthenticated) {
      return next({ name: 'dashboard' })
    }

    // Route tidak butuh auth → izinkan lanjut
    if (!requiresAuth) {
      return next()
    }

    // Route butuh auth, belum authenticated → validasi token ke server
    if (!authStore.isAuthenticated) {
      const valid = await authStore.fetchMe()
      if (!valid) return next({ name: 'login' })
    }

    // Cek izin role
    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.userRole)) {
      return next({ name: 'forbidden' })
    }

    return next()
  })
}
