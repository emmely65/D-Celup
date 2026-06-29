import http from './http'

export const transactionApi = {
  getAll(params = {}) { return http.get('/transactions', { params }) },
  getById(id) { return http.get(`/transactions/${id}`) },
  create(payload) { return http.post('/transactions', payload) },
  cancel(id, payload) { return http.post(`/transactions/${id}/cancel`, payload) }
}
