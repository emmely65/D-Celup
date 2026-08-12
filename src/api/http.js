import axios from 'axios'
import { setupMockAdapter } from './mock/mockAdapter'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl

const http = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Otomatis aktifkan Mock Adapter jika di Vercel (*.vercel.app) atau VITE_USE_MOCK_API === 'true'
const isVercelEnv = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
const isMockEnabled = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true || isVercelEnv

if (isMockEnabled) {
  setupMockAdapter(http)
}

// Interceptor: tambahkan Bearer token ke setiap request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: tangani 401 Unauthorized -> paksa logout
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default http
