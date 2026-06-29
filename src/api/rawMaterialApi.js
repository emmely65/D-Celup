import http from './http'

export const rawMaterialApi = {
  getAll(params = {}) { return http.get('/raw-materials', { params }) },
  create(payload) { return http.post('/raw-materials', payload) },
  update(id, payload) { return http.put(`/raw-materials/${id}`, payload) },
  deactivate(id) { return http.patch(`/raw-materials/${id}/deactivate`) }
}
