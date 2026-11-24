export type AmortizationSystem = 'SAC' | 'PRICE'

export type InsuranceMode = 'spreadsheet' | 'caixa_auto' | 'fixed'

export type WinnerSide = 'buy' | 'invest' | 'tie'

export interface ScenarioInput {
  id: string
  name: string
  color: string
  valorImovel: number
  entradaImovel: number
  iptuMensal: number
  condMensal: number
  reajustarCondIptuAnualmente: boolean
  cetJurosAM: number // decimal ex.: 0.00816 (0,816% a.m.)
  precoAluguelInicial: number
  rentabilidadeInvestimentoAM: number // decimal ex.: 0.01 (1% a.m.)
  atualizaAluguelAA: number // decimal ex.: 0.06 (6% a.a.)
  indiceAtualizImovelAA: number // decimal ex.: 0.06 (6% a.a.)
  numeroMeses: number // ex.: 420
  taxaAdm: number // ex.: 25
  sistemaAmortizacao: AmortizationSystem
  insuranceMode: InsuranceMode
  idadeComprador: number
  seguroFixoMensal: number
  customSeguros: number[]
}

export interface MonthlyRow {
  mes: number
  anoLabel: number | null
  anoCalendario: number
  seguros: number
  prestacao: number
  iptu: number
  cond: number
  amortizacao: number
  juros: number
  saldoDevedor: number
  totalPrestacao: number
  aluguel: number
  excedente: number
  investimento: number
  imovelAtualizado: number
  patrimonioCompraLiquido: number
  diferencaPatrimonial: number // investimento - imovelAtualizado (regra da planilha)
  diferencaPatrimonialLiquida: number // investimento - patrimonioCompraLiquido
}

export interface AnnualRow {
  ano: number
  mesFinal: number
  segurosAno: number
  prestacaoAno: number
  iptuAno: number
  condAno: number
  amortizacaoAno: number
  jurosAno: number
  saldoDevedorFinal: number
  totalPrestacaoAno: number
  aluguelAno: number
  excedenteAno: number
  investimentoFinal: number
  imovelAtualizadoFinal: number
  patrimonioCompraLiquidoFinal: number
  diferencaPatrimonialFinal: number
  diferencaPatrimonialLiquidaFinal: number
}

export interface ScenarioSummary {
  valorFinanciado: number
  totalSeguros: number
  totalPrestacaoBase: number
  totalIptu: number
  totalCond: number
  totalAmortizacao: number
  totalJuros: number
  totalCondMaisPrest: number
  totalAluguel: number
  excedenteGuardadoNominal: number
  investimentoFinal: number
  patrimonioFinalImovel: number
  patrimonioCompraLiquidoFinal: number
  diferencaFinal: number // investimentoFinal - patrimonioFinalImovel
  diferencaLiquidaFinal: number // investimentoFinal - patrimonioCompraLiquidoFinal
  vencedor: WinnerSide
  vantagemValor: number
  prestacaoInicial: number
  prestacaoFinal: number
  aluguelFinal: number
  jurosSobreFinanciadoPct: number
}

export interface ScenarioMilestones {
  mesAluguelSuperaPrestacao: number | null
  mesPicoInvestimento: number
  valorPicoInvestimento: number
  mesReservaNegativa: number | null
  mesViradaPatrimonialDefinitiva: number | null
  vencedorNaVirada: WinnerSide
}

export interface BreakEvenMetrics {
  aluguelEquilibrio: number | null
  rentabilidadeEquilibrioAM: number | null
  cetEquilibrioAM: number | null
}

export interface HorizonSnapshot {
  mes: number
  ano: number
  imovelAtualizado: number
  saldoDevedor: number
  patrimonioCompraLiquido: number
  investimento: number
  diferencaLiquida: number
  diferencaPlanilha: number
  vencedorLiquido: WinnerSide
  vantagemLiquida: number
  totalPagoCompraAteMes: number
  totalPagoAluguelAteMes: number
  excedenteAcumuladoAteMes: number
  prestacaoNoMes: number
  aluguelNoMes: number
}

export interface ScenarioResult {
  input: ScenarioInput
  rows: MonthlyRow[]
  annualRows: AnnualRow[]
  summary: ScenarioSummary
  milestones: ScenarioMilestones
  breakEven: BreakEvenMetrics
}
