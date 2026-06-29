export const PRODUCT_TYPES = [
  { value: 'original', label: 'Original' },
  { value: 'crispy', label: 'Crispy' },
  { value: 'jumbo', label: 'Jumbo' },
  { value: 'bakar', label: 'Sempol Bakar' },
  { value: 'twin_cup', label: 'Twin Cup' }
]

export function getProductTypeLabel(value) {
  return PRODUCT_TYPES.find((item) => item.value === value)?.label ?? value
}
