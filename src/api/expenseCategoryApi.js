import http from './http'

export const expenseCategoryApi = {
  getAll(params = {}) { return http.get('/expense-categories', { params }) },
  create(payload) { return http.post('/expense-categories', payload) },
  update(id, payload) { return http.put(`/expense-categories/${id}`, payload) },
  deactivate(id) { return http.patch(`/expense-categories/${id}/deactivate`) }
}
