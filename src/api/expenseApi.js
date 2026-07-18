import http from './http'

export const expenseApi = {
  getAll(params = {}) { return http.get('/expenses', { params }) },
  getById(id) { return http.get(`/expenses/${id}`) },
  create(payload) { return http.post('/expenses', payload) },
  update(id, payload) { return http.put(`/expenses/${id}`, payload) },
  delete(id) { return http.delete(`/expenses/${id}`) }
}
