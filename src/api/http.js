import axios from 'axios'
import { createMockAdapter } from './mockBackend'

const isLocalBackend =
  import.meta.env.VITE_API_BASE_URL?.includes('dcelup-backend.test') ||
  import.meta.env.VITE_API_BASE_URL?.includes('localhost') ||
  import.meta.env.VITE_API_BASE_URL?.includes('127.0.0.1')

const useMockApi =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  import.meta.env.VITE_USE_MOCK_API === true ||
  (import.meta.env.VITE_USE_MOCK_API !== 'false' && import.meta.env.PROD && isLocalBackend)

const httpConfig = {
  baseURL: useMockApi ? '/mock-api' : import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
}

if (useMockApi) {
  httpConfig.adapter = createMockAdapter()
}

const http = axios.create(httpConfig)

// Interceptor: tambahkan Bearer token ke setiap request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: tangani 401 Unauthorized → paksa logout
// Menggunakan CustomEvent untuk menghindari circular dependency:
// http → authStore → authApi → http
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
