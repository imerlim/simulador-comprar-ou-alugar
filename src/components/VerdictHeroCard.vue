<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { evaluateAtHorizon } from '@/composables/useFinancialEngine'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatMonthDuration } from '@/utils/formatters'

const props = defineProps<{
  result: ScenarioResult
  horizonMonth: number
}>()

const emit = defineEmits<{
  (e: 'update:horizonMonth', month: number): void
}>()

const snapshot = computed(() => evaluateAtHorizon(props.result, props.horizonMonth))

const maxBarValue = computed(() => {
  const buy = Math.max(0, snapshot.value.patrimonioCompraLiquido)
  const inv = Math.max(0, snapshot.value.investimento)
  return Math.max(buy, inv, 1)
})

const buyBarPct = computed(() => {
  const val = Math.max(0, snapshot.value.patrimonioCompraLiquido)
  return Math.min(100, Math.round((val / maxBarValue.value) * 100))
})

const investBarPct = computed(() => {
  const val = Math.max(0, snapshot.value.investimento)
  return Math.min(100, Math.round((val / maxBarValue.value) * 100))
})

const yearShortcuts = computed(() => {
  const totalYears = Math.floor(props.result.input.numeroMeses / 12)
  const marks = [5, 10, 15, 20, 25, 30].filter((y) => y < totalYears)
  return marks.map((y) => ({ label: `${y}a`, month: y * 12 }))
})

const smartDiagnostic = computed(() => {
  const s = snapshot.value
  const totalMeses = props.result.input.numeroMeses
  const isFinal = s.mes === totalMeses
  const { mesAluguelSuperaPrestacao, mesReservaNegativa } = props.result.milestones

  if (s.vencedorLiquido === 'buy') {
    const parts: string[] = []
    parts.push(
      `No horizonte de ${formatMonthDuration(s.mes)}, comprar o imóvel gera ${formatBRL(s.vantagemLiquida)} a mais de patrimônio líquido do que alugar e investir a diferença.`,
    )
    if (mesAluguelSuperaPrestacao && s.mes >= mesAluguelSuperaPrestacao) {
      parts.push(
        `A partir do mês ${mesAluguelSuperaPrestacao} (${formatMonthDuration(mesAluguelSuperaPrestacao)}), o aluguel reajustado supera a prestação total.`,
      )
    }
    if (s.investimento < 0 && mesReservaNegativa && s.mes >= mesReservaNegativa) {
      parts.push(
        `A reserva financeira inicial + excedentes anteriores esgotou-se no mês ${mesReservaNegativa}, pois os aluguéis acumulados superaram o fluxo do financiamento.`,
      )
    } else if (isFinal) {
      parts.push(
        `Ao final do contrato, você terá um imóvel quitado avaliado em ${formatBRL(s.imovelAtualizado)}.`,
      )
    }
    return parts.join(' ')
  }

  if (s.vencedorLiquido === 'invest') {
    return `No horizonte de ${formatMonthDuration(s.mes)}, alugar e investir a entrada + a economia mensal gera ${formatBRL(s.vantagemLiquida)} a mais de patrimônio líquido do que comprar o imóvel. Nesse recorte, a rentabilidade dos juros compostos supera a valorização imobiliária e a amortização da dívida.`
  }

  return 'As duas estratégias terminam praticamente empatadas neste horizonte de análise.'
})
</script>

<template>
  <section
    class="surface-card relative overflow-hidden p-5 sm:p-6"
    aria-label="Veredito da simulação"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-20"
      :class="
        snapshot.vencedorLiquido === 'buy'
          ? 'bg-emerald-500'
          : snapshot.vencedorLiquido === 'invest'
            ? 'bg-blue-500'
            : 'bg-slate-400'
      "
    />

    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-3 lg:max-w-xl">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            :class="
              snapshot.vencedorLiquido === 'buy'
                ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                : snapshot.vencedorLiquido === 'invest'
                  ? 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                  : 'bg-slate-500/15 text-slate-600 dark:text-slate-300'
            "
          >
            <AppIcon :name="snapshot.vencedorLiquido === 'buy' ? 'home' : 'wallet'" :size="14" />
            <span>
              {{
                snapshot.vencedorLiquido === 'buy'
                  ? 'Comprar o Imóvel vale mais a pena'
                  : snapshot.vencedorLiquido === 'invest'
                    ? 'Alugar + Investir vale mais a pena'
                    : 'Empate técnico'
              }}
            </span>
          </span>

          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
            Horizonte: mês {{ snapshot.mes }} ({{ formatMonthDuration(snapshot.mes) }})
          </span>
        </div>

        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Vantagem Patrimonial Líquida {{ snapshot.mes === result.input.numeroMeses ? 'Final' : 'no Horizonte' }}
          </p>
          <p
            class="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl tabular-nums"
            :class="
              snapshot.vencedorLiquido === 'buy'
                ? 'text-emerald-600 dark:text-emerald-400'
                : snapshot.vencedorLiquido === 'invest'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200'
            "
          >
            + {{ formatBRL(snapshot.vantagemLiquida) }}
          </p>
        </div>

        <p class="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <AppIcon name="sparkles" :size="15" class="mt-0.5 text-amber-500" />
          <span>{{ smartDiagnostic }}</span>
        </p>
      </div>

      <!-- Barras comparativas de patrimônio -->
      <div class="w-full space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 lg:w-[400px] xl:w-[430px]">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Patrimônio Comprando (Líquido)
            </span>
            <span class="font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(snapshot.patrimonioCompraLiquido) }}
            </span>
          </div>
          <div class="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              :style="{ width: `${buyBarPct}%` }"
            />
          </div>
          <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            <span>Imóvel: {{ formatBRL(snapshot.imovelAtualizado) }}</span>
            <span>Dívida: {{ formatBRL(snapshot.saldoDevedor) }}</span>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Alugar + Investir Excedente
            </span>
            <span
              class="font-bold tabular-nums"
              :class="
                snapshot.investimento < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              "
            >
              {{ formatBRL(snapshot.investimento) }}
            </span>
          </div>
          <div class="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="
                snapshot.investimento < 0
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-400'
              "
              :style="{ width: `${snapshot.investimento < 0 ? 4 : investBarPct}%` }"
            />
          </div>
          <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            <span>Aluguel no mês: {{ formatBRL(snapshot.aluguelNoMes) }}</span>
            <span>Prestação no mês: {{ formatBRL(snapshot.prestacaoNoMes) }}</span>
          </div>
        </div>

        <!-- Slider de Horizonte -->
        <div class="border-t border-slate-200 pt-3 dark:border-slate-800">
          <div class="mb-1.5 flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-700 dark:text-slate-200">
              Simular saída no mês:
            </span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              Mês {{ snapshot.mes }} / {{ result.input.numeroMeses }}
            </span>
          </div>
          <input
            type="range"
            :min="1"
            :max="result.input.numeroMeses"
            :value="horizonMonth"
            class="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer"
            @input="emit('update:horizonMonth', Number(($event.target as HTMLInputElement).value))"
          />
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="item in yearShortcuts"
              :key="item.month"
              type="button"
              class="rounded-lg border px-2 py-0.5 text-[11px] font-semibold transition"
              :class="
                horizonMonth === item.month
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              "
              @click="emit('update:horizonMonth', item.month)"
            >
              {{ item.label }}
            </button>
            <button
              type="button"
              class="rounded-lg border px-2 py-0.5 text-[11px] font-semibold transition"
              :class="
                horizonMonth === result.input.numeroMeses
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              "
              @click="emit('update:horizonMonth', result.input.numeroMeses)"
            >
              Final ({{ Math.round(result.input.numeroMeses / 12) }}a)
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
