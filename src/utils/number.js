export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 3,
  }).format(Number(value || 0))
}
