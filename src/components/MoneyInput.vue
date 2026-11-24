<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Campo monetário com máscara pt-BR em tempo real.
 * Os dígitos digitados formam a parte inteira (1 → 1,00 · 1000 → 1.000,00).
 * Digitar "," leva o cursor para os centavos.
 */
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const display = ref(formatValue(props.modelValue))

function groupThousands(intDigits: string): string {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatValue(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  const [int, dec] = value.toFixed(2).split('.')
  return `${groupThousands(int)},${dec}`
}

function parseDisplay(text: string): number {
  if (!text) return 0
  const n = Number(text.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

watch(
  () => props.modelValue,
  (value) => {
    // Só reformata quando o valor externo difere do que está no campo
    // (ex.: botões de % da entrada), para não atrapalhar a digitação.
    if (Math.abs(parseDisplay(display.value) - value) > 0.004) {
      display.value = formatValue(value)
    }
  },
)

function onInput(event: Event) {
  const el = event.target as HTMLInputElement
  const raw = el.value
  const caret = el.selectionStart ?? raw.length

  const commaIdx = raw.indexOf(',')
  const intRaw = commaIdx === -1 ? raw : raw.slice(0, commaIdx)
  const decRaw = commaIdx === -1 ? '' : raw.slice(commaIdx + 1)

  let intDigits = intRaw.replace(/\D/g, '')
  const decDigits = (decRaw.replace(/\D/g, '') + '00').slice(0, 2)

  // Posição do cursor: na parte inteira (n dígitos antes dele) ou nos centavos
  const caretInDecimals = commaIdx !== -1 && caret > commaIdx
  let digitsBeforeCaret = caretInDecimals
    ? decRaw.slice(0, caret - commaIdx - 1).replace(/\D/g, '').length
    : intRaw.slice(0, caret).replace(/\D/g, '').length

  // Remove zeros à esquerda
  const stripped = intDigits.replace(/^0+(?=\d)/, '')
  if (!caretInDecimals) {
    digitsBeforeCaret = Math.max(0, digitsBeforeCaret - (intDigits.length - stripped.length))
  }
  intDigits = stripped

  let formatted: string
  if (!intDigits && !/[1-9]/.test(decRaw)) {
    formatted = commaIdx !== -1 && caretInDecimals ? '0,' + decDigits : ''
    if (!formatted) intDigits = ''
  } else {
    formatted = `${groupThousands(intDigits || '0')},${decDigits}`
  }

  display.value = formatted
  el.value = formatted

  // Reposiciona o cursor
  let newCaret = 0
  if (formatted) {
    const intFormattedLen = formatted.indexOf(',')
    if (caretInDecimals) {
      newCaret = intFormattedLen + 1 + Math.min(digitsBeforeCaret, 2)
    } else {
      let count = 0
      newCaret = 0
      while (newCaret < intFormattedLen && count < digitsBeforeCaret) {
        if (/\d/.test(formatted[newCaret])) count++
        newCaret++
      }
    }
  }
  el.setSelectionRange(newCaret, newCaret)

  emit('update:modelValue', parseDisplay(formatted))
}

function onBlur() {
  display.value = formatValue(parseDisplay(display.value))
}
</script>

<template>
  <input
    type="text"
    inputmode="decimal"
    autocomplete="off"
    placeholder="0,00"
    :value="display"
    @input="onInput"
    @blur="onBlur"
  />
</template>
