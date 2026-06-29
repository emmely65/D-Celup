import axios from 'axios'
import { createMockAdapter } from './mockBackend'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

const httpConfig = {
  baseURL: useMockApi ? '/mock-api' : import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
}

if (useMockApi) {
  httpConfig.adapter = createMockAdapter()
}

const http = axios.create(httpConfig)

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      // BUG-10: Kirim event ke authStore agar Pinia state ikut di-clear.
      // Tidak import store langsung di sini karena akan menyebabkan
      // circular dependency: http → authStore → authApi → http
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default http
