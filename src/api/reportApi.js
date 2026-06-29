import http from './http'

export const reportApi = {
  weekly(params = {}) { return http.get('/reports/weekly', { params }) },
  custom(params = {}) { return http.get('/reports/custom', { params }) },
  weeklyPdf(params = {}) { return http.get('/reports/weekly/pdf', { params, responseType: 'blob' }) },
  weeklyExcel(params = {}) { return http.get('/reports/weekly/excel', { params, responseType: 'blob' }) },
  customPdf(params = {}) { return http.get('/reports/custom/pdf', { params, responseType: 'blob' }) },
  customExcel(params = {}) { return http.get('/reports/custom/excel', { params, responseType: 'blob' }) }
}
