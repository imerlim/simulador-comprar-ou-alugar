<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import type { ThemeMode } from '@/composables/useTheme'

export type ActiveViewTab = 'overview' | 'compare' | 'table'

defineProps<{
  activeTab: ActiveViewTab
  theme: ThemeMode
  scenarioCount: number
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: ActiveViewTab): void
  (e: 'toggleTheme'): void
  (e: 'exportCsv'): void
}>()

const tabs: { id: ActiveViewTab; label: string; icon: 'chart' | 'layers' | 'table' }[] = [
  { id: 'overview', label: 'Visão Geral & Gráficos', icon: 'chart' },
  { id: 'compare', label: 'Comparar Cenários', icon: 'layers' },
  { id: 'table', label: 'Tabela da Planilha', icon: 'table' },
]
</script>

<template>
  <header class="sticky top-0 z-30 surface-glass">
    <div class="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-md shadow-emerald-500/20"
        >
          <AppIcon name="home" :size="20" />
        </div>
        <div>
          <h1 class="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-lg">
            Imóvel vs. Investimento
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Simulador de cenários imobiliários e custo de oportunidade
          </p>
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        class="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80 lg:order-2 lg:w-auto"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm lg:flex-initial"
          :class="
            activeTab === tab.id
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
          "
          @click="emit('update:activeTab', tab.id)"
        >
          <AppIcon :name="tab.icon" :size="16" />
          <span>{{ tab.label }}</span>
          <span
            v-if="tab.id === 'compare'"
            class="rounded-full bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          >
            {{ scenarioCount }}
          </span>
        </button>
      </nav>

      <div class="order-2 flex items-center gap-2 lg:order-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-sm"
          title="Exportar simulação completa para CSV (compatível com Excel)"
          @click="emit('exportCsv')"
        >
          <AppIcon name="download" :size="15" />
          <span class="hidden sm:inline">Exportar CSV</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-sm"
          :aria-label="theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'"
          @click="emit('toggleTheme')"
        >
          <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="16" class="text-amber-500 dark:text-amber-400" />
          <span>{{ theme === 'dark' ? 'Modo Light' : 'Modo Dark' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
