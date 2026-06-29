import http from './http'

export const dashboardApi = {
  getAdminSummary(params = {}) { return http.get('/dashboard/admin-summary', { params }) },
  getCashierSummary(params = {}) { return http.get('/dashboard/cashier-summary', { params }) },
  getWeeklySales(params = {}) { return http.get('/dashboard/weekly-sales', { params }) },
  getTopProducts(params = {}) { return http.get('/dashboard/top-products', { params }) },
  getLowStockMaterials(params = {}) { return http.get('/dashboard/low-stock-materials', { params }) }
}
