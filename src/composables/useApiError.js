export function useApiError() {
  function extractErrors(error) {
    if (error.response?.status === 422) {
      return error.response.data.errors ?? {}
    }
    return {}
  }

  function extractMessage(error) {
    if (!error.response) return 'Koneksi terputus. Periksa internet lalu coba lagi.'
    if (error.response.status >= 500) return 'Terjadi kesalahan pada server. Silakan coba lagi.'
    return error.response?.data?.message ?? 'Terjadi kesalahan. Silakan coba lagi.'
  }

  return { extractErrors, extractMessage }
}
