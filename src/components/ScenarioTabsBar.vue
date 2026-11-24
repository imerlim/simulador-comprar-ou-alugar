<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import type { ScenarioResult } from '@/types/scenario'
import { formatCompactBRL } from '@/utils/formatters'

defineProps<{
  results: ScenarioResult[]
  activeId: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'create'): void
  (e: 'duplicate'): void
  (e: 'remove', id: string): void
  (e: 'restore'): void
}>()
</script>

<template>
  <section class="surface-card p-3 sm:p-4" aria-label="Gerenciador de cenários">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <div
          v-for="res in results"
          :key="res.input.id"
          class="group relative flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all cursor-pointer"
          :class="
            res.input.id === activeId
              ? 'border-emerald-500/60 bg-emerald-500/10 text-slate-900 shadow-sm dark:border-emerald-400/50 dark:bg-emerald-500/15 dark:text-white'
              : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/80'
          "
          @click="emit('select', res.input.id)"
        >
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: res.input.color }"
          />
          <div class="min-w-0">
            <div class="truncate text-xs font-semibold sm:text-sm max-w-[180px] sm:max-w-[220px]">
              {{ res.input.name }}
            </div>
            <div class="mt-0.5 flex items-center gap-1.5 text-[11px] tabular-nums">
              <span
                class="font-semibold"
                :class="
                  res.summary.vencedor === 'buy'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : res.summary.vencedor === 'invest'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500'
                "
              >
                {{
                  res.summary.vencedor === 'buy'
                    ? 'Compra'
                    : res.summary.vencedor === 'invest'
                      ? 'Aluguel+Inv'
                      : 'Empate'
                }}
                +{{ formatCompactBRL(res.summary.vantagemValor) }}
              </span>
              <span class="text-slate-400 dark:text-slate-500">•</span>
              <span class="text-slate-500 dark:text-slate-400">
                {{ Math.round(res.input.numeroMeses / 12) }}a
              </span>
            </div>
          </div>

          <button
            v-if="results.length > 1"
            type="button"
            class="ml-1 rounded-md p-1 text-slate-400 opacity-70 transition hover:bg-rose-500/15 hover:text-rose-500 group-hover:opacity-100"
            title="Excluir cenário"
            @click.stop="emit('remove', res.input.id)"
          >
            <AppIcon name="close" :size="13" />
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
          @click="emit('create')"
        >
          <AppIcon name="plus" :size="15" />
          <span>Novo Cenário</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="emit('duplicate')"
        >
          <AppIcon name="copy" :size="14" />
          <span>Duplicar</span>
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Restaurar cenários padrão (incluindo a Planilha Original)"
          @click="emit('restore')"
        >
          <AppIcon name="restore" :size="14" />
          <span class="hidden sm:inline">Restaurar Padrões</span>
        </button>
      </div>
    </div>
  </section>
</template>
