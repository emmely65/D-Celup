<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({ items: { type: Array, default: () => [] } })

const chartData = computed(() => ({
  labels: props.items.map((item) => item.date ?? item.label ?? '-'),
  datasets: [
    {
      label: 'Pemasukan',
      data: props.items.map((item) => Number(item.total_amount ?? item.total ?? item.amount ?? 0)),
      backgroundColor: '#C61F1F',
      borderRadius: 8
    }
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } }
}
</script>

<template>
  <section class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
    <h2 class="mb-3 font-extrabold text-dcelup-text">Grafik Penjualan Mingguan</h2>
    <div class="h-64">
      <Bar :data="chartData" :options="options" />
    </div>
  </section>
</template>
