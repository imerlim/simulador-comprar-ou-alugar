<script setup lang="ts">
import { ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { DEFAULT_SPREADSHEET_SEGUROS } from '@/data/defaultSpreadsheetSeguros'
import { formatBRL } from '@/utils/formatters'

const props = defineProps<{
  open: boolean
  customSeguros: number[]
  numeroMeses: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', values: number[]): void
}>()

const rawText = ref('')
const parseError = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      rawText.value = props.customSeguros.map((v) => v.toFixed(2).replace('.', ',')).join('\n')
      parseError.value = ''
    }
  },
)

function parseValues(): number[] {
  const tokens = rawText.value
    .split(/[\r\n;\t]+/)
    .map((t) => t.trim())
    .filter(Boolean)

  const parsed: number[] = []
  for (const token of tokens) {
    // Suporta "1.234,56" ou "30.33" ou "30,33"
    const normalized = token.includes(',')
      ? token.replace(/\./g, '').replace(',', '.')
      : token
    const num = Number(normalized)
    if (!Number.isFinite(num) || num < 0) {
      throw new Error(`Valor inválido encontrado: "${token}"`)
    }
    parsed.push(num)
  }
  return parsed
}

function handleSave() {
  try {
    const parsed = parseValues()
    if (parsed.length === 0) {
      parseError.value = 'Informe pelo menos 1 valor numérico.'
      return
    }
    emit('save', parsed)
    emit('close')
  } catch (err) {
    parseError.value = err instanceof Error ? err.message : 'Erro ao interpretar valores.'
  }
}

function loadSpreadsheetOriginal() {
  rawText.value = DEFAULT_SPREADSHEET_SEGUROS.map((v) => v.toFixed(2).replace('.', ',')).join('\n')
  parseError.value = ''
}

function previewStats() {
  try {
    const vals = parseValues()
    const total = vals.reduce((acc, v) => acc + v, 0)
    return { count: vals.length, total }
  } catch {
    return null
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="surface-card flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Seguros / FGHAB — Valores Mensais
            </h3>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Cole uma coluna do Excel/Planilha (um valor por linha). Meses excedentes usam R$ 0,00.
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            @click="emit('close')"
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <div class="flex-1 space-y-3 overflow-y-auto p-5">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="text-slate-600 dark:text-slate-300">
              Prazo do cenário: <strong>{{ numeroMeses }} meses</strong>
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="loadSpreadsheetOriginal"
            >
              <AppIcon name="restore" :size="13" />
              <span>Carregar 420 meses originais</span>
            </button>
          </div>

          <textarea
            v-model="rawText"
            rows="12"
            class="input-field custom-scrollbar font-mono text-xs tabular-nums"
            placeholder="30,33&#10;30,29&#10;30,26..."
          />

          <div
            v-if="previewStats()"
            class="flex flex-wrap items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
          >
            <span>Linhas reconhecidas: <strong class="tabular-nums">{{ previewStats()?.count }}</strong></span>
            <span>Soma total: <strong class="tabular-nums">{{ formatBRL(previewStats()?.total ?? 0) }}</strong></span>
          </div>

          <p v-if="parseError" class="text-xs font-medium text-rose-500">
            {{ parseError }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            @click="handleSave"
          >
            Aplicar Coluna de Seguros
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
