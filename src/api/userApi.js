import http from './http'

export const userApi = {
  getAll(params = {}) { return http.get('/users', { params }) },
  getById(id) { return http.get(`/users/${id}`) },
  create(payload) { return http.post('/users', payload) },
  update(id, payload) { return http.put(`/users/${id}`, payload) },
  deactivate(id) { return http.patch(`/users/${id}/deactivate`) },
  resetPassword(id, payload) { return http.patch(`/users/${id}/reset-password`, payload) }
}
