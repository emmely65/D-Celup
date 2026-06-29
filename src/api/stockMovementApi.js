import http from './http'

export const stockMovementApi = {
  getAll(params = {}) { return http.get('/stock-movements', { params }) },
  stockIn(payload) { return http.post('/stock-movements/in', payload) },
  stockOut(payload) { return http.post('/stock-movements/out', payload) },
  adjustment(payload) { return http.post('/stock-movements/adjustment', payload) }
}
