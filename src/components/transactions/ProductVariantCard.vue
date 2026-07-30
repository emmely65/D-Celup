<script setup>
import { computed } from 'vue'
import { Plus, Minus, UtensilsCrossed } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cartStore'
import { formatRupiah } from '@/utils/currency'
import { getProductTypeLabel } from '@/constants/productTypes'

const props = defineProps({ variant: { type: Object, required: true } })
const cartStore = useCartStore()

const cartItem = computed(() => cartStore.items.find((item) => item.product_variant_id === props.variant.id))
</script>

<template>
  <article class="hover-lift group flex flex-col justify-between rounded-2xl border border-dcelup-border/80 bg-white p-4 shadow-xs transition-all duration-300 hover:border-dcelup-red/30">
    <div>
      <!-- Product Category / Type Badge & Icon Header -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="inline-flex items-center gap-1 rounded-md bg-dcelup-creamSoft px-2.5 py-0.5 text-[11px] font-bold text-dcelup-textSoft uppercase tracking-wider border border-dcelup-border/60">
          <UtensilsCrossed class="h-3 w-3 text-dcelup-red" />
          {{ getProductTypeLabel(variant.type) }}
        </span>
        <span class="text-[11px] font-semibold text-dcelup-textSoft/70">
          {{ variant.qty_per_pack }} pcs / pack
        </span>
      </div>

      <!-- Main Title (Sauce Name) -->
      <h3 class="line-clamp-2 text-base font-black leading-snug text-dcelup-text group-hover:text-dcelup-red transition-colors">
        {{ variant.sauce_name }}
      </h3>
      <p class="mt-0.5 line-clamp-1 text-xs font-semibold text-dcelup-textSoft">
        {{ variant.product?.name ?? 'Sempol Ayam' }}
      </p>
    </div>

    <!-- Card Footer: Price Badge (Left) + Action Button (Right) -->
    <div class="mt-4 flex items-center justify-between gap-2 border-t border-dcelup-border/40 pt-3">
      <!-- Harmonious Price Badge -->
      <div class="flex flex-col">
        <span class="text-[10px] font-semibold uppercase text-dcelup-textSoft/70">Harga</span>
        <span class="text-sm font-black text-dcelup-red">
          {{ formatRupiah(variant.price) }}
        </span>
      </div>

      <!-- Compact Action Button -->
      <div>
        <button
          v-if="!cartItem"
          class="inline-flex items-center gap-1.5 rounded-xl bg-dcelup-red px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-dcelup-redDark hover:shadow-md hover:shadow-dcelup-red/20 active:scale-95"
          @click="cartStore.addItem(variant)"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Tambah</span>
        </button>

        <div v-else class="flex h-9 items-center rounded-xl border border-dcelup-red bg-dcelup-creamSoft/60 text-xs font-bold text-dcelup-red overflow-hidden shadow-xs">
          <button class="flex h-full w-8 items-center justify-center transition-colors hover:bg-dcelup-red hover:text-white" @click="cartStore.decreaseQty(variant.id)">
            <Minus class="h-3.5 w-3.5" />
          </button>
          <span class="flex h-full min-w-7 items-center justify-center px-1 font-black text-dcelup-text text-sm">
            {{ cartItem.qty }}
          </span>
          <button class="flex h-full w-8 items-center justify-center transition-colors hover:bg-dcelup-red hover:text-white" @click="cartStore.increaseQty(variant.id)">
            <Plus class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

