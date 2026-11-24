import type { ScenarioInput } from '@/types/scenario'

// Exatamente os 420 valores da coluna "Seguros/FGHAB" da planilha original (soma = 15611.29, mês 420 = 0)
export const DEFAULT_SPREADSHEET_SEGUROS: readonly number[] = [
  // Meses 1-12
  30.33, 30.29, 30.26, 30.22, 30.19, 30.15, 30.12, 30.08, 30.05, 30.01, 29.98, 29.94,
  // Meses 13-24
  29.9, 29.87, 29.83, 29.8, 29.76, 29.73, 29.69, 29.66, 29.62, 29.59, 29.55, 29.52,
  // Meses 25-36
  29.48, 33.19, 33.15, 33.1, 33.06, 33.01, 32.97, 32.92, 32.88, 32.83, 32.79, 32.74,
  // Meses 37-48
  32.7, 32.66, 32.61, 32.57, 32.52, 32.48, 32.43, 32.39, 32.34, 32.3, 32.25, 32.21,
  // Meses 49-60
  32.16, 32.12, 32.08, 32.03, 31.99, 31.94, 31.9, 31.85, 31.81, 31.76, 31.72, 31.67,
  // Meses 61-72
  31.63, 31.59, 31.54, 31.5, 31.45, 31.41, 31.36, 31.32, 31.27, 31.23, 31.18, 31.14,
  // Meses 73-84
  31.09, 31.05, 31.01, 30.96, 30.92, 30.87, 30.83, 30.78, 30.74, 30.69, 30.65, 30.6,
  // Meses 85-96
  30.56, 35.48, 35.42, 35.36, 35.3, 35.24, 35.18, 35.12, 35.06, 35, 34.94, 34.89,
  // Meses 97-108
  34.83, 34.77, 34.71, 34.65, 34.59, 34.53, 34.47, 34.41, 34.35, 34.29, 34.23, 34.17,
  // Meses 109-120
  34.11, 34.05, 33.99, 33.93, 33.87, 33.81, 33.76, 33.7, 33.64, 33.58, 33.52, 33.46,
  // Meses 121-132
  33.4, 33.34, 33.28, 33.22, 33.16, 33.1, 33.04, 32.98, 32.92, 32.86, 32.8, 32.74,
  // Meses 133-144
  32.69, 32.63, 32.57, 32.51, 32.45, 32.39, 32.33, 32.27, 32.21, 32.15, 32.09, 32.03,
  // Meses 145-156
  31.97, 43.23, 43.13, 43.02, 42.92, 42.82, 42.72, 42.62, 42.52, 42.42, 42.32, 42.22,
  // Meses 157-168
  42.12, 42.02, 41.92, 41.82, 41.71, 41.61, 41.51, 41.41, 41.31, 41.21, 41.11, 41.01,
  // Meses 169-180
  40.91, 40.81, 40.71, 40.61, 40.51, 40.4, 40.3, 40.2, 40.1, 40, 39.9, 39.8,
  // Meses 181-192
  39.7, 39.6, 39.5, 39.4, 39.3, 39.2, 39.1, 38.99, 38.89, 38.79, 38.69, 38.59,
  // Meses 193-204
  38.49, 38.39, 38.29, 38.19, 38.09, 37.99, 37.89, 37.79, 37.68, 37.58, 37.48, 37.38,
  // Meses 205-216
  37.28, 47.34, 47.19, 47.05, 46.9, 46.75, 46.6, 46.45, 46.31, 46.16, 46.01, 45.86,
  // Meses 217-228
  45.71, 45.56, 45.42, 45.27, 45.12, 44.97, 44.82, 44.67, 44.53, 44.38, 44.23, 44.08,
  // Meses 229-240
  43.93, 43.79, 43.64, 43.49, 43.34, 43.19, 43.04, 42.9, 42.75, 42.6, 42.45, 42.3,
  // Meses 241-252
  42.15, 42.01, 41.86, 41.71, 41.56, 41.41, 41.27, 41.12, 40.97, 40.82, 40.67, 40.52,
  // Meses 253-264
  40.38, 40.23, 40.08, 39.93, 39.78, 39.63, 39.49, 39.34, 39.19, 39.04, 38.89, 38.74,
  // Meses 265-276
  38.6, 56.64, 56.37, 56.1, 55.84, 55.57, 55.3, 55.04, 54.77, 54.5, 54.24, 53.97,
  // Meses 277-288
  53.71, 53.44, 53.17, 52.91, 52.64, 52.37, 52.11, 51.84, 51.57, 51.31, 51.04, 50.78,
  // Meses 289-300
  50.51, 50.24, 49.98, 49.71, 49.44, 49.18, 48.91, 48.65, 48.38, 48.11, 47.85, 47.58,
  // Meses 301-312
  47.31, 47.05, 46.78, 46.51, 46.25, 45.98, 45.72, 45.45, 45.18, 44.92, 44.65, 44.38,
  // Meses 313-324
  44.12, 43.85, 43.58, 43.32, 43.05, 42.79, 42.52, 42.25, 41.99, 41.72, 41.45, 41.19,
  // Meses 325-336
  40.92, 45.27, 44.96, 44.64, 44.33, 44.01, 43.7, 43.38, 43.07, 42.75, 42.43, 42.12,
  // Meses 337-348
  41.8, 41.49, 41.17, 40.86, 40.54, 40.23, 39.91, 39.6, 39.28, 38.96, 38.65, 38.33,
  // Meses 349-360
  38.02, 37.7, 37.39, 37.07, 36.76, 36.44, 36.13, 35.81, 35.49, 35.18, 34.86, 34.55,
  // Meses 361-372
  34.23, 33.92, 33.6, 33.29, 32.97, 32.66, 32.34, 32.02, 31.71, 31.39, 31.08, 30.76,
  // Meses 373-384
  30.45, 30.13, 29.82, 29.5, 29.18, 28.87, 28.55, 28.24, 27.92, 27.61, 27.29, 26.98,
  // Meses 385-396
  26.66, 33.81, 33.28, 32.74, 32.21, 31.67, 31.14, 30.6, 30.07, 29.53, 29, 28.46,
  // Meses 397-408
  27.93, 27.39, 26.86, 26.32, 25.79, 25.25, 24.72, 24.18, 23.65, 23.11, 22.58, 22.04,
  // Meses 409-420
  21.51, 20.97, 20.44, 19.9, 19.37, 18.83, 18.3, 17.76, 17.22, 16.69, 16.15, 0,
]

export const SCENARIO_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
]

export function createDefaultScenarios(): ScenarioInput[] {
  return [
    {
      id: 'planilha-original',
      name: 'Planilha Original (R$ 130 mil)',
      color: SCENARIO_COLORS[0],
      valorImovel: 130000,
      entradaImovel: 26000,
      iptuMensal: 0,
      condMensal: 0,
      reajustarCondIptuAnualmente: false,
      cetJurosAM: 0.00816,
      precoAluguelInicial: 1000,
      rentabilidadeInvestimentoAM: 0.01,
      atualizaAluguelAA: 0.06,
      indiceAtualizImovelAA: 0.06,
      numeroMeses: 420,
      taxaAdm: 25,
      sistemaAmortizacao: 'SAC',
      insuranceMode: 'spreadsheet',
      idadeComprador: 29,
      seguroFixoMensal: 35,
      customSeguros: [...DEFAULT_SPREADSHEET_SEGUROS],
    },
    {
      id: 'apartamento-medio',
      name: 'Apartamento Médio (R$ 350 mil)',
      color: SCENARIO_COLORS[1],
      valorImovel: 350000,
      entradaImovel: 70000,
      iptuMensal: 120,
      condMensal: 450,
      reajustarCondIptuAnualmente: false,
      cetJurosAM: 0.0088,
      precoAluguelInicial: 1600,
      rentabilidadeInvestimentoAM: 0.0095,
      atualizaAluguelAA: 0.055,
      indiceAtualizImovelAA: 0.055,
      numeroMeses: 360,
      taxaAdm: 25,
      sistemaAmortizacao: 'SAC',
      insuranceMode: 'caixa_auto',
      idadeComprador: 30,
      seguroFixoMensal: 85,
      customSeguros: [...DEFAULT_SPREADSHEET_SEGUROS],
    },
    {
      id: 'juros-altos-renda-fixa',
      name: 'Juros Altos / Renda Fixa Forte (R$ 500 mil)',
      color: SCENARIO_COLORS[2],
      valorImovel: 500000,
      entradaImovel: 100000,
      iptuMensal: 180,
      condMensal: 650,
      reajustarCondIptuAnualmente: true,
      cetJurosAM: 0.0098,
      precoAluguelInicial: 1850,
      rentabilidadeInvestimentoAM: 0.011,
      atualizaAluguelAA: 0.05,
      indiceAtualizImovelAA: 0.05,
      numeroMeses: 360,
      taxaAdm: 25,
      sistemaAmortizacao: 'SAC',
      insuranceMode: 'caixa_auto',
      idadeComprador: 32,
      seguroFixoMensal: 120,
      customSeguros: [...DEFAULT_SPREADSHEET_SEGUROS],
    },
  ]
}
