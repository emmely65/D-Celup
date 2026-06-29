import http from './http'

export const activityLogApi = {
  getAll(params = {}) { return http.get('/activity-logs', { params }) }
}
