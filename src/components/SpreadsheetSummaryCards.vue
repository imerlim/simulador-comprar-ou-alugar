<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatBRL, formatMonthDuration, formatPercent, monthlyToAnnualRate } from '@/utils/formatters'

defineProps<{
  result: ScenarioResult
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Painel fiel aos indicadores da planilha -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Cenário Compra -->
      <section class="surface-card p-4 sm:p-5">
        <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <AppIcon name="home" :size="15" />
            </span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Resumo da Compra (Planilha)
            </h3>
          </div>
          <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {{ result.input.sistemaAmortizacao }} • {{ result.input.numeroMeses }}m
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Valor financiado</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(result.summary.valorFinanciado) }}
            </dd>
          </div>
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Total pago prestação</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(result.summary.totalPrestacaoBase) }}
            </dd>
          </div>
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Total cond + IPTU</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(result.summary.totalCond + result.summary.totalIptu) }}
            </dd>
          </div>
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Total cond + prest</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(result.summary.totalCondMaisPrest) }}
            </dd>
          </div>
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Total pago juros</dt>
            <dd class="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {{ formatBRL(result.summary.totalJuros) }}
            </dd>
          </div>
          <div class="surface-elevated border-emerald-500/30 bg-emerald-500/10 p-2.5 dark:bg-emerald-500/10">
            <dt class="font-semibold text-emerald-700 dark:text-emerald-300">Patrimônio final</dt>
            <dd class="mt-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {{ formatBRL(result.summary.patrimonioFinalImovel) }}
            </dd>
          </div>
        </dl>
      </section>

      <!-- Cenário Aluguel + Investimento -->
      <section class="surface-card p-4 sm:p-5">
        <div class="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <AppIcon name="wallet" :size="15" />
            </span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Resumo Aluguel + Investimento
            </h3>
          </div>
          <span class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
            Rentab.: {{ formatPercent(result.input.rentabilidadeInvestimentoAM, 2) }} a.m.
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-3 text-xs">
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Total pago aluguel</dt>
            <dd class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(result.summary.totalAluguel) }}
            </dd>
          </div>
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Excedente guardado (nominal)</dt>
            <dd
              class="mt-1 text-sm font-bold tabular-nums"
              :class="
                result.summary.excedenteGuardadoNominal < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              "
            >
              {{ formatBRL(result.summary.excedenteGuardadoNominal) }}
            </dd>
          </div>
          <div class="surface-elevated p-2.5">
            <dt class="text-slate-500 dark:text-slate-400">Investimento total final</dt>
            <dd
              class="mt-1 text-sm font-bold tabular-nums"
              :class="
                result.summary.investimentoFinal < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-blue-600 dark:text-blue-400'
              "
            >
              {{ formatBRL(result.summary.investimentoFinal) }}
            </dd>
          </div>
          <div
            class="surface-elevated p-2.5"
            :class="
              result.summary.diferencaFinal > 0
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'border-emerald-500/30 bg-emerald-500/10'
            "
          >
            <dt class="font-semibold text-slate-700 dark:text-slate-200">
              Diferença (Inv - Imóvel)
            </dt>
            <dd
              class="mt-1 text-sm font-extrabold tabular-nums"
              :class="
                result.summary.diferencaFinal > 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              "
            >
              {{ formatBRL(result.summary.diferencaFinal) }}
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <!-- Marcos do Cenário & Pontos de Equilíbrio -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Marcos -->
      <section class="surface-card p-4 sm:p-5">
        <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <AppIcon name="info" :size="16" class="text-violet-500" />
          <span>Marcos da Trajetória</span>
        </h3>
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">Aluguel supera prestação total</p>
            <p class="mt-1 font-bold text-slate-900 dark:text-white tabular-nums">
              <template v-if="result.milestones.mesAluguelSuperaPrestacao">
                Mês {{ result.milestones.mesAluguelSuperaPrestacao }} ({{
                  formatMonthDuration(result.milestones.mesAluguelSuperaPrestacao)
                }})
              </template>
              <template v-else>Nunca supera no prazo</template>
            </p>
          </div>

          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">Pico do fundo de investimento</p>
            <p class="mt-1 font-bold text-slate-900 dark:text-white tabular-nums">
              {{ formatBRL(result.milestones.valorPicoInvestimento) }}
              <span class="font-normal text-slate-500 dark:text-slate-400">
                (mês {{ result.milestones.mesPicoInvestimento }})
              </span>
            </p>
          </div>

          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">Saldo do investimento zera</p>
            <p class="mt-1 font-bold tabular-nums">
              <span v-if="result.milestones.mesReservaNegativa" class="text-rose-600 dark:text-rose-400">
                Mês {{ result.milestones.mesReservaNegativa }} ({{
                  formatMonthDuration(result.milestones.mesReservaNegativa)
                }})
              </span>
              <span v-else class="text-emerald-600 dark:text-emerald-400">
                Permanece positivo todo o prazo
              </span>
            </p>
          </div>

          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">Liderança definitiva do vencedor</p>
            <p class="mt-1 font-bold text-slate-900 dark:text-white tabular-nums">
              <template v-if="result.milestones.mesViradaPatrimonialDefinitiva">
                Desde o mês {{ result.milestones.mesViradaPatrimonialDefinitiva }} ({{
                  formatMonthDuration(result.milestones.mesViradaPatrimonialDefinitiva)
                }})
              </template>
              <template v-else>—</template>
            </p>
          </div>
        </div>
      </section>

      <!-- Break-even -->
      <section class="surface-card p-4 sm:p-5">
        <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <AppIcon name="sparkles" :size="16" class="text-amber-500" />
          <span>Onde o Jogo Vira? (Pontos de Equilíbrio)</span>
        </h3>
        <p class="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Quanto uma variável precisaria mudar isoladamente para empatar exatamente as duas opções ao final do prazo:
        </p>
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">Aluguel inicial de empate</p>
            <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {{
                result.breakEven.aluguelEquilibrio !== null
                  ? formatBRL(result.breakEven.aluguelEquilibrio)
                  : 'Fora da faixa'
              }}
            </p>
            <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Abaixo disso, alugar vence
            </p>
          </div>

          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">Rentabilidade de empate</p>
            <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              <template v-if="result.breakEven.rentabilidadeEquilibrioAM !== null">
                {{ formatPercent(result.breakEven.rentabilidadeEquilibrioAM, 2) }} a.m.
              </template>
              <template v-else>Fora da faixa</template>
            </p>
            <p
              v-if="result.breakEven.rentabilidadeEquilibrioAM !== null"
              class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums"
            >
              ≈ {{ formatPercent(monthlyToAnnualRate(result.breakEven.rentabilidadeEquilibrioAM), 1) }} a.a.
            </p>
          </div>

          <div class="surface-elevated p-3">
            <p class="text-slate-500 dark:text-slate-400">CET máximo p/ compra vencer</p>
            <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              <template v-if="result.breakEven.cetEquilibrioAM !== null">
                {{ formatPercent(result.breakEven.cetEquilibrioAM, 2) }} a.m.
              </template>
              <template v-else>Fora da faixa</template>
            </p>
            <p
              v-if="result.breakEven.cetEquilibrioAM !== null"
              class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums"
            >
              ≈ {{ formatPercent(monthlyToAnnualRate(result.breakEven.cetEquilibrioAM), 1) }} a.a.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
