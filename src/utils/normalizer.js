export function unwrapData(response) {
  return response?.data?.data ?? response?.data ?? null
}

export function unwrapList(response) {
  const data = response?.data?.data
  return Array.isArray(data) ? data : []
}

export function unwrapMeta(response) {
  return response?.data?.meta ?? null
}
