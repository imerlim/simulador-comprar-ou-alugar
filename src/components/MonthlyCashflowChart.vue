<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatCompactBRL } from '@/utils/formatters'

const props = defineProps<{
  result: ScenarioResult
}>()

const svgWidth = 820
const svgHeight = 270
const pad = { top: 20, right: 20, bottom: 36, left: 75 }
const plotW = svgWidth - pad.left - pad.right
const plotH = svgHeight - pad.top - pad.bottom

const hoverIndex = ref<number | null>(null)

const chartSeries = computed(() => {
  const rows = props.result.rows
  if (rows.length <= 60) return rows
  return rows.filter((r, idx) => idx === 0 || r.mes % 6 === 0 || idx === rows.length - 1)
})

const bounds = computed(() => {
  let maxVal = 0
  for (const r of chartSeries.value) {
    if (r.totalPrestacao > maxVal) maxVal = r.totalPrestacao
    if (r.aluguel > maxVal) maxVal = r.aluguel
  }
  if (maxVal <= 0) maxVal = 1000
  return {
    min: 0,
    max: maxVal * 1.1,
  }
})

function xForMonth(mes: number): number {
  const total = Math.max(1, props.result.input.numeroMeses - 1)
  return pad.left + ((mes - 1) / total) * plotW
}

function yForValue(val: number): number {
  const { min, max } = bounds.value
  const ratio = (val - min) / (max - min)
  return pad.top + plotH - ratio * plotH
}

const pathPrestacao = computed(() =>
  chartSeries.value
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${xForMonth(r.mes).toFixed(1)} ${yForValue(r.totalPrestacao).toFixed(1)}`)
    .join(' '),
)

const pathAluguel = computed(() =>
  chartSeries.value
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${xForMonth(r.mes).toFixed(1)} ${yForValue(r.aluguel).toFixed(1)}`)
    .join(' '),
)

const yTicks = computed(() => {
  const { min, max } = bounds.value
  const ticks: { value: number; y: number }[] = []
  for (let i = 0; i <= 4; i++) {
    const val = min + ((max - min) * i) / 4
    ticks.push({ value: val, y: yForValue(val) })
  }
  return ticks
})

const xTicks = computed(() => {
  const totalYears = Math.max(1, Math.round(props.result.input.numeroMeses / 12))
  const step = totalYears <= 10 ? 2 : 5
  const ticks: { label: string; x: number }[] = [{ label: 'Mês 1', x: xForMonth(1) }]
  for (let y = step; y <= totalYears; y += step) {
    const mes = Math.min(props.result.input.numeroMeses, y * 12)
    ticks.push({ label: `${y}a`, x: xForMonth(mes) })
  }
  return ticks
})

const hoveredRow = computed(() => {
  if (hoverIndex.value === null) return null
  return chartSeries.value[hoverIndex.value] ?? null
})

function handlePointerMove(event: MouseEvent | TouchEvent) {
  const svg = event.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const clientX =
    'touches' in event ? event.touches[0]?.clientX ?? rect.left : event.clientX
  const relX = ((clientX - rect.left) / rect.width) * svgWidth
  let bestIdx = 0
  let bestDist = Infinity
  chartSeries.value.forEach((r, idx) => {
    const dist = Math.abs(xForMonth(r.mes) - relX)
    if (dist < bestDist) {
      bestDist = dist
      bestIdx = idx
    }
  })
  hoverIndex.value = bestIdx
}
</script>

<template>
  <section class="surface-card p-4 sm:p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
          Fluxo Mensal: Total da Prestação vs. Aluguel
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Quando a linha do aluguel cruza acima da prestação, o excedente torna-se negativo (custo extra para o inquilino)
        </p>
      </div>
    </div>

    <div class="relative">
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="h-56 w-full select-none overflow-visible sm:h-64"
        @mousemove="handlePointerMove"
        @touchmove.prevent="handlePointerMove"
        @mouseleave="hoverIndex = null"
      >
        <g v-for="(tick, idx) in yTicks" :key="idx">
          <line
            :x1="pad.left"
            :x2="svgWidth - pad.right"
            :y1="tick.y"
            :y2="tick.y"
            stroke="var(--grid-line)"
            stroke-dasharray="3 3"
          />
          <text
            :x="pad.left - 8"
            :y="tick.y + 4"
            text-anchor="end"
            class="fill-slate-500 text-[10px] dark:fill-slate-400 tabular-nums"
          >
            {{ formatCompactBRL(tick.value) }}
          </text>
        </g>

        <g v-for="(tick, idx) in xTicks" :key="idx">
          <text
            :x="tick.x"
            :y="svgHeight - 10"
            text-anchor="middle"
            class="fill-slate-500 text-[10px] dark:fill-slate-400 tabular-nums"
          >
            {{ tick.label }}
          </text>
        </g>

        <path
          :d="pathPrestacao"
          fill="none"
          stroke="#10b981"
          stroke-width="2.75"
          stroke-linecap="round"
        />
        <path
          :d="pathAluguel"
          fill="none"
          stroke="#f97316"
          stroke-width="2.75"
          stroke-linecap="round"
        />

        <!-- Marcador de cruzamento -->
        <line
          v-if="result.milestones.mesAluguelSuperaPrestacao"
          :x1="xForMonth(result.milestones.mesAluguelSuperaPrestacao)"
          :x2="xForMonth(result.milestones.mesAluguelSuperaPrestacao)"
          :y1="pad.top"
          :y2="svgHeight - pad.bottom"
          stroke="#f97316"
          stroke-dasharray="4 4"
          stroke-width="1.2"
        />

        <g v-if="hoveredRow">
          <line
            :x1="xForMonth(hoveredRow.mes)"
            :x2="xForMonth(hoveredRow.mes)"
            :y1="pad.top"
            :y2="svgHeight - pad.bottom"
            stroke="currentColor"
            class="text-slate-400 dark:text-slate-500"
            stroke-width="1"
          />
          <circle
            :cx="xForMonth(hoveredRow.mes)"
            :cy="yForValue(hoveredRow.totalPrestacao)"
            r="4.5"
            fill="#10b981"
            stroke="white"
            stroke-width="1.5"
          />
          <circle
            :cx="xForMonth(hoveredRow.mes)"
            :cy="yForValue(hoveredRow.aluguel)"
            r="4.5"
            fill="#f97316"
            stroke="white"
            stroke-width="1.5"
          />
        </g>
      </svg>

      <div
        v-if="hoveredRow"
        class="pointer-events-none absolute top-2 z-10 w-60 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        :class="xForMonth(hoveredRow.mes) > svgWidth * 0.62 ? 'left-4' : 'right-4'"
      >
        <div class="mb-1.5 flex justify-between border-b border-slate-200 pb-1 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100 tabular-nums">
          <span>Mês {{ hoveredRow.mes }}</span>
          <span>Ano {{ hoveredRow.anoCalendario }}</span>
        </div>
        <div class="space-y-1 tabular-nums">
          <div class="flex justify-between">
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Total Prestação:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ formatBRL(hoveredRow.totalPrestacao) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-orange-600 dark:text-orange-400 font-semibold">Aluguel:</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ formatBRL(hoveredRow.aluguel) }}</span>
          </div>
          <div class="flex justify-between border-t border-slate-200 pt-1 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Excedente do mês:</span>
            <span
              class="font-bold"
              :class="hoveredRow.excedente >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'"
            >
              {{ formatBRL(hoveredRow.excedente) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
      <span class="flex items-center gap-1.5 font-medium">
        <span class="h-1 w-5 rounded-full bg-emerald-500" />
        Total Prestação (Parcela + IPTU + Cond.)
      </span>
      <span class="flex items-center gap-1.5 font-medium">
        <span class="h-1 w-5 rounded-full bg-orange-500" />
        Aluguel Mensal
      </span>
      <span v-if="result.milestones.mesAluguelSuperaPrestacao" class="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 tabular-nums">
        <span class="h-3 w-0.5 border-l-2 border-dashed border-orange-500" />
        Virada no mês {{ result.milestones.mesAluguelSuperaPrestacao }}
      </span>
    </div>
  </section>
</template>
