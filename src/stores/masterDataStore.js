import { defineStore } from 'pinia'

const STORAGE_KEY_CATEGORIES = 'dcelup_master_categories'
const STORAGE_KEY_SAUCES = 'dcelup_master_sauces'

export const INITIAL_CATEGORIES = [
  { value: 'original', label: 'Original' },
  { value: 'crispy', label: 'Crispy' },
  { value: 'jumbo', label: 'Jumbo' },
  { value: 'bakar', label: 'Sempol Bakar' },
  { value: 'twin_cup', label: 'Twin Cup' }
]

export const INITIAL_SAUCES = [
  'Saus Teriyaki',
  'Saus Kacang',
  'Saus Sadis',
  'Saus Lada Hitam',
  'Saus Barbeque Spicy',
  'Saus BBQ Spicy + Mentai',
  'Saus BBQ Spicy + Carbonara',
  'Saus BBQ Spicy + Mayo',
  'Saus BBQ Spicy + Garlic',
  'Saus Teriyaki + Saus Kacang',
  'Saus Lada Hitam + Saus Sadis',
  'Saus BBQ Spicy + Saus Kacang',
  'Saus Sadis + Lada Hitam'
]

function getStoredCategories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('Failed to parse stored categories', e)
  }
  return INITIAL_CATEGORIES
}

function getStoredSauces() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SAUCES)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('Failed to parse stored sauces', e)
  }
  return INITIAL_SAUCES
}

export const useMasterDataStore = defineStore('masterData', {
  state: () => ({
    categories: getStoredCategories(),
    sauces: getStoredSauces()
  }),

  actions: {
    addCategory(label) {
      if (!label || !label.trim()) return false
      const trimmed = label.trim()
      const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
      if (this.categories.some(c => c.value === value || c.label.toLowerCase() === trimmed.toLowerCase())) {
        return false
      }
      this.categories.push({ value, label: trimmed })
      this.saveCategories()
      return true
    },

    removeCategory(value) {
      this.categories = this.categories.filter(c => c.value !== value)
      this.saveCategories()
    },

    addSauce(name) {
      if (!name || !name.trim()) return false
      const trimmed = name.trim()
      if (this.sauces.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        return false
      }
      this.sauces.push(trimmed)
      this.saveSauces()
      return true
    },

    removeSauce(name) {
      this.sauces = this.sauces.filter(s => s !== name)
      this.saveSauces()
    },

    saveCategories() {
      try {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(this.categories))
      } catch (e) {
        console.error(e)
      }
    },

    saveSauces() {
      try {
        localStorage.setItem(STORAGE_KEY_SAUCES, JSON.stringify(this.sauces))
      } catch (e) {
        console.error(e)
      }
    }
  }
})
