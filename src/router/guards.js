import { useAuthStore } from '@/stores/authStore'

export function setupGuards(router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth !== false
    const allowedRoles = to.meta.roles ?? []

    // Hydrate state dari localStorage saat pertama kali akses
    if (!authStore.isAuthenticated) {
      authStore.hydrateFromStorage()
    }

    // Route publik (seperti /login)
    if (!requiresAuth) {
      if (authStore.isAuthenticated && to.name === 'login') {
        const valid = await authStore.fetchMe()
        if (valid) return { name: 'dashboard' }
      }
      return true
    }

    // Route yang membutuhkan autentikasi
    if (!authStore.isAuthenticated) {
      const valid = await authStore.fetchMe()
      if (!valid) return { name: 'login' }
    }

    // Cek izin role
    if (allowedRoles.length > 0 && !allowedRoles.includes(authStore.userRole)) {
      return { name: 'forbidden' }
    }

    return true
  })
}
