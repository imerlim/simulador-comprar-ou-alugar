<script setup lang="ts">
import { ref, watch } from 'vue'
import AppHeader, { type ActiveViewTab } from '@/components/AppHeader.vue'
import AmortizationTableView from '@/components/AmortizationTableView.vue'
import CostBreakdownCard from '@/components/CostBreakdownCard.vue'
import MonthlyCashflowChart from '@/components/MonthlyCashflowChart.vue'
import PatrimonyChart from '@/components/PatrimonyChart.vue'
import ScenarioComparisonView from '@/components/ScenarioComparisonView.vue'
import ScenarioFormSidebar from '@/components/ScenarioFormSidebar.vue'
import ScenarioTabsBar from '@/components/ScenarioTabsBar.vue'
import SpreadsheetSummaryCards from '@/components/SpreadsheetSummaryCards.vue'
import VerdictHeroCard from '@/components/VerdictHeroCard.vue'
import { useScenarios } from '@/composables/useScenarios'
import { useTheme } from '@/composables/useTheme'
import { exportRowsToCsv } from '@/utils/formatters'

const { theme, toggleTheme } = useTheme()
const {
  activeScenarioId,
  activeScenario,
  activeResult,
  scenarioResults,
  selectScenario,
  updateActiveScenario,
  createNewScenario,
  duplicateActiveScenario,
  removeScenario,
  restoreDefaultScenarios,
} = useScenarios()

const activeTab = ref<ActiveViewTab>('overview')
const horizonMonth = ref<number>(activeScenario.value.numeroMeses)

watch(
  () => [activeScenario.value.id, activeScenario.value.numeroMeses] as const,
  ([, newMax], oldVal) => {
    if (!oldVal || oldVal[0] !== activeScenario.value.id || horizonMonth.value > newMax) {
      horizonMonth.value = newMax
    } else if (horizonMonth.value === oldVal[1]) {
      horizonMonth.value = newMax
    }
  },
)

function handleExportCsv() {
  exportRowsToCsv(activeScenario.value.name, activeResult.value.rows)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader
      v-model:active-tab="activeTab"
      :theme="theme"
      :scenario-count="scenarioResults.length"
      @toggle-theme="toggleTheme"
      @export-csv="handleExportCsv"
    />

    <main class="mx-auto w-full max-w-[1600px] flex-1 space-y-5 px-4 py-5 sm:px-6">
      <ScenarioTabsBar
        :results="scenarioResults"
        :active-id="activeScenarioId"
        @select="selectScenario"
        @create="createNewScenario"
        @duplicate="duplicateActiveScenario"
        @remove="removeScenario"
        @restore="restoreDefaultScenarios"
      />

      <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <!-- Painel lateral de parâmetros -->
        <div class="xl:col-span-4 2xl:col-span-3 xl:sticky xl:top-20">
          <ScenarioFormSidebar
            :scenario="activeScenario"
            :valor-financiado="activeResult.summary.valorFinanciado"
            :prestacao-inicial="activeResult.summary.prestacaoInicial"
            @update-field="updateActiveScenario"
          />
        </div>

        <!-- Conteúdo principal -->
        <div class="space-y-5 xl:col-span-8 2xl:col-span-9">
          <template v-if="activeTab === 'overview'">
            <VerdictHeroCard
              v-model:horizon-month="horizonMonth"
              :result="activeResult"
            />
            <SpreadsheetSummaryCards :result="activeResult" />
            <PatrimonyChart
              :result="activeResult"
              :horizon-month="horizonMonth"
            />
            <MonthlyCashflowChart :result="activeResult" />
            <CostBreakdownCard :result="activeResult" />
          </template>

          <ScenarioComparisonView
            v-else-if="activeTab === 'compare'"
            :results="scenarioResults"
            :active-id="activeScenarioId"
            @select="selectScenario"
            @create="createNewScenario"
          />

          <AmortizationTableView
            v-else-if="activeTab === 'table'"
            :result="activeResult"
            @export-csv="handleExportCsv"
          />
        </div>
      </div>
    </main>
  </div>
</template>
