import http from './http'

export const productApi = {
  getAll(params = {}) { return http.get('/products', { params }) },
  getById(id) { return http.get(`/products/${id}`) },
  create(payload) { return http.post('/products', payload) },
  update(id, payload) { return http.put(`/products/${id}`, payload) },
  deactivate(id) { return http.patch(`/products/${id}/deactivate`) }
}
