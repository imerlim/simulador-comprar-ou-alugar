<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatCompactBRL, formatMonthDuration, formatPercent } from '@/utils/formatters'

const props = defineProps<{
  results: ScenarioResult[]
  activeId: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'create'): void
}>()

const svgWidth = 820
const svgHeight = 290
const pad = { top: 20, right: 20, bottom: 38, left: 82 }
const plotW = svgWidth - pad.left - pad.right
const plotH = svgHeight - pad.top - pad.bottom

const hoverMonth = ref<number | null>(null)

const maxMonths = computed(() =>
  Math.max(...props.results.map((r) => r.input.numeroMeses), 12),
)

const bounds = computed(() => {
  let minVal = 0
  let maxVal = 0
  for (const res of props.results) {
    for (const r of res.rows) {
      // Vantagem = patrimonioCompraLiquido - investimento (>0 compra vence, <0 aluguel+inv vence)
      const adv = r.patrimonioCompraLiquido - r.investimento
      if (adv < minVal) minVal = adv
      if (adv > maxVal) maxVal = adv
    }
  }
  if (maxVal === minVal) maxVal = minVal + 1000
  const span = maxVal - minVal
  return { min: minVal - span * 0.08, max: maxVal + span * 0.08 }
})

function xForMonth(mes: number): number {
  const denom = Math.max(1, maxMonths.value - 1)
  return pad.left + ((mes - 1) / denom) * plotW
}

function yForValue(val: number): number {
  const { min, max } = bounds.value
  return pad.top + plotH - ((val - min) / (max - min)) * plotH
}

const zeroY = computed(() => yForValue(0))

const seriesPaths = computed(() =>
  props.results.map((res) => {
    const sampled =
      res.rows.length <= 60
        ? res.rows
        : res.rows.filter((r, i) => i === 0 || r.mes % 6 === 0 || i === res.rows.length - 1)
    const d = sampled
      .map((r, i) => {
        const adv = r.patrimonioCompraLiquido - r.investimento
        return `${i === 0 ? 'M' : 'L'} ${xForMonth(r.mes).toFixed(1)} ${yForValue(adv).toFixed(1)}`
      })
      .join(' ')
    return {
      id: res.input.id,
      name: res.input.name,
      color: res.input.color,
      d,
    }
  }),
)

const yTicks = computed(() => {
  const { min, max } = bounds.value
  return [0, 1, 2, 3, 4].map((i) => {
    const val = min + ((max - min) * i) / 4
    return { value: val, y: yForValue(val) }
  })
})

const xTicks = computed(() => {
  const totalYears = Math.max(1, Math.round(maxMonths.value / 12))
  const step = totalYears <= 10 ? 2 : 5
  const ticks: { label: string; x: number }[] = [{ label: 'Início', x: xForMonth(1) }]
  for (let y = step; y <= totalYears; y += step) {
    ticks.push({ label: `${y}a`, x: xForMonth(Math.min(maxMonths.value, y * 12)) })
  }
  return ticks
})

function handlePointerMove(event: MouseEvent | TouchEvent) {
  const svg = event.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const clientX =
    'touches' in event ? event.touches[0]?.clientX ?? rect.left : event.clientX
  const relX = ((clientX - rect.left) / rect.width) * svgWidth
  const ratio = Math.max(0, Math.min(1, (relX - pad.left) / plotW))
  hoverMonth.value = Math.max(1, Math.round(1 + ratio * (maxMonths.value - 1)))
}

const hoverValues = computed(() => {
  if (hoverMonth.value === null) return []
  const m = hoverMonth.value
  return props.results.map((res) => {
    const row = res.rows[Math.min(m, res.rows.length) - 1]
    const adv = row.patrimonioCompraLiquido - row.investimento
    return {
      id: res.input.id,
      name: res.input.name,
      color: res.input.color,
      adv,
      capped: m > res.rows.length,
    }
  })
})
</script>

<template>
  <div class="space-y-5">
    <section class="surface-card p-4 sm:p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">
            Comparativo de Vantagem Patrimonial Entre Cenários
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Acima da linha zero (+): <strong>Comprar</strong> está na frente. Abaixo da linha zero (-): <strong>Alugar + Investir</strong> está na frente.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
          @click="emit('create')"
        >
          <AppIcon name="plus" :size="15" />
          <span>Adicionar Cenário</span>
        </button>
      </div>

      <div class="relative">
        <svg
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          class="h-64 w-full select-none overflow-visible sm:h-72"
          @mousemove="handlePointerMove"
          @touchmove.prevent="handlePointerMove"
          @mouseleave="hoverMonth = null"
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

          <!-- Linha de empate (0) -->
          <line
            :x1="pad.left"
            :x2="svgWidth - pad.right"
            :y1="zeroY"
            :y2="zeroY"
            stroke="currentColor"
            class="text-slate-400 dark:text-slate-500"
            stroke-width="1.5"
          />

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
            v-for="s in seriesPaths"
            :key="s.id"
            :d="s.d"
            fill="none"
            :stroke="s.color"
            :stroke-width="s.id === activeId ? 3.5 : 2.25"
            :opacity="s.id === activeId ? 1 : 0.78"
            stroke-linecap="round"
          />

          <line
            v-if="hoverMonth !== null"
            :x1="xForMonth(hoverMonth)"
            :x2="xForMonth(hoverMonth)"
            :y1="pad.top"
            :y2="svgHeight - pad.bottom"
            stroke="currentColor"
            class="text-slate-400 dark:text-slate-500"
            stroke-width="1"
          />
        </svg>

        <div
          v-if="hoverMonth !== null"
          class="pointer-events-none absolute top-2 z-10 w-64 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
          :class="xForMonth(hoverMonth) > svgWidth * 0.62 ? 'left-4' : 'right-4'"
        >
          <div class="mb-1.5 border-b border-slate-200 pb-1 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-100 tabular-nums">
            Mês {{ hoverMonth }} ({{ formatMonthDuration(hoverMonth) }})
          </div>
          <div class="space-y-1 tabular-nums">
            <div v-for="item in hoverValues" :key="item.id" class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-1.5 truncate text-slate-600 dark:text-slate-300">
                <span class="h-2 w-2 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" />
                <span class="truncate">{{ item.name }}</span>
              </span>
              <span
                class="shrink-0 font-bold"
                :class="item.adv >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'"
              >
                {{ item.adv >= 0 ? 'Compra +' : 'Alug+Inv +' }}{{ formatCompactBRL(Math.abs(item.adv)) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-3 text-xs">
        <button
          v-for="res in results"
          :key="res.input.id"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 transition"
          :class="
            res.input.id === activeId
              ? 'border-slate-400 bg-slate-100 font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
          "
          @click="emit('select', res.input.id)"
        >
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: res.input.color }" />
          <span>{{ res.input.name }}</span>
        </button>
      </div>
    </section>

    <!-- Tabela lado a lado -->
    <section class="surface-card overflow-hidden">
      <div class="border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 sm:px-5">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
          Quadro Comparativo Completo
        </h3>
      </div>

      <div class="overflow-x-auto custom-scrollbar">
        <table class="min-w-full text-left text-xs tabular-nums">
          <thead class="bg-slate-100/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
            <tr>
              <th class="px-4 py-3">Cenário</th>
              <th class="px-4 py-3">Imóvel / Entrada</th>
              <th class="px-4 py-3">Prazo / Sistema</th>
              <th class="px-4 py-3">CET / Rentab.</th>
              <th class="px-4 py-3">1ª Prest. vs Aluguel</th>
              <th class="px-4 py-3">Patrimônio Imóvel</th>
              <th class="px-4 py-3">Investimento Final</th>
              <th class="px-4 py-3">Veredito Final</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr
              v-for="res in results"
              :key="res.input.id"
              class="cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              :class="res.input.id === activeId ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''"
              @click="emit('select', res.input.id)"
            >
              <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: res.input.color }" />
                  <span>{{ res.input.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                <div>{{ formatBRL(res.input.valorImovel) }}</div>
                <div class="text-[11px] text-slate-500">Entr.: {{ formatBRL(res.input.entradaImovel) }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                <div>{{ res.input.numeroMeses }}m ({{ (res.input.numeroMeses / 12).toFixed(0) }}a)</div>
                <div class="text-[11px] text-slate-500">{{ res.input.sistemaAmortizacao }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                <div>CET: {{ formatPercent(res.input.cetJurosAM, 3) }} a.m.</div>
                <div class="text-[11px] text-slate-500">Inv: {{ formatPercent(res.input.rentabilidadeInvestimentoAM, 2) }} a.m.</div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                <div>{{ formatBRL(res.summary.prestacaoInicial) }}</div>
                <div class="text-[11px] text-slate-500">Alug: {{ formatBRL(res.input.precoAluguelInicial) }}</div>
              </td>
              <td class="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                {{ formatBRL(res.summary.patrimonioFinalImovel) }}
              </td>
              <td
                class="px-4 py-3 font-semibold"
                :class="res.summary.investimentoFinal < 0 ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400'"
              >
                {{ formatBRL(res.summary.investimentoFinal) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
                  :class="
                    res.summary.vencedor === 'buy'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                  "
                >
                  {{ res.summary.vencedor === 'buy' ? 'Comprar +' : 'Alugar+Inv +' }}
                  {{ formatBRL(res.summary.vantagemValor) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
