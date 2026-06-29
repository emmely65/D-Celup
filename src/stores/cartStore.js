import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    customerName: '',
    paymentMethod: 'cash',
    paidAmount: 0
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),
    totalAmount: (state) => state.items.reduce((sum, item) => sum + item.subtotal, 0),
    isEmpty: (state) => state.items.length === 0,
    changeAmount: (state) => {
      const total = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      return Math.max(0, Number(state.paidAmount || 0) - total)
    }
  },

  actions: {
    addItem(variant) {
      const existing = this.items.find((item) => item.product_variant_id === variant.id)
      if (existing) {
        existing.qty += 1
        existing.subtotal = existing.qty * existing.price
        return
      }

      this.items.push({
        product_variant_id: variant.id,
        product_name: variant.product?.name ?? 'Sempol',
        sauce_name: variant.sauce_name,
        type: variant.type,
        price: Number(variant.price),
        qty_per_pack: variant.qty_per_pack,
        qty: 1,
        subtotal: Number(variant.price)
      })
    },

    increaseQty(productVariantId) {
      const item = this.items.find((item) => item.product_variant_id === productVariantId)
      if (!item) return
      item.qty += 1
      item.subtotal = item.qty * item.price
    },

    decreaseQty(productVariantId) {
      const index = this.items.findIndex((item) => item.product_variant_id === productVariantId)
      if (index === -1) return
      if (this.items[index].qty <= 1) {
        this.items.splice(index, 1)
        return
      }
      this.items[index].qty -= 1
      this.items[index].subtotal = this.items[index].qty * this.items[index].price
    },

    removeItem(productVariantId) {
      this.items = this.items.filter((item) => item.product_variant_id !== productVariantId)
    },

    setPayment(payload) {
      if (payload.customerName !== undefined) this.customerName = payload.customerName
      if (payload.paymentMethod) this.paymentMethod = payload.paymentMethod
      if (payload.paidAmount !== undefined) this.paidAmount = Number(payload.paidAmount)
    },

    clearCart() {
      this.items = []
      this.customerName = ''
      this.paymentMethod = 'cash'
      this.paidAmount = 0
    },

    buildTransactionPayload() {
      return {
        customer_name: this.customerName || 'Pembeli Umum',
        payment_method: this.paymentMethod,
        paid_amount: this.paidAmount,
        items: this.items.map((item) => ({
          variant_id: item.product_variant_id,
          qty: item.qty
        }))
      }
    }
  }
})
