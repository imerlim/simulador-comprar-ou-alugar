<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import InsurancePasteModal from '@/components/InsurancePasteModal.vue'
import MoneyInput from '@/components/MoneyInput.vue'
import type { AmortizationSystem, InsuranceMode, ScenarioInput } from '@/types/scenario'
import { formatBRL, formatPercent, monthlyToAnnualRate } from '@/utils/formatters'

const props = defineProps<{
  scenario: ScenarioInput
  valorFinanciado: number
  prestacaoInicial: number
}>()

const emit = defineEmits<{
  (e: 'updateField', field: keyof ScenarioInput, value: ScenarioInput[keyof ScenarioInput]): void
}>()

const isInsuranceModalOpen = ref(false)

const entradaPercent = computed(() => {
  if (props.scenario.valorImovel <= 0) return 0
  return (props.scenario.entradaImovel / props.scenario.valorImovel) * 100
})

const cetAnnualPct = computed(() => monthlyToAnnualRate(props.scenario.cetJurosAM))
const rentabAnnualPct = computed(() => monthlyToAnnualRate(props.scenario.rentabilidadeInvestimentoAM))

const aluguelYieldMonthly = computed(() => {
  if (props.scenario.valorImovel <= 0) return 0
  return props.scenario.precoAluguelInicial / props.scenario.valorImovel
})

function setNumericField(field: keyof ScenarioInput, rawValue: string | number, min = 0) {
  const num = Number(rawValue)
  if (!Number.isFinite(num)) return
  emit('updateField', field, Math.max(min, num))
}

function setPercentAMField(field: 'cetJurosAM' | 'rentabilidadeInvestimentoAM', rawPct: string) {
  const num = Number(rawPct)
  if (!Number.isFinite(num)) return
  emit('updateField', field, Math.max(0, num) / 100)
}

function setPercentAAField(field: 'atualizaAluguelAA' | 'indiceAtualizImovelAA', rawPct: string) {
  const num = Number(rawPct)
  if (!Number.isFinite(num)) return
  emit('updateField', field, Math.max(-50, num) / 100)
}

function applyDownPaymentRatio(pct: number) {
  const value = Math.round(props.scenario.valorImovel * (pct / 100))
  emit('updateField', 'entradaImovel', value)
}

function setAmortization(system: AmortizationSystem) {
  emit('updateField', 'sistemaAmortizacao', system)
}

function setInsuranceMode(mode: InsuranceMode) {
  emit('updateField', 'insuranceMode', mode)
}
</script>

<template>
  <aside class="surface-card p-4 sm:p-5 space-y-5">
    <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-3.5 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <AppIcon name="sliders" :size="18" class="text-emerald-600 dark:text-emerald-400" />
        <h2 class="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
          Parâmetros do Cenário
        </h2>
      </div>
      <span
        class="h-3 w-3 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
        :style="{ backgroundColor: scenario.color }"
      />
    </div>

    <!-- Nome do cenário -->
    <div>
      <label class="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        Nome do cenário
      </label>
      <input
        type="text"
        :value="scenario.name"
        class="input-field font-medium"
        @input="emit('updateField', 'name', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Grupo 1: Imóvel & Financiamento -->
    <div class="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          1. Imóvel e Financiamento
        </span>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          Financ.: {{ formatBRL(valorFinanciado) }}
        </span>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Valor do imóvel (R$)
          </label>
          <MoneyInput
            :model-value="scenario.valorImovel"
            class="input-field tabular-nums"
            @update:model-value="setNumericField('valorImovel', $event)"
          />
        </div>

        <div>
          <div class="mb-1 flex items-center justify-between">
            <label class="text-xs font-medium text-slate-600 dark:text-slate-300">
              Entrada (R$)
            </label>
            <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
              {{ entradaPercent.toFixed(1).replace('.', ',') }}%
            </span>
          </div>
          <MoneyInput
            :model-value="scenario.entradaImovel"
            class="input-field tabular-nums"
            @update:model-value="setNumericField('entradaImovel', $event)"
          />
          <div class="mt-1.5 flex gap-1.5">
            <button
              v-for="pct in [10, 20, 30, 50]"
              :key="pct"
              type="button"
              class="flex-1 rounded-lg border border-slate-200 bg-white py-1 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
              @click="applyDownPaymentRatio(pct)"
            >
              {{ pct }}%
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            CET Juros (% a.m.)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            :value="Number((scenario.cetJurosAM * 100).toFixed(4))"
            class="input-field tabular-nums"
            @input="setPercentAMField('cetJurosAM', ($event.target as HTMLInputElement).value)"
          />
          <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            ≈ {{ formatPercent(cetAnnualPct, 2) }} a.a.
          </p>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Prazo (meses)
          </label>
          <input
            type="number"
            step="12"
            min="12"
            max="600"
            :value="scenario.numeroMeses"
            class="input-field tabular-nums"
            @input="setNumericField('numeroMeses', ($event.target as HTMLInputElement).value, 1)"
          />
          <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {{ (scenario.numeroMeses / 12).toFixed(1).replace('.0', '') }} anos
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Sistema
          </label>
          <div class="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              v-for="sys in (['SAC', 'PRICE'] as const)"
              :key="sys"
              type="button"
              class="rounded-md py-1.5 text-xs font-semibold transition"
              :class="
                scenario.sistemaAmortizacao === sys
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              "
              @click="setAmortization(sys)"
            >
              {{ sys }}
            </button>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Taxa Adm (R$/mês)
          </label>
          <MoneyInput
            :model-value="scenario.taxaAdm"
            class="input-field tabular-nums"
            @update:model-value="setNumericField('taxaAdm', $event)"
          />
        </div>
      </div>

      <!-- Seguros / FGHAB -->
      <div class="pt-1">
        <div class="mb-1 flex items-center justify-between">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-300">
            Seguros / FGHAB (MIP + DFI)
          </label>
          <button
            v-if="scenario.insuranceMode === 'spreadsheet'"
            type="button"
            class="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            @click="isInsuranceModalOpen = true"
          >
            Editar / Colar coluna
          </button>
        </div>

        <select
          :value="scenario.insuranceMode"
          class="input-field text-xs"
          @change="setInsuranceMode(($event.target as HTMLSelectElement).value as InsuranceMode)"
        >
          <option value="spreadsheet">Curva da Planilha ({{ scenario.customSeguros.length }} meses)</option>
          <option value="caixa_auto">Automático Caixa (MIP idade + DFI)</option>
          <option value="fixed">Valor Fixo Mensal (R$)</option>
        </select>

        <div v-if="scenario.insuranceMode === 'caixa_auto'" class="mt-2">
          <label class="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Idade do comprador no início (anos)
          </label>
          <input
            type="number"
            min="18"
            max="80"
            :value="scenario.idadeComprador"
            class="input-field tabular-nums text-xs"
            @input="setNumericField('idadeComprador', ($event.target as HTMLInputElement).value, 18)"
          />
        </div>

        <div v-else-if="scenario.insuranceMode === 'fixed'" class="mt-2">
          <label class="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Seguro mensal fixo (R$)
          </label>
          <MoneyInput
            :model-value="scenario.seguroFixoMensal"
            class="input-field tabular-nums text-xs"
            @update:model-value="setNumericField('seguroFixoMensal', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Grupo 2: Aluguel e Custos Mensais -->
    <div class="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
          2. Aluguel e Encargos
        </span>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          1ª Parc.: {{ formatBRL(prestacaoInicial) }}
        </span>
      </div>

      <div>
        <div class="mb-1 flex items-center justify-between">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-300">
            Preço do aluguel inicial (R$/mês)
          </label>
          <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {{ formatPercent(aluguelYieldMonthly, 2) }} do imóvel
          </span>
        </div>
        <MoneyInput
          :model-value="scenario.precoAluguelInicial"
          class="input-field tabular-nums"
          @update:model-value="setNumericField('precoAluguelInicial', $event)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            IPTU (R$/mês)
          </label>
          <MoneyInput
            :model-value="scenario.iptuMensal"
            class="input-field tabular-nums"
            @update:model-value="setNumericField('iptuMensal', $event)"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Condomínio (R$/mês)
          </label>
          <MoneyInput
            :model-value="scenario.condMensal"
            class="input-field tabular-nums"
            @update:model-value="setNumericField('condMensal', $event)"
          />
        </div>
      </div>

      <label class="flex cursor-pointer items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          :checked="scenario.reajustarCondIptuAnualmente"
          class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
          @change="
            emit('updateField', 'reajustarCondIptuAnualmente', ($event.target as HTMLInputElement).checked)
          "
        />
        <span>Reajustar IPTU e Condomínio junto com o aluguel</span>
      </label>
    </div>

    <!-- Grupo 3: Rentabilidade e Reajustes -->
    <div class="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <span class="block text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">
        3. Rentabilidade e Índices
      </span>

      <div>
        <div class="mb-1 flex items-center justify-between">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-300">
            Rentabilidade investimento (% a.m.)
          </label>
          <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            ≈ {{ formatPercent(rentabAnnualPct, 2) }} a.a.
          </span>
        </div>
        <input
          type="number"
          step="0.05"
          min="0"
          :value="Number((scenario.rentabilidadeInvestimentoAM * 100).toFixed(4))"
          class="input-field tabular-nums"
          @input="setPercentAMField('rentabilidadeInvestimentoAM', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Reaj. Aluguel (% a.a.)
          </label>
          <input
            type="number"
            step="0.5"
            :value="Number((scenario.atualizaAluguelAA * 100).toFixed(2))"
            class="input-field tabular-nums"
            @input="setPercentAAField('atualizaAluguelAA', ($event.target as HTMLInputElement).value)"
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Valoriz. Imóvel (% a.a.)
          </label>
          <input
            type="number"
            step="0.5"
            :value="Number((scenario.indiceAtualizImovelAA * 100).toFixed(2))"
            class="input-field tabular-nums"
            @input="setPercentAAField('indiceAtualizImovelAA', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <InsurancePasteModal
      :open="isInsuranceModalOpen"
      :custom-seguros="scenario.customSeguros"
      :numero-meses="scenario.numeroMeses"
      @close="isInsuranceModalOpen = false"
      @save="emit('updateField', 'customSeguros', $event)"
    />
  </aside>
</template>
