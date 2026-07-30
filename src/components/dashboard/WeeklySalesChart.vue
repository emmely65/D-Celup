<script setup>
import { computed, onMounted, watch } from 'vue'
import { BarChart2, Calendar } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { formatRupiah } from '@/utils/currency'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const loadData = async () => {
  await dashboardStore.fetchWeeklySales()
}

watch(
  () => [dashboardStore.chartStartDate, dashboardStore.chartEndDate],
  () => {
    loadData()
  }
)

onMounted(() => {
  if (!dashboardStore.weeklySales.length) {
    loadData()
  }
})

const chartData = computed(() => {
  const items = dashboardStore.weeklySales
  const datasets = [
    {
      label: 'Pemasukan',
      data: items.map((item) => Number(item.total_income ?? item.total_amount ?? 0)),
      backgroundColor: '#C61F1F',
      borderRadius: 6,
      borderSkipped: false
    }
  ]
  
  if (authStore.isAdmin) {
    datasets.push({
      label: 'Pengeluaran',
      data: items.map((item) => Number(item.total_expense ?? 0)),
      backgroundColor: '#F59E0B',
      borderRadius: 6,
      borderSkipped: false
    })
  }
  
  return {
    labels: items.map((item) => item.date ?? item.label ?? '-'),
    datasets
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: {
      display: authStore.isAdmin,
      position: 'bottom',
      labels: {
        font: { family: "'Plus Jakarta Sans', sans-serif", weight: 700, size: 12 },
        usePointStyle: true,
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: 'rgba(26, 20, 18, 0.92)',
      titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13, weight: 'bold' },
      bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
      padding: 12,
      cornerRadius: 12,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      displayColors: true,
      boxPadding: 6,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += formatRupiah(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: { 
    y: { 
      beginAtZero: true,
      grid: { color: 'rgba(220, 200, 180, 0.35)', strokeDash: [4, 4] },
      ticks: {
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
        color: '#716259',
        callback: function(value) {
          return value >= 1000 ? (value / 1000) + 'k' : value;
        }
      }
    },
    x: {
      grid: { display: false },
      ticks: {
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
        color: '#716259'
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  }
}
</script>

<template>
  <section class="rounded-2xl border border-dcelup-border/80 bg-white p-5 shadow-xs">
    <div class="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <h2 class="font-black text-base text-dcelup-text flex items-center gap-2">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-dcelup-red/10 text-dcelup-red">
          <BarChart2 class="h-4 w-4" />
        </span>
        Grafik Penjualan
      </h2>
      
      <div class="flex items-center gap-2 rounded-xl bg-dcelup-creamSoft/70 border border-dcelup-border/60 p-1.5 text-xs font-semibold text-dcelup-textSoft">
        <Calendar class="h-3.5 w-3.5 text-dcelup-red ml-1 shrink-0" />
        <input
          type="date"
          v-model="dashboardStore.chartStartDate"
          class="rounded-lg bg-white px-2 py-1 text-xs font-bold text-dcelup-text outline-none border border-dcelup-border/50 focus:border-dcelup-red"
        />
        <span>s/d</span>
        <input
          type="date"
          v-model="dashboardStore.chartEndDate"
          class="rounded-lg bg-white px-2 py-1 text-xs font-bold text-dcelup-text outline-none border border-dcelup-border/50 focus:border-dcelup-red"
        />
      </div>
    </div>

    <div class="h-64 sm:h-72">
      <Bar :key="dashboardStore.chartStartDate + dashboardStore.chartEndDate" :data="chartData" :options="options" />
    </div>
  </section>
</template>

