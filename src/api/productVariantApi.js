import http from './http'

export const productVariantApi = {
  getAll(params = {}) { return http.get('/product-variants', { params }) },
  create(payload) { return http.post('/product-variants', payload) },
  update(id, payload) { return http.put(`/product-variants/${id}`, payload) },
  deactivate(id) { return http.patch(`/product-variants/${id}/deactivate`) }
}
