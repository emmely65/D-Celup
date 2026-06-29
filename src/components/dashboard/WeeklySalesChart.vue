<script setup>
import { computed, ref, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { formatRupiah } from '@/utils/currency'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
const period = ref('weekly')

const loadData = async () => {
  await dashboardStore.fetchWeeklySales({ period: period.value })
}

onMounted(() => {
  // If not yet loaded, load it. DashboardView usually loads it but we have our own period state now.
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
      backgroundColor: '#C61F1F', // dcelup red
      borderRadius: 4
    }
  ]
  
  if (authStore.isAdmin) {
    datasets.push({
      label: 'Pengeluaran',
      data: items.map((item) => Number(item.total_expense ?? 0)),
      backgroundColor: '#FBBF24', // yellow/amber
      borderRadius: 4
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
    legend: { display: authStore.isAdmin, position: 'bottom' },
    tooltip: {
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
      ticks: {
        callback: function(value) {
          return value >= 1000 ? (value / 1000) + 'k' : value;
        }
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
  <section class="rounded-xl border border-dcelup-border bg-dcelup-creamSoft p-4">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-extrabold text-dcelup-text">Grafik Penjualan</h2>
      <select v-model="period" @change="loadData" class="rounded-lg border border-dcelup-border bg-white px-3 py-1.5 text-sm font-medium text-dcelup-text outline-none focus:border-dcelup-red">
        <option value="weekly">Mingguan</option>
        <option value="monthly">Bulanan</option>
      </select>
    </div>
    <div class="h-64">
      <Bar :data="chartData" :options="options" />
    </div>
  </section>
</template>
