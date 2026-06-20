<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useTransaction } from '../composables/useTransaction'
import { useCategoryStore } from '../stores/category'

const { transactions } = useTransaction()
const categoryStore = useCategoryStore()

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

/* 柔和色板（围绕支出主色派生） */
const paletteCache: string[] = []
function getPalette(): string[] {
  if (paletteCache.length) return paletteCache
  const base = cssVar('--expense', '#e77f67')
  const primary = cssVar('--primary', '#52a88c')
  const income = cssVar('--income', '#69bb9c')
  const gold = cssVar('--vip-gold', '#cfa967')
  const expDark = cssVar('--expense-dark', '#C9664F')
  paletteCache.push(
    base,
    primary,
    income,
    gold,
    expDark,
    '#9b8bb8',
    '#7eb2d9',
    '#d98ea6',
    '#b8a87e',
    '#7ea89a',
  )
  return paletteCache
}

const chartData = computed(() => {
  const map: Record<string, number> = {}
  for (const t of transactions.value) {
    if (t.type === 'expense') {
      map[t.category] = (map[t.category] || 0) + t.amount
    }
  }
  const palette = getPalette()
  return Object.entries(map).map(([name, value], i) => {
    const cat = categoryStore.findCategory(name, 'expense')
    return {
      name,
      value,
      itemStyle: { color: cat?.color || palette[i % palette.length] }
    }
  })
})

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const data = chartData.value
  if (!data.length) return

  const colorDivider = cssVar('--divider', '#e9eceb')
  const colorTextWeak = cssVar('--text-weak', '#949494')
  const colorText = cssVar('--text-h2', '#333333')
  const colorCardBg = cssVar('--card-bg', '#ffffff')

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)',
      backgroundColor: colorCardBg,
      borderColor: colorDivider,
      borderWidth: 1,
      textStyle: { color: colorText, fontSize: 12 }
    },
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      textStyle: { fontSize: 11, color: colorTextWeak }
    },
    series: [{
      type: 'pie',
      radius: ['36%', '56%'],
      center: ['50%', '40%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 10,
        color: colorText
      },
      labelLine: { length: 6, length2: 6 },
      data,
      itemStyle: { borderRadius: 4, borderColor: colorCardBg, borderWidth: 2 }
    }]
  })
}

function handleResize() { chart?.resize() }

onMounted(async () => {
  await nextTick()
  renderChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})

watch(chartData, () => renderChart(), { deep: true })
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 200px;
}
</style>
