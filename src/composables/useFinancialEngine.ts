import type {
  AnnualRow,
  BreakEvenMetrics,
  HorizonSnapshot,
  MonthlyRow,
  ScenarioInput,
  ScenarioMilestones,
  ScenarioResult,
  ScenarioSummary,
  WinnerSide,
} from '@/types/scenario'

export function getMipRateByAge(ageYears: number): number {
  if (ageYears < 31) return 0.000143
  if (ageYears < 36) return 0.00018
  if (ageYears < 41) return 0.00024
  if (ageYears < 46) return 0.000407
  if (ageYears < 51) return 0.000598
  if (ageYears < 56) return 0.001076
  if (ageYears < 61) return 0.001274
  if (ageYears < 66) return 0.002161
  return 0.0032
}

function getMonthInsurance(
  input: ScenarioInput,
  month: number,
  totalMonths: number,
  saldoAnterior: number,
): number {
  if (month === totalMonths) {
    if (input.insuranceMode === 'spreadsheet') {
      return input.customSeguros[month - 1] ?? 0
    }
    return 0
  }

  if (input.insuranceMode === 'spreadsheet') {
    return input.customSeguros[month - 1] ?? 0
  }

  if (input.insuranceMode === 'fixed') {
    return Math.max(0, input.seguroFixoMensal)
  }

  // Modo caixa_auto: DFI ~ 0,012% do valor do imóvel + MIP por faixa etária sobre saldo devedor
  const dfi = Math.max(0, input.valorImovel) * 0.00012
  const currentAge = Math.max(18, input.idadeComprador) + (month - 1) / 12
  const mip = Math.max(0, saldoAnterior) * getMipRateByAge(currentAge)
  return Math.round((dfi + mip) * 100) / 100
}

function getWinnerSide(diferencaInvestimentoMenosImovel: number): WinnerSide {
  if (Math.abs(diferencaInvestimentoMenosImovel) < 0.01) return 'tie'
  return diferencaInvestimentoMenosImovel > 0 ? 'invest' : 'buy'
}

export function simulateCore(input: ScenarioInput): {
  rows: MonthlyRow[]
  summary: ScenarioSummary
} {
  const numeroMeses = Math.max(1, Math.min(600, Math.round(input.numeroMeses)))
  const valorImovel = Math.max(0, input.valorImovel)
  const entradaImovel = Math.max(0, Math.min(valorImovel, input.entradaImovel))
  const valorFinanciado = Math.max(0, valorImovel - entradaImovel)
  const cet = Math.max(0, input.cetJurosAM)
  const rentab = input.rentabilidadeInvestimentoAM
  const reajAluguel = input.atualizaAluguelAA
  const reajImovel = input.indiceAtualizImovelAA
  const taxaAdm = Math.max(0, input.taxaAdm)

  const pmtPrice =
    valorFinanciado === 0
      ? 0
      : cet === 0
        ? valorFinanciado / numeroMeses
        : (valorFinanciado * cet) / (1 - Math.pow(1 + cet, -numeroMeses))

  const sacAmortizacao = valorFinanciado / numeroMeses

  const rows: MonthlyRow[] = []

  let saldoAnterior = valorFinanciado
  let investimentoAnterior = entradaImovel

  let totalSeguros = 0
  let totalPrestacaoBase = 0
  let totalIptu = 0
  let totalCond = 0
  let totalAmortizacao = 0
  let totalJuros = 0
  let totalCondMaisPrest = 0
  let totalAluguel = 0
  let excedenteGuardadoNominal = 0

  for (let m = 1; m <= numeroMeses; m++) {
    const yearIndex = Math.floor((m - 1) / 12)
    const anoCalendario = yearIndex + 1
    const anoLabel = m % 12 === 0 ? m / 12 : null

    const seguros = getMonthInsurance(input, m, numeroMeses, saldoAnterior)
    const juros = saldoAnterior * cet

    let amortizacao: number
    let saldoDevedor: number

    if (input.sistemaAmortizacao === 'PRICE') {
      if (m === numeroMeses) {
        amortizacao = saldoAnterior
        saldoDevedor = 0
      } else {
        amortizacao = Math.max(0, pmtPrice - juros)
        saldoDevedor = Math.max(0, saldoAnterior - amortizacao)
      }
    } else {
      amortizacao = sacAmortizacao
      // Garante zero exato ao final do prazo sem acúmulo de ruído de ponto flutuante
      saldoDevedor = m === numeroMeses ? 0 : valorFinanciado * (1 - m / numeroMeses)
    }

    const prestacao = amortizacao + juros + seguros + taxaAdm

    const fatorEncargo = input.reajustarCondIptuAnualmente
      ? Math.pow(1 + reajAluguel, yearIndex)
      : 1
    const iptu = Math.max(0, input.iptuMensal) * fatorEncargo
    const cond = Math.max(0, input.condMensal) * fatorEncargo
    const totalPrestacao = prestacao + iptu + cond

    const aluguel = Math.max(0, input.precoAluguelInicial) * Math.pow(1 + reajAluguel, yearIndex)
    const excedente = totalPrestacao - aluguel
    const investimento = (investimentoAnterior + excedente) * (1 + rentab)
    const imovelAtualizado = valorImovel * Math.pow(1 + reajImovel, yearIndex)
    const patrimonioCompraLiquido = imovelAtualizado - saldoDevedor

    const diferencaPatrimonial = investimento - imovelAtualizado
    const diferencaPatrimonialLiquida = investimento - patrimonioCompraLiquido

    rows.push({
      mes: m,
      anoLabel,
      anoCalendario,
      seguros,
      prestacao,
      iptu,
      cond,
      amortizacao,
      juros,
      saldoDevedor,
      totalPrestacao,
      aluguel,
      excedente,
      investimento,
      imovelAtualizado,
      patrimonioCompraLiquido,
      diferencaPatrimonial,
      diferencaPatrimonialLiquida,
    })

    totalSeguros += seguros
    totalPrestacaoBase += prestacao
    totalIptu += iptu
    totalCond += cond
    totalAmortizacao += amortizacao
    totalJuros += juros
    totalCondMaisPrest += totalPrestacao
    totalAluguel += aluguel
    excedenteGuardadoNominal += excedente

    saldoAnterior = saldoDevedor
    investimentoAnterior = investimento
  }

  const last = rows[rows.length - 1]
  const first = rows[0]

  const investimentoFinal = last ? last.investimento : entradaImovel
  const patrimonioFinalImovel = last ? last.imovelAtualizado : valorImovel
  const patrimonioCompraLiquidoFinal = last ? last.patrimonioCompraLiquido : valorImovel
  const diferencaFinal = investimentoFinal - patrimonioFinalImovel
  const diferencaLiquidaFinal = investimentoFinal - patrimonioCompraLiquidoFinal

  const summary: ScenarioSummary = {
    valorFinanciado,
    totalSeguros,
    totalPrestacaoBase,
    totalIptu,
    totalCond,
    totalAmortizacao,
    totalJuros,
    totalCondMaisPrest,
    totalAluguel,
    excedenteGuardadoNominal,
    investimentoFinal,
    patrimonioFinalImovel,
    patrimonioCompraLiquidoFinal,
    diferencaFinal,
    diferencaLiquidaFinal,
    vencedor: getWinnerSide(diferencaFinal),
    vantagemValor: Math.abs(diferencaFinal),
    prestacaoInicial: first ? first.totalPrestacao : 0,
    prestacaoFinal: last ? last.totalPrestacao : 0,
    aluguelFinal: last ? last.aluguel : 0,
    jurosSobreFinanciadoPct: valorFinanciado > 0 ? totalJuros / valorFinanciado : 0,
  }

  return { rows, summary }
}

function buildAnnualRows(rows: MonthlyRow[]): AnnualRow[] {
  const annualMap = new Map<number, AnnualRow>()

  for (const r of rows) {
    let entry = annualMap.get(r.anoCalendario)
    if (!entry) {
      entry = {
        ano: r.anoCalendario,
        mesFinal: r.mes,
        segurosAno: 0,
        prestacaoAno: 0,
        iptuAno: 0,
        condAno: 0,
        amortizacaoAno: 0,
        jurosAno: 0,
        saldoDevedorFinal: r.saldoDevedor,
        totalPrestacaoAno: 0,
        aluguelAno: 0,
        excedenteAno: 0,
        investimentoFinal: r.investimento,
        imovelAtualizadoFinal: r.imovelAtualizado,
        patrimonioCompraLiquidoFinal: r.patrimonioCompraLiquido,
        diferencaPatrimonialFinal: r.diferencaPatrimonial,
        diferencaPatrimonialLiquidaFinal: r.diferencaPatrimonialLiquida,
      }
      annualMap.set(r.anoCalendario, entry)
    }

    entry.mesFinal = r.mes
    entry.segurosAno += r.seguros
    entry.prestacaoAno += r.prestacao
    entry.iptuAno += r.iptu
    entry.condAno += r.cond
    entry.amortizacaoAno += r.amortizacao
    entry.jurosAno += r.juros
    entry.saldoDevedorFinal = r.saldoDevedor
    entry.totalPrestacaoAno += r.totalPrestacao
    entry.aluguelAno += r.aluguel
    entry.excedenteAno += r.excedente
    entry.investimentoFinal = r.investimento
    entry.imovelAtualizadoFinal = r.imovelAtualizado
    entry.patrimonioCompraLiquidoFinal = r.patrimonioCompraLiquido
    entry.diferencaPatrimonialFinal = r.diferencaPatrimonial
    entry.diferencaPatrimonialLiquidaFinal = r.diferencaPatrimonialLiquida
  }

  return Array.from(annualMap.values())
}

function computeMilestones(rows: MonthlyRow[], entradaImovel: number): ScenarioMilestones {
  let mesAluguelSuperaPrestacao: number | null = null
  let mesPicoInvestimento = 0
  let valorPicoInvestimento = entradaImovel
  let mesReservaNegativa: number | null = null

  for (const r of rows) {
    if (mesAluguelSuperaPrestacao === null && r.aluguel > r.totalPrestacao) {
      mesAluguelSuperaPrestacao = r.mes
    }
    if (r.investimento > valorPicoInvestimento) {
      valorPicoInvestimento = r.investimento
      mesPicoInvestimento = r.mes
    }
    if (mesReservaNegativa === null && r.investimento < 0) {
      mesReservaNegativa = r.mes
    }
  }

  const last = rows[rows.length - 1]
  let mesViradaPatrimonialDefinitiva: number | null = null
  let vencedorNaVirada: WinnerSide = 'tie'

  if (last) {
    const finalBuyWins = last.diferencaPatrimonialLiquida < 0
    vencedorNaVirada = getWinnerSide(last.diferencaPatrimonialLiquida)

    // Encontra o último mês em que o vencedor definitivo assumiu a dianteira e não perdeu mais
    let lastFlipIndex = -1
    for (let i = rows.length - 1; i >= 0; i--) {
      const currBuyWins = rows[i].diferencaPatrimonialLiquida < 0
      if (currBuyWins !== finalBuyWins) {
        lastFlipIndex = i
        break
      }
    }

    if (lastFlipIndex >= 0 && lastFlipIndex + 1 < rows.length) {
      mesViradaPatrimonialDefinitiva = rows[lastFlipIndex + 1].mes
    } else if (lastFlipIndex === -1 && rows.length > 0) {
      mesViradaPatrimonialDefinitiva = 1
    }
  }

  return {
    mesAluguelSuperaPrestacao,
    mesPicoInvestimento,
    valorPicoInvestimento,
    mesReservaNegativa,
    mesViradaPatrimonialDefinitiva,
    vencedorNaVirada,
  }
}

function solveBreakEven(
  evaluateFn: (candidate: number) => number,
  lowStart: number,
  highStart: number,
): number | null {
  const fLow = evaluateFn(lowStart)
  const fHigh = evaluateFn(highStart)

  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh)) return null
  if (Math.abs(fLow) < 0.01) return lowStart
  if (Math.abs(fHigh) < 0.01) return highStart
  if ((fLow > 0 && fHigh > 0) || (fLow < 0 && fHigh < 0)) {
    return null
  }

  let lo = lowStart
  let hi = highStart
  let vLo = fLow

  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2
    const vMid = evaluateFn(mid)
    if (Math.abs(vMid) < 0.01) return mid
    if ((vLo > 0 && vMid > 0) || (vLo < 0 && vMid < 0)) {
      lo = mid
      vLo = vMid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

function computeBreakEven(input: ScenarioInput): BreakEvenMetrics {
  // 1. Aluguel inicial de equilíbrio (quanto maior o aluguel inicial, menor a diferença final)
  const aluguelEquilibrio = solveBreakEven(
    (aluguel) => simulateCore({ ...input, precoAluguelInicial: aluguel }).summary.diferencaFinal,
    0,
    Math.max(input.valorImovel * 0.05, 50000),
  )

  // 2. Rentabilidade mensal de equilíbrio (quanto maior a rentabilidade, maior o investimento)
  const rentabilidadeEquilibrioAM = solveBreakEven(
    (rentab) =>
      simulateCore({ ...input, rentabilidadeInvestimentoAM: rentab }).summary.diferencaFinal,
    0,
    0.05,
  )

  // 3. CET mensal de equilíbrio (quanto maior o juros, maior a prestação/excedente, maior investimento)
  const cetEquilibrioAM = solveBreakEven(
    (cet) => simulateCore({ ...input, cetJurosAM: cet }).summary.diferencaFinal,
    0,
    0.04,
  )

  return {
    aluguelEquilibrio,
    rentabilidadeEquilibrioAM,
    cetEquilibrioAM,
  }
}

export function calculateScenario(input: ScenarioInput): ScenarioResult {
  const { rows, summary } = simulateCore(input)
  const annualRows = buildAnnualRows(rows)
  const milestones = computeMilestones(rows, input.entradaImovel)
  const breakEven = computeBreakEven(input)

  return {
    input,
    rows,
    annualRows,
    summary,
    milestones,
    breakEven,
  }
}

export function evaluateAtHorizon(result: ScenarioResult, month: number): HorizonSnapshot {
  const clampedMonth = Math.max(1, Math.min(result.rows.length, Math.round(month)))
  const row = result.rows[clampedMonth - 1]

  let totalPagoCompraAteMes = result.input.entradaImovel
  let totalPagoAluguelAteMes = 0
  let excedenteAcumuladoAteMes = 0

  for (let i = 0; i < clampedMonth; i++) {
    const r = result.rows[i]
    totalPagoCompraAteMes += r.totalPrestacao
    totalPagoAluguelAteMes += r.aluguel
    excedenteAcumuladoAteMes += r.excedente
  }

  const diferencaLiquida = row.diferencaPatrimonialLiquida
  const vencedorLiquido = getWinnerSide(diferencaLiquida)

  return {
    mes: row.mes,
    ano: Number((row.mes / 12).toFixed(1)),
    imovelAtualizado: row.imovelAtualizado,
    saldoDevedor: row.saldoDevedor,
    patrimonioCompraLiquido: row.patrimonioCompraLiquido,
    investimento: row.investimento,
    diferencaLiquida,
    diferencaPlanilha: row.diferencaPatrimonial,
    vencedorLiquido,
    vantagemLiquida: Math.abs(diferencaLiquida),
    totalPagoCompraAteMes,
    totalPagoAluguelAteMes,
    excedenteAcumuladoAteMes,
    prestacaoNoMes: row.totalPrestacao,
    aluguelNoMes: row.aluguel,
  }
}
