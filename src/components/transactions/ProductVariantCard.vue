<script setup>
import { computed } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { formatRupiah } from '@/utils/currency'
import { getProductTypeLabel } from '@/constants/productTypes'

const props = defineProps({ variant: { type: Object, required: true } })
const cartStore = useCartStore()

const cartItem = computed(() => cartStore.items.find((item) => item.product_variant_id === props.variant.id))
</script>

<template>
  <article class="flex min-h-[184px] flex-col justify-between rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-3 shadow-sm sm:min-h-[190px] sm:p-4">
    <div class="min-w-0">
      <p class="line-clamp-1 text-sm font-extrabold text-dcelup-text">{{ variant.product?.name ?? 'Sempol' }}</p>
      <h3 class="mt-1 line-clamp-2 text-base font-black leading-tight text-dcelup-red sm:text-lg">{{ variant.sauce_name }}</h3>
      <p class="mt-1 text-xs font-semibold uppercase text-dcelup-textSoft">
        {{ getProductTypeLabel(variant.type) }} - {{ variant.qty_per_pack }} pcs
      </p>
      <div class="mt-3 inline-flex rounded-full bg-dcelup-yellow px-3 py-1 text-sm font-black text-dcelup-text">
        {{ formatRupiah(variant.price) }}
      </div>
    </div>

    <div class="mt-4">
      <button
        v-if="!cartItem"
        class="min-h-12 w-full rounded-xl bg-dcelup-red px-3 py-2 text-sm font-extrabold text-white transition hover:bg-dcelup-redDark"
        @click="cartStore.addItem(variant)"
      >
        Tambah
      </button>
      <div v-else class="grid min-h-12 grid-cols-3 overflow-hidden rounded-xl border border-dcelup-red bg-white text-center font-extrabold text-dcelup-red">
        <button class="flex items-center justify-center hover:bg-dcelup-cream" @click="cartStore.decreaseQty(variant.id)">
          <Minus class="h-4 w-4" />
        </button>
        <div class="flex items-center justify-center border-x border-dcelup-border">{{ cartItem.qty }}</div>
        <button class="flex items-center justify-center hover:bg-dcelup-cream" @click="cartStore.increaseQty(variant.id)">
          <Plus class="h-4 w-4" />
        </button>
      </div>
    </div>
  </article>
</template>
