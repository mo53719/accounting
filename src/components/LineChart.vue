﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { useTransaction } from '../composables/useTransaction'

export type TimeRange = 'day' | 'month' | 'year' | 'all' | 'custom'

const props = withDefaults(
  defineProps<{
    timeRange?: TimeRange
    dateOffset?: number
    customStart?: string
    customEnd?: string
  }>(),
  {
    timeRange: 'month',
    dateOffset: 0,
    customStart: undefined,
    customEnd: undefined,
  }
)

const { transactions } = useTransaction()

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/* 计算当前选中周期的日期范围（与 BarChart 完全一致） */
function getRangeBounds(): { start: dayjs.Dayjs; end: dayjs.Dayjs; unit: 'day' | 'month' } {
  const offset = props.dateOffset ?? 0
  const tr = props.timeRange

  if (tr === 'day') {
    return { start: dayjs().add(offset, 'day'), end: dayjs().add(offset, 'day'), unit: 'day' }
  }
  if (tr === 'month') {
    const m = dayjs().add(offset, 'month')
    return { start: m.startOf('month'), end: m.endOf('month'), unit: 'day' }
  }
  if (tr === 'year') {
    const y = dayjs().add(offset, 'year')
    return { start: y.startOf('year'), end: y.endOf('year'), unit: 'month' }
  }
  if (tr === 'custom' && props.customStart && props.customEnd) {
    return { start: dayjs(props.customStart), end: dayjs(props.customEnd), unit: 'day' }
  }
  // all: 跨度可能跨年，按月聚合
  return { start: dayjs('2000-01-01'), end: dayjs().endOf('month'), unit: 'month' }
}

const chartData = computed(() => {
  const tr = props.timeRange
  const bounds = getRangeBounds()
  const labels: string[] = []
  const incomes: number[] = []
  const expenses: number[] = []

  if (tr === 'day') {
    const target = bounds.start.format('YYYY-MM-DD')
    labels.push(bounds.start.format('MM-DD'))
    incomes.push(transactions.value.filter(t => t.date === target && t.type === 'income').reduce((s, t) => s + t.amount, 0))
    expenses.push(transactions.value.filter(t => t.date === target && t.type === 'expense').reduce((s, t) => s + t.amount, 0))
  } else if (tr === 'month') {
    const days = bounds.end.date()
    for (let d = 1; d <= days; d++) {
      const dateKey = bounds.start.date(d).format('YYYY-MM-DD')
      labels.push(`${d}日`)
      incomes.push(transactions.value.filter(t => t.date === dateKey && t.type === 'income').reduce((s, t) => s + t.amount, 0))
      expenses.push(transactions.value.filter(t => t.date === dateKey && t.type === 'expense').reduce((s, t) => s + t.amount, 0))
    }
  } else if (tr === 'year') {
    for (let m = 0; m < 12; m++) {
      const monthDate = bounds.start.month(m)
      const monthKey = monthDate.format('YYYY-MM')
      labels.push(`${m + 1}月`)
      incomes.push(transactions.value.filter(t => t.date.startsWith(monthKey) && t.type === 'income').reduce((s, t) => s + t.amount, 0))
      expenses.push(transactions.value.filter(t => t.date.startsWith(monthKey) && t.type === 'expense').reduce((s, t) => s + t.amount, 0))
    }
  } else if (tr === 'custom') {
    let cur = bounds.start
    let safety = 0
    while (cur.isBefore(bounds.end) || cur.isSame(bounds.end, 'day')) {
      labels.push(cur.format('MM-DD'))
      const dateKey = cur.format('YYYY-MM-DD')
      incomes.push(transactions.value.filter(t => t.date === dateKey && t.type === 'income').reduce((s, t) => s + t.amount, 0))
      expenses.push(transactions.value.filter(t => t.date === dateKey && t.type === 'expense').reduce((s, t) => s + t.amount, 0))
      cur = cur.add(1, 'day')
      if (++safety > 366) break
    }
  } else {
    // all: 按月聚合全部历史
    if (transactions.value.length === 0) {
      return { labels: [], incomes: [], expenses: [] }
    }
    const monthMap = new Map<string, { income: number; expense: number }>()
    transactions.value.forEach(t => {
      const mk = t.date.substring(0, 7)
      if (!monthMap.has(mk)) monthMap.set(mk, { income: 0, expense: 0 })
      const m = monthMap.get(mk)!
      if (t.type === 'income') m.income += t.amount
      else m.expense += t.amount
    })
    const sorted = Array.from(monthMap.keys()).sort()
    sorted.forEach(mk => {
      labels.push(mk.substring(5) + '月')
      const v = monthMap.get(mk)!
      incomes.push(v.income)
      expenses.push(v.expense)
    })
  }

  return { labels, incomes, expenses }
})

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)

  const data = chartData.value
  if (!data.labels.length) return

  const colorIncome = cssVar('--income', '#69bb9c')
  const colorExpense = cssVar('--expense', '#e77f67')
  const colorDivider = cssVar('--divider', '#e9eceb')
  const colorTextWeak = cssVar('--text-weak', '#949494')
  const colorText = cssVar('--text-h2', '#333333')
  const colorCardBg = cssVar('--card-bg', '#ffffff')

  // 横轴标签自动间隔（与 BarChart 完全一致）
  let labelInterval: number | 'auto' = 0
  if (props.timeRange === 'month') {
    const n = data.labels.length
    labelInterval = n > 14 ? Math.floor(n / 10) : 0
  } else if (props.timeRange === 'custom' || props.timeRange === 'year') {
    labelInterval = 'auto'
  } else if (props.timeRange === 'day') {
    labelInterval = 0
  } else {
    labelInterval = data.labels.length > 12 ? Math.floor(data.labels.length / 10) : 0
  }

  chart.setOption(
    {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' },   // 折线图用 line pointer
        backgroundColor: colorCardBg,
        borderColor: colorDivider,
        borderWidth: 1,
        textStyle: { color: colorText, fontSize: 12 },
        formatter: (params: any) => {
          let s = `<div style="color:${colorText};font-weight:600;">${params[0].axisValue}</div>`
          params.forEach((p: any) => {
            s += `<div style="color:${p.color};font-size:12px;margin-top:4px;">● ${p.seriesName}: ¥${p.value.toFixed(2)}</div>`
          })
          return s
        }
      },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontSize: 11, color: colorTextWeak }
      },
      grid: { left: '4%', right: '4%', bottom: '20%', top: '6%', containLabel: true },
      animationDuration: 200,
      animationDurationUpdate: 200,
      xAxis: {
        type: 'category',
        data: data.labels,
        boundaryGap: false,
        axisLabel: {
          fontSize: 10,
          color: colorTextWeak,
          interval: labelInterval,        // 与 BarChart 一致：动态间隔
          hideOverlap: true,             // 与 BarChart 一致：自动重叠检测
          rotate: 0
        },
        axisLine: { lineStyle: { color: colorDivider } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontSize: 10, color: colorTextWeak, formatter: '{value}' },
        splitLine: { lineStyle: { color: colorDivider, type: 'solid', width: 1 } },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: data.incomes,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: colorIncome },
          lineStyle: { width: 2, color: colorIncome },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(colorIncome, 0.25) },
              { offset: 1, color: hexToRgba(colorIncome, 0.02) }
            ])
          }
        },
        {
          name: '支出',
          type: 'line',
          data: data.expenses,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: colorExpense },
          lineStyle: { width: 2, color: colorExpense },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: hexToRgba(colorExpense, 0.25) },
              { offset: 1, color: hexToRgba(colorExpense, 0.02) }
            ])
          }
        }
      ]
    },
    { notMerge: true }   // 与 BarChart 一致：强制重绘
  )
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

// 联动渲染（与 BarChart 完全一致：监听 timeRange / dateOffset / customStart / customEnd / transactions）
watch(
  () => [props.timeRange, props.dateOffset, props.customStart, props.customEnd, transactions.value],
  () => renderChart(),
  { deep: true }
)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 200px;
  padding: 0;
  margin: 0;
}
</style>
