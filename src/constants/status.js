export const TRANSACTION_STATUS_CONFIG = {
  paid: { label: 'Dibayar', class: 'bg-green-100 text-green-700 border-green-200' },
  canceled: { label: 'Dibatalkan', class: 'bg-red-100 text-red-700 border-red-200' }
}

export function getStockStatus(current, min) {
  const currentValue = Number(current || 0)
  const minValue = Number(min || 0)
  if (currentValue <= 0) return { label: 'Habis', class: 'bg-red-100 text-red-700 border-red-200' }
  if (currentValue <= minValue) return { label: 'Menipis', class: 'bg-amber-100 text-amber-700 border-amber-200' }
  return { label: 'Aman', class: 'bg-green-100 text-green-700 border-green-200' }
}
