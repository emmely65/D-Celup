import http from './http'

export const authApi = {
  login(payload) {
    return http.post('/auth/login', payload)
  },
  logout() {
    return http.post('/auth/logout')
  },
  getMe() {
    return http.get('/auth/me')
  }
}
