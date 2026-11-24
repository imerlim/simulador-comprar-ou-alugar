<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatNumber } from '@/utils/formatters'

const props = defineProps<{
  result: ScenarioResult
}>()

const emit = defineEmits<{
  (e: 'exportCsv'): void
}>()

const viewMode = ref<'monthly' | 'annual'>('monthly')
const filterYear = ref<string>('all')
const onlyMilestones = ref(false)

const availableYears = computed(() => {
  const years = new Set<number>()
  for (const r of props.result.rows) years.add(r.anoCalendario)
  return Array.from(years)
})

const filteredMonthlyRows = computed(() => {
  return props.result.rows.filter((r) => {
    if (filterYear.value !== 'all' && r.anoCalendario !== Number(filterYear.value)) {
      return false
    }
    if (onlyMilestones.value) {
      const m = props.result.milestones
      return (
        r.mes === 1 ||
        r.mes === props.result.input.numeroMeses ||
        r.mes === m.mesAluguelSuperaPrestacao ||
        r.mes === m.mesPicoInvestimento ||
        r.mes === m.mesReservaNegativa ||
        r.mes === m.mesViradaPatrimonialDefinitiva ||
        r.mes % 12 === 0
      )
    }
    return true
  })
})

function rowBadge(mes: number): string | null {
  const m = props.result.milestones
  if (mes === m.mesAluguelSuperaPrestacao) return 'Aluguel > Prestação'
  if (mes === m.mesPicoInvestimento) return 'Pico Investimento'
  if (mes === m.mesReservaNegativa) return 'Saldo Negativo'
  if (mes === props.result.input.numeroMeses) return 'Quitação'
  return null
}
</script>

<template>
  <section class="surface-card overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:px-5">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">
          Tabela Detalhada da Planilha
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Todas as 14 colunas da planilha original com linha de totalização <code class="font-mono">soma -&gt;</code> ao final
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            :class="
              viewMode === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            "
            @click="viewMode = 'monthly'"
          >
            Mensal ({{ result.rows.length }})
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
            :class="
              viewMode === 'annual'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            "
            @click="viewMode = 'annual'"
          >
            Anual ({{ result.annualRows.length }})
          </button>
        </div>

        <select
          v-if="viewMode === 'monthly'"
          v-model="filterYear"
          class="input-field w-auto py-1.5 text-xs"
        >
          <option value="all">Todos os anos</option>
          <option v-for="y in availableYears" :key="y" :value="String(y)">
            Ano {{ y }}
          </option>
        </select>

        <label
          v-if="viewMode === 'monthly'"
          class="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          <input
            v-model="onlyMilestones"
            type="checkbox"
            class="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600"
          />
          <span>Só fechamentos anuais e marcos</span>
        </label>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          @click="emit('exportCsv')"
        >
          <AppIcon name="download" :size="14" />
          <span>CSV</span>
        </button>
      </div>
    </div>

    <!-- Visão Mensal fiel à planilha -->
    <div v-if="viewMode === 'monthly'" class="max-h-[68vh] overflow-auto custom-scrollbar">
      <table class="min-w-full border-collapse text-right text-xs tabular-nums">
        <thead class="sticky top-0 z-10 bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2.5 text-center">Anos</th>
            <th class="px-3 py-2.5 text-center">Nº</th>
            <th class="px-3 py-2.5">Seguros/FGHAB</th>
            <th class="px-3 py-2.5">Prestação</th>
            <th class="px-3 py-2.5">IPTU</th>
            <th class="px-3 py-2.5">COND</th>
            <th class="px-3 py-2.5">Amortização</th>
            <th class="px-3 py-2.5">Juros</th>
            <th class="px-3 py-2.5">Saldo Devedor</th>
            <th class="px-3 py-2.5">Total prestação</th>
            <th class="px-3 py-2.5">Aluguel</th>
            <th class="px-3 py-2.5">Excedente</th>
            <th class="px-3 py-2.5">Investimento</th>
            <th class="px-3 py-2.5">Imóvel atualizado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800/80">
          <tr
            v-for="r in filteredMonthlyRows"
            :key="r.mes"
            class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            :class="r.anoLabel !== null ? 'bg-slate-50/70 font-medium dark:bg-slate-900/40' : ''"
          >
            <td class="px-3 py-2 text-center font-bold text-slate-700 dark:text-slate-200">
              {{ r.anoLabel ?? '' }}
            </td>
            <td class="px-3 py-2 text-center text-slate-600 dark:text-slate-300">
              <div class="inline-flex items-center gap-1">
                <span>{{ r.mes }}</span>
                <span
                  v-if="rowBadge(r.mes)"
                  class="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                >
                  {{ rowBadge(r.mes) }}
                </span>
              </div>
            </td>
            <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ formatNumber(r.seguros) }}</td>
            <td class="px-3 py-2 text-slate-800 dark:text-slate-200">{{ formatNumber(r.prestacao) }}</td>
            <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ formatNumber(r.iptu) }}</td>
            <td class="px-3 py-2 text-slate-500 dark:text-slate-400">{{ formatNumber(r.cond) }}</td>
            <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ formatNumber(r.amortizacao) }}</td>
            <td class="px-3 py-2 text-amber-600 dark:text-amber-400">{{ formatNumber(r.juros) }}</td>
            <td class="px-3 py-2 text-slate-700 dark:text-slate-300">{{ formatNumber(r.saldoDevedor) }}</td>
            <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white">{{ formatNumber(r.totalPrestacao) }}</td>
            <td class="px-3 py-2 text-orange-600 dark:text-orange-400">{{ formatNumber(r.aluguel) }}</td>
            <td
              class="px-3 py-2 font-semibold"
              :class="r.excedente >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ formatNumber(r.excedente) }}
            </td>
            <td
              class="px-3 py-2 font-semibold"
              :class="r.investimento >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ formatNumber(r.investimento) }}
            </td>
            <td class="px-3 py-2 font-semibold text-emerald-700 dark:text-emerald-400">
              {{ formatNumber(r.imovelAtualizado) }}
            </td>
          </tr>
        </tbody>
        <tfoot class="sticky bottom-0 z-10 border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <tr>
            <td class="px-3 py-2.5 text-center">soma -&gt;</td>
            <td class="px-3 py-2.5 text-center">{{ result.rows.length }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(result.summary.totalSeguros) }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(result.summary.totalPrestacaoBase) }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(result.summary.totalIptu) }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(result.summary.totalCond) }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(result.summary.totalAmortizacao) }}</td>
            <td class="px-3 py-2.5 text-amber-600 dark:text-amber-400">{{ formatBRL(result.summary.totalJuros) }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(0) }}</td>
            <td class="px-3 py-2.5">{{ formatBRL(result.summary.totalCondMaisPrest) }}</td>
            <td class="px-3 py-2.5 text-orange-600 dark:text-orange-400">{{ formatBRL(result.summary.totalAluguel) }}</td>
            <td
              class="px-3 py-2.5"
              :class="result.summary.excedenteGuardadoNominal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ formatBRL(result.summary.excedenteGuardadoNominal) }}
            </td>
            <td
              class="px-3 py-2.5"
              :class="result.summary.investimentoFinal >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ formatBRL(result.summary.investimentoFinal) }}
            </td>
            <td class="px-3 py-2.5 text-emerald-700 dark:text-emerald-400">
              {{ formatBRL(result.summary.patrimonioFinalImovel) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Visão Anual -->
    <div v-else class="max-h-[68vh] overflow-auto custom-scrollbar">
      <table class="min-w-full border-collapse text-right text-xs tabular-nums">
        <thead class="sticky top-0 z-10 bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          <tr>
            <th class="px-3 py-2.5 text-center">Ano</th>
            <th class="px-3 py-2.5">Prestação (Ano)</th>
            <th class="px-3 py-2.5">Juros (Ano)</th>
            <th class="px-3 py-2.5">Amortiz. (Ano)</th>
            <th class="px-3 py-2.5">Saldo Devedor</th>
            <th class="px-3 py-2.5">Total Prest. (Ano)</th>
            <th class="px-3 py-2.5">Aluguel (Ano)</th>
            <th class="px-3 py-2.5">Excedente (Ano)</th>
            <th class="px-3 py-2.5">Investimento</th>
            <th class="px-3 py-2.5">Patrim. Compra Líq.</th>
            <th class="px-3 py-2.5">Imóvel Atualizado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800/80">
          <tr
            v-for="a in result.annualRows"
            :key="a.ano"
            class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <td class="px-3 py-2 text-center font-bold text-slate-800 dark:text-slate-100">
              Ano {{ a.ano }}
            </td>
            <td class="px-3 py-2 text-slate-700 dark:text-slate-300">{{ formatBRL(a.prestacaoAno) }}</td>
            <td class="px-3 py-2 text-amber-600 dark:text-amber-400">{{ formatBRL(a.jurosAno) }}</td>
            <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ formatBRL(a.amortizacaoAno) }}</td>
            <td class="px-3 py-2 text-slate-700 dark:text-slate-300">{{ formatBRL(a.saldoDevedorFinal) }}</td>
            <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white">{{ formatBRL(a.totalPrestacaoAno) }}</td>
            <td class="px-3 py-2 text-orange-600 dark:text-orange-400">{{ formatBRL(a.aluguelAno) }}</td>
            <td
              class="px-3 py-2 font-semibold"
              :class="a.excedenteAno >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ formatBRL(a.excedenteAno) }}
            </td>
            <td
              class="px-3 py-2 font-bold"
              :class="a.investimentoFinal >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ formatBRL(a.investimentoFinal) }}
            </td>
            <td class="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">
              {{ formatBRL(a.patrimonioCompraLiquidoFinal) }}
            </td>
            <td class="px-3 py-2 text-slate-700 dark:text-slate-300">
              {{ formatBRL(a.imovelAtualizadoFinal) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
