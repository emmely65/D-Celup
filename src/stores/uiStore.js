import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: false,
    globalLoading: false,
    toastQueue: []
  }),

  actions: {
    openSidebar() { this.sidebarOpen = true },
    closeSidebar() { this.sidebarOpen = false },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },

    showToast(type, message) {
      const id = Date.now() + Math.random()
      this.toastQueue.push({ id, type, message })
      setTimeout(() => {
        this.toastQueue = this.toastQueue.filter((toast) => toast.id !== id)
      }, 4000)
    },

    setGlobalLoading(value) {
      this.globalLoading = value
    }
  }
})
