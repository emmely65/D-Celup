<script setup>
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Scale, ShoppingBag, DollarSign, Activity } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: '-' },
  caption: { type: String, default: '' },
  tone: { type: String, default: 'emerald' }, // emerald, rose, amber, indigo
  icon: { type: Object, default: null }
})

// Compute default icon based on title or tone
const cardIcon = computed(() => {
  if (props.icon) return props.icon
  const t = props.title.toLowerCase()
  if (t.includes('pemasukan') || t.includes('income')) return TrendingUp
  if (t.includes('pengeluaran') || t.includes('expense')) return TrendingDown
  if (t.includes('selisih') || t.includes('difference')) return Scale
  if (t.includes('transaksi') || t.includes('count')) return ShoppingBag
  return Activity
})

// Tone styling config
const toneConfig = computed(() => {
  const t = props.tone
  if (t === 'yellow' || t === 'rose' || props.title.toLowerCase().includes('pengeluaran')) {
    return {
      iconBg: 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      valColor: 'text-rose-700',
      borderAccent: 'hover:border-rose-300'
    }
  }
  if (t === 'amber' || props.title.toLowerCase().includes('selisih')) {
    return {
      iconBg: 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      valColor: 'text-amber-800',
      borderAccent: 'hover:border-amber-300'
    }
  }
  if (t === 'indigo' || props.title.toLowerCase().includes('transaksi')) {
    return {
      iconBg: 'bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/20',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      valColor: 'text-dcelup-text',
      borderAccent: 'hover:border-indigo-300'
    }
  }
  // Default: emerald / income
  return {
    iconBg: 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    valColor: 'text-emerald-800',
    borderAccent: 'hover:border-emerald-300'
  }
})
</script>

<template>
  <div
    class="hover-lift relative flex flex-col justify-between rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs transition-all duration-300 overflow-hidden"
    :class="toneConfig.borderAccent"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-dcelup-textSoft/80">{{ title }}</p>
        <p class="mt-2 text-2xl font-black tracking-tight" :class="toneConfig.valColor">
          {{ value }}
        </p>
      </div>
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs" :class="toneConfig.iconBg">
        <component :is="cardIcon" class="h-5.5 w-5.5" />
      </div>
    </div>

    <div v-if="caption" class="mt-4 flex items-center gap-1.5 border-t border-dcelup-border/50 pt-3">
      <span class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold border" :class="toneConfig.badgeBg">
        {{ caption }}
      </span>
    </div>
  </div>
</template>

