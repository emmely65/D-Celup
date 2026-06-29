import { defineStore } from 'pinia'
import { dashboardApi } from '@/api/dashboardApi'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    adminSummary: null,
    cashierSummary: null,
    weeklySales: [],
    topProducts: [],
    lowStockMaterials: [],
    isLoading: false
  }),

  getters: {
    hasLowStock: (state) => state.lowStockMaterials.length > 0,
    lowStockCount: (state) => state.lowStockMaterials.length
  },

  actions: {
    async fetchAdminSummary() {
      try {
        const res = await dashboardApi.getAdminSummary()
        this.adminSummary = res.data.data
      } catch (e) {
        // BUG-16: Log error agar tidak hilang silently
        console.error('[DashboardStore] fetchAdminSummary gagal:', e)
      }
    },

    async fetchCashierSummary() {
      try {
        const res = await dashboardApi.getCashierSummary()
        this.cashierSummary = res.data.data
      } catch (e) {
        console.error('[DashboardStore] fetchCashierSummary gagal:', e)
      }
    },

    async fetchWeeklySales(params = {}) {
      try {
        const res = await dashboardApi.getWeeklySales(params)
        this.weeklySales = res.data.data ?? []
      } catch (e) {
        console.error('[DashboardStore] fetchWeeklySales gagal:', e)
      }
    },

    async fetchTopProducts(params = {}) {
      try {
        const res = await dashboardApi.getTopProducts(params)
        this.topProducts = res.data.data ?? []
      } catch (e) {
        console.error('[DashboardStore] fetchTopProducts gagal:', e)
      }
    },

    async fetchLowStockMaterials() {
      try {
        const res = await dashboardApi.getLowStockMaterials()
        this.lowStockMaterials = res.data.data ?? []
      } catch (e) {
        console.error('[DashboardStore] fetchLowStockMaterials gagal:', e)
      }
    },

    async fetchAdminDashboard() {
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
      this.isLoading = true
      await Promise.allSettled([
        this.fetchCashierSummary(),
        this.fetchWeeklySales(),
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

