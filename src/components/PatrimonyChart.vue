<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatCompactBRL } from '@/utils/formatters'

const props = defineProps<{
  result: ScenarioResult
  horizonMonth: number
}>()

const svgWidth = 820
const svgHeight = 320
const pad = { top: 20, right: 20, bottom: 38, left: 80 }
const plotW = svgWidth - pad.left - pad.right
const plotH = svgHeight - pad.top - pad.bottom

const hoverIndex = ref<number | null>(null)
const showGrossProperty = ref(true)

const chartSeries = computed(() => {
  const rows = props.result.rows
  // Amostra ponto inicial + fins de ano (ou todos os meses se <= 60 meses)
  if (rows.length <= 60) {
    return rows
  }
  return rows.filter((r, idx) => idx === 0 || r.mes % 6 === 0 || idx === rows.length - 1)
})

const bounds = computed(() => {
  let minVal = 0
  let maxVal = 0
  for (const r of chartSeries.value) {
    const candidates = [r.investimento, r.patrimonioCompraLiquido]
    if (showGrossProperty.value) candidates.push(r.imovelAtualizado)
    for (const v of candidates) {
      if (v < minVal) minVal = v
      if (v > maxVal) maxVal = v
    }
  }
  if (maxVal === minVal) {
    maxVal = minVal + 1000
  }
  const span = maxVal - minVal
  return {
    min: minVal - span * 0.06,
    max: maxVal + span * 0.08,
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

function buildPath(getter: (r: (typeof chartSeries.value)[number]) => number): string {
  return chartSeries.value
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${xForMonth(r.mes).toFixed(1)} ${yForValue(getter(r)).toFixed(1)}`)
    .join(' ')
}

const pathImovel = computed(() => buildPath((r) => r.imovelAtualizado))
const pathCompraLiquido = computed(() => buildPath((r) => r.patrimonioCompraLiquido))
const pathInvestimento = computed(() => buildPath((r) => r.investimento))

const zeroY = computed(() => {
  const { min, max } = bounds.value
  if (min > 0 || max < 0) return null
  return yForValue(0)
})

const yTicks = computed(() => {
  const { min, max } = bounds.value
  const count = 5
  const ticks: { value: number; y: number }[] = []
  for (let i = 0; i <= count; i++) {
    const val = min + ((max - min) * i) / count
    ticks.push({ value: val, y: yForValue(val) })
  }
  return ticks
})

const xTicks = computed(() => {
  const totalYears = Math.max(1, Math.round(props.result.input.numeroMeses / 12))
  const step = totalYears <= 10 ? 2 : totalYears <= 25 ? 5 : 5
  const ticks: { label: string; x: number }[] = [{ label: 'Início', x: xForMonth(1) }]
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

const horizonX = computed(() => xForMonth(props.horizonMonth))
</script>

<template>
  <section class="surface-card p-4 sm:p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
          Evolução do Patrimônio ao Longo do Tempo
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Compare o valor líquido do imóvel (já descontando saldo devedor) vs. saldo acumulado investindo a diferença
        </p>
      </div>

      <label class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
        <input
          v-model="showGrossProperty"
          type="checkbox"
          class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span>Exibir valor bruto do imóvel</span>
      </label>
    </div>

    <div class="relative">
      <svg
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="h-64 w-full select-none overflow-visible sm:h-80"
        @mousemove="handlePointerMove"
        @touchmove.prevent="handlePointerMove"
        @mouseleave="hoverIndex = null"
      >
        <!-- Grid Y -->
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

        <!-- Zero axis highlight -->
        <line
          v-if="zeroY !== null"
          :x1="pad.left"
          :x2="svgWidth - pad.right"
          :y1="zeroY"
          :y2="zeroY"
          stroke="currentColor"
          class="text-slate-400 dark:text-slate-500"
          stroke-width="1.2"
        />

        <!-- X ticks -->
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

        <!-- Marcador de horizonte -->
        <line
          :x1="horizonX"
          :x2="horizonX"
          :y1="pad.top"
          :y2="svgHeight - pad.bottom"
          stroke="#f59e0b"
          stroke-width="1.5"
          stroke-dasharray="4 4"
        />

        <!-- Linhas -->
        <path
          v-if="showGrossProperty"
          :d="pathImovel"
          fill="none"
          stroke="#14b8a6"
          stroke-width="2"
          stroke-dasharray="5 4"
          stroke-linecap="round"
        />
        <path
          :d="pathCompraLiquido"
          fill="none"
          stroke="#10b981"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          :d="pathInvestimento"
          fill="none"
          stroke="#3b82f6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Crosshair e pontos no hover -->
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
            v-if="showGrossProperty"
            :cx="xForMonth(hoveredRow.mes)"
            :cy="yForValue(hoveredRow.imovelAtualizado)"
            r="4"
            fill="#14b8a6"
            stroke="white"
            stroke-width="1.5"
          />
          <circle
            :cx="xForMonth(hoveredRow.mes)"
            :cy="yForValue(hoveredRow.patrimonioCompraLiquido)"
            r="5"
            fill="#10b981"
            stroke="white"
            stroke-width="1.5"
          />
          <circle
            :cx="xForMonth(hoveredRow.mes)"
            :cy="yForValue(hoveredRow.investimento)"
            r="5"
            fill="#3b82f6"
            stroke="white"
            stroke-width="1.5"
          />
        </g>
      </svg>

      <!-- Tooltip flutuante -->
      <div
        v-if="hoveredRow"
        class="pointer-events-none absolute top-2 z-10 w-64 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
        :class="
          xForMonth(hoveredRow.mes) > svgWidth * 0.62 ? 'left-4' : 'right-4'
        "
      >
        <div class="mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100 tabular-nums">
          <span>Mês {{ hoveredRow.mes }}</span>
          <span>Ano {{ (hoveredRow.mes / 12).toFixed(1) }}</span>
        </div>
        <div class="space-y-1 tabular-nums">
          <div class="flex justify-between">
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Compra (Líquido):</span>
            <span class="font-bold text-slate-900 dark:text-white">{{ formatBRL(hoveredRow.patrimonioCompraLiquido) }}</span>
          </div>
          <div v-if="showGrossProperty" class="flex justify-between">
            <span class="text-teal-600 dark:text-teal-400">Imóvel atualizado:</span>
            <span class="text-slate-700 dark:text-slate-300">{{ formatBRL(hoveredRow.imovelAtualizado) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-blue-600 dark:text-blue-400 font-semibold">Investimento:</span>
            <span class="font-bold" :class="hoveredRow.investimento < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'">
              {{ formatBRL(hoveredRow.investimento) }}
            </span>
          </div>
          <div class="flex justify-between border-t border-slate-200 pt-1 dark:border-slate-700">
            <span class="text-slate-500 dark:text-slate-400">Saldo devedor:</span>
            <span class="text-slate-700 dark:text-slate-300">{{ formatBRL(hoveredRow.saldoDevedor) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legenda -->
    <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
      <span class="flex items-center gap-1.5 font-medium">
        <span class="h-1 w-5 rounded-full bg-emerald-500" />
        Patrimônio Líquido Compra (Imóvel - Saldo Devedor)
      </span>
      <span class="flex items-center gap-1.5 font-medium">
        <span class="h-1 w-5 rounded-full bg-blue-500" />
        Investimento (Entrada + Excedente)
      </span>
      <span v-if="showGrossProperty" class="flex items-center gap-1.5">
        <span class="h-0.5 w-5 border-t-2 border-dashed border-teal-500" />
        Valor Bruto do Imóvel
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-3 w-0.5 border-l-2 border-dashed border-amber-500" />
        Horizonte selecionado
      </span>
    </div>
  </section>
</template>
