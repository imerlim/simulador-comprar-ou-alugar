<script setup lang="ts">
import { computed } from 'vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatPercent } from '@/utils/formatters'

const props = defineProps<{
  result: ScenarioResult
}>()

const totalDesembolsoCompra = computed(() => {
  return props.result.input.entradaImovel + props.result.summary.totalCondMaisPrest
})

const breakdownItems = computed(() => {
  const s = props.result.summary
  const totalTaxaAdm = props.result.input.taxaAdm * props.result.input.numeroMeses
  const items = [
    {
      label: 'Entrada',
      value: props.result.input.entradaImovel,
      color: 'bg-teal-500',
    },
    {
      label: 'Amortização',
      value: s.totalAmortizacao,
      color: 'bg-emerald-500',
    },
    {
      label: 'Juros (CET)',
      value: s.totalJuros,
      color: 'bg-amber-500',
    },
    {
      label: 'Seguros / FGHAB',
      value: s.totalSeguros,
      color: 'bg-violet-500',
    },
    {
      label: 'Taxa Adm',
      value: totalTaxaAdm,
      color: 'bg-sky-500',
    },
    {
      label: 'Condomínio + IPTU',
      value: s.totalCond + s.totalIptu,
      color: 'bg-rose-500',
    },
  ]

  const total = Math.max(1, totalDesembolsoCompra.value)
  return items.map((item) => ({
    ...item,
    pct: (item.value / total) * 100,
  }))
})
</script>

<template>
  <section class="surface-card p-4 sm:p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
          Raio-X dos Custos Totais até o Fim do Contrato
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Distribuição de cada real desembolsado na compra vs. total gasto apenas com aluguel
        </p>
      </div>
      <div class="text-right text-xs tabular-nums">
        <span class="text-slate-500 dark:text-slate-400">Desembolso total compra (c/ entrada): </span>
        <strong class="text-slate-900 dark:text-white">{{ formatBRL(totalDesembolsoCompra) }}</strong>
      </div>
    </div>

    <!-- Barra empilhada -->
    <div class="flex h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        v-for="item in breakdownItems"
        :key="item.label"
        :class="item.color"
        :style="{ width: `${item.pct}%` }"
        :title="`${item.label}: ${formatBRL(item.value)} (${item.pct.toFixed(1)}%)`"
        class="h-full transition-all duration-300"
      />
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 text-xs">
      <div
        v-for="item in breakdownItems"
        :key="item.label"
        class="surface-elevated p-2.5"
      >
        <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span class="h-2.5 w-2.5 rounded-full" :class="item.color" />
          <span class="truncate">{{ item.label }}</span>
        </div>
        <p class="mt-1 font-bold text-slate-900 dark:text-white tabular-nums">
          {{ formatBRL(item.value) }}
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
          {{ formatPercent(item.pct / 100, 1) }}
        </p>
      </div>
    </div>
  </section>
</template>
