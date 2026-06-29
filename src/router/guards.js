import { useAuthStore } from '@/stores/authStore'

export function setupGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth !== false
    const allowedRoles = to.meta.roles ?? []

    // BUG-09: Hydrate dulu dari localStorage sebelum pengecekan apapun.
    // Tanpa ini, saat user buka /login dengan token valid di localStorage,
    // isAuthenticated masih false dan redirect ke dashboard tidak terjadi.
    if (!authStore.isAuthenticated) {
      authStore.hydrateFromStorage()
    }

    // Jika route tidak butuh auth dan user sudah login → redirect ke dashboard
    if (!requiresAuth && authStore.isAuthenticated) {
      return next({ name: 'dashboard' })
    }

    // Jika route tidak butuh auth dan user belum login → boleh lanjut
    if (!requiresAuth) {
      return next()
    }

    // Route butuh auth, tapi setelah hydrate masih belum authenticated
    // → coba validasi token ke server
    if (!authStore.isAuthenticated) {
      const valid = await authStore.fetchMe()
      if (!valid) return next({ name: 'login' })
    }

    // Cek role
    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.userRole)) {
      return next({ name: 'forbidden' })
    }

    return next()
  })
}

