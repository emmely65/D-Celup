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

    // Ambil pesan kesalahan validasi spesifik pertama jika ada (422 validation errors)
    if (error.response.status === 422 && error.response.data?.errors) {
      const firstKey = Object.keys(error.response.data.errors)[0]
      if (firstKey && Array.isArray(error.response.data.errors[firstKey]) && error.response.data.errors[firstKey][0]) {
        const msg = error.response.data.errors[firstKey][0]
        if (msg.includes('already been taken')) return 'Nama bahan atau item ini sudah pernah terdaftar di sistem.'
        return msg
      }
    }

    return error.response?.data?.message ?? 'Terjadi kesalahan. Silakan coba lagi.'
  }

  return { extractErrors, extractMessage }
}
