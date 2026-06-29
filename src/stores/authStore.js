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

    hydrateFromStorage() {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      if (savedToken) this.token = savedToken
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser)
          this.isAuthenticated = true
        } catch (_) {
          this.clearAuth()
        }
      }
    },

    async login(payload) {
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
    },

    // BUG-10: Dengarkan event 'auth:unauthorized' yang dikirim http.js
    // saat response 401 diterima, agar Pinia state ikut bersih
    // (menghindari circular dependency http → authStore → authApi → http)
    setupUnauthorizedListener() {
      window.addEventListener('auth:unauthorized', () => {
        this.clearAuth()
      })
    }
  }
})
