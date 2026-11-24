import { computed, ref, watch } from 'vue'
import {
  createDefaultScenarios,
  DEFAULT_SPREADSHEET_SEGUROS,
  SCENARIO_COLORS,
} from '@/data/defaultSpreadsheetSeguros'
import { calculateScenario } from '@/composables/useFinancialEngine'
import type { ScenarioInput, ScenarioResult } from '@/types/scenario'

const SCENARIOS_STORAGE_KEY = 'simulador-imovel-scenarios-v1'
const ACTIVE_ID_STORAGE_KEY = 'simulador-imovel-active-id-v1'

function loadSavedScenarios(): ScenarioInput[] {
  if (typeof window === 'undefined') return createDefaultScenarios()
  try {
    const raw = window.localStorage.getItem(SCENARIOS_STORAGE_KEY)
    if (!raw) return createDefaultScenarios()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return createDefaultScenarios()
    return parsed.map((item, idx) => ({
      ...createDefaultScenarios()[0],
      ...item,
      color: item.color || SCENARIO_COLORS[idx % SCENARIO_COLORS.length],
      customSeguros:
        Array.isArray(item.customSeguros) && item.customSeguros.length > 0
          ? item.customSeguros
          : [...DEFAULT_SPREADSHEET_SEGUROS],
    }))
  } catch {
    return createDefaultScenarios()
  }
}

function loadActiveId(scenariosList: ScenarioInput[]): string {
  if (typeof window === 'undefined') return scenariosList[0]?.id ?? 'planilha-original'
  try {
    const savedId = window.localStorage.getItem(ACTIVE_ID_STORAGE_KEY)
    if (savedId && scenariosList.some((s) => s.id === savedId)) {
      return savedId
    }
  } catch {
    // ignore
  }
  return scenariosList[0]?.id ?? 'planilha-original'
}

const scenarios = ref<ScenarioInput[]>(loadSavedScenarios())
const activeScenarioId = ref<string>(loadActiveId(scenarios.value))

watch(
  scenarios,
  (val) => {
    try {
      window.localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(val))
    } catch {
      // ignore
    }
  },
  { deep: true },
)

watch(activeScenarioId, (val) => {
  try {
    window.localStorage.setItem(ACTIVE_ID_STORAGE_KEY, val)
  } catch {
    // ignore
  }
})

export function useScenarios() {
  const scenarioResults = computed<ScenarioResult[]>(() =>
    scenarios.value.map((s) => calculateScenario(s)),
  )

  const activeScenario = computed<ScenarioInput>(() => {
    return (
      scenarios.value.find((s) => s.id === activeScenarioId.value) ?? scenarios.value[0]
    )
  })

  const activeResult = computed<ScenarioResult>(() => {
    return (
      scenarioResults.value.find((r) => r.input.id === activeScenario.value.id) ??
      scenarioResults.value[0]
    )
  })

  const selectScenario = (id: string) => {
    if (scenarios.value.some((s) => s.id === id)) {
      activeScenarioId.value = id
    }
  }

  const updateActiveScenario = <K extends keyof ScenarioInput>(
    field: K,
    value: ScenarioInput[K],
  ) => {
    const target = scenarios.value.find((s) => s.id === activeScenarioId.value)
    if (!target) return
    target[field] = value
  }

  const createNewScenario = () => {
    const idx = scenarios.value.length
    const newId = `cenario-${Date.now()}`
    const base = createDefaultScenarios()[1]
    const created: ScenarioInput = {
      ...base,
      id: newId,
      name: `Novo Cenário ${idx + 1}`,
      color: SCENARIO_COLORS[idx % SCENARIO_COLORS.length],
      customSeguros: [...DEFAULT_SPREADSHEET_SEGUROS],
    }
    scenarios.value.push(created)
    activeScenarioId.value = newId
  }

  const duplicateActiveScenario = () => {
    const current = activeScenario.value
    const idx = scenarios.value.length
    const newId = `cenario-${Date.now()}`
    const copy: ScenarioInput = {
      ...current,
      id: newId,
      name: `${current.name} (Cópia)`,
      color: SCENARIO_COLORS[idx % SCENARIO_COLORS.length],
      customSeguros: [...current.customSeguros],
    }
    scenarios.value.push(copy)
    activeScenarioId.value = newId
  }

  const removeScenario = (id: string) => {
    if (scenarios.value.length <= 1) return
    const index = scenarios.value.findIndex((s) => s.id === id)
    if (index === -1) return
    scenarios.value.splice(index, 1)
    if (activeScenarioId.value === id) {
      activeScenarioId.value = scenarios.value[Math.max(0, index - 1)].id
    }
  }

  const restoreDefaultScenarios = () => {
    const defaults = createDefaultScenarios()
    scenarios.value = defaults
    activeScenarioId.value = defaults[0].id
  }

  return {
    scenarios,
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
  }
}
