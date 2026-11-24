import type { MonthlyRow } from '@/types/scenario'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00'
  return brlFormatter.format(value)
}

export function formatCompactBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')}M`
  }
  if (abs >= 1_000) {
    return `${sign}R$ ${(abs / 1_000).toFixed(1).replace('.', ',')}k`
  }
  return `${sign}R$ ${abs.toFixed(0)}`
}

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0,00'
  if (decimals === 2) return numberFormatter.format(value)
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(decimalValue: number, decimals = 2): string {
  if (!Number.isFinite(decimalValue)) return '0,00%'
  return `${(decimalValue * 100).toFixed(decimals).replace('.', ',')}%`
}

export function monthlyToAnnualRate(monthlyRate: number): number {
  return Math.pow(1 + monthlyRate, 12) - 1
}

export function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1
}

export function formatMonthDuration(meses: number): string {
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  if (anos === 0) return `${resto} ${resto === 1 ? 'mês' : 'meses'}`
  if (resto === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return `${anos}a ${resto}m`
}

export function exportRowsToCsv(
  scenarioName: string,
  rows: MonthlyRow[],
): void {
  const headers = [
    'Anos',
    'Nº',
    'Seguros/FGHAB',
    'Prestação',
    'IPTU',
    'COND',
    'Amortização',
    'Juros',
    'Saldo Devedor',
    'Total prestação',
    'Aluguel',
    'Excedente',
    'Investimento',
    'Imóvel atualizado',
    'Patrimônio Líquido Compra',
  ]

  const fmt = (n: number) => n.toFixed(2).replace('.', ',')

  const lines = rows.map((r) => [
    r.anoLabel !== null ? String(r.anoLabel) : '',
    String(r.mes),
    fmt(r.seguros),
    fmt(r.prestacao),
    fmt(r.iptu),
    fmt(r.cond),
    fmt(r.amortizacao),
    fmt(r.juros),
    fmt(r.saldoDevedor),
    fmt(r.totalPrestacao),
    fmt(r.aluguel),
    fmt(r.excedente),
    fmt(r.investimento),
    fmt(r.imovelAtualizado),
    fmt(r.patrimonioCompraLiquido),
  ])

  const sum = (getter: (r: MonthlyRow) => number) =>
    rows.reduce((acc, r) => acc + getter(r), 0)

  const last = rows[rows.length - 1]
  lines.push([
    'soma ->',
    '',
    fmt(sum((r) => r.seguros)),
    fmt(sum((r) => r.prestacao)),
    fmt(sum((r) => r.iptu)),
    fmt(sum((r) => r.cond)),
    fmt(sum((r) => r.amortizacao)),
    fmt(sum((r) => r.juros)),
    fmt(last ? last.saldoDevedor : 0),
    fmt(sum((r) => r.totalPrestacao)),
    fmt(sum((r) => r.aluguel)),
    fmt(sum((r) => r.excedente)),
    fmt(last ? last.investimento : 0),
    fmt(last ? last.imovelAtualizado : 0),
    fmt(last ? last.patrimonioCompraLiquido : 0),
  ])

  const csvContent =
    '\uFEFF' +
    [headers.join(';'), ...lines.map((line) => line.join(';'))].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeName = scenarioName
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-|-$/g, '')
  link.href = url
  link.download = `simulacao-${safeName || 'cenario'}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
