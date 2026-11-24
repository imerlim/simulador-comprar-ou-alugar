<div align="center">

# 🏠 Comprar ou Alugar?

### Simulador financeiro: financiamento imobiliário vs. aluguel + investimento

Descubra, mês a mês, se vale mais a pena **financiar um imóvel** ou **morar de aluguel e investir a diferença**, com cálculo de SAC/Price, seguros MIP/DFI, IPTU, condomínio e reajustes anuais.

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/licença-MIT-blue)
![Status](https://img.shields.io/badge/status-ativo-success)

</div>

---

## 📖 Sobre o projeto

Na hora de decidir entre comprar um imóvel financiado ou continuar no aluguel, a conta costuma ficar presa em planilhas. Este simulador leva essa planilha para uma aplicação web rápida e visual, que roda **100% no navegador**.

A ideia é simples:

- **Cenário Compra:** você dá a entrada, paga a prestação do financiamento (amortização, juros, seguros e taxa de administração), além de IPTU e condomínio. O imóvel se valoriza ao longo do tempo.
- **Cenário Aluguel + Investimento:** você investe o valor que seria a entrada. Todo mês paga o aluguel, e **a diferença entre o custo da compra e o aluguel vai para o investimento**, que rende juros compostos.

No fim do prazo (ou em qualquer horizonte que você escolher), o simulador compara o **patrimônio de cada caminho** e mostra qual saiu na frente e por quanto.

## ✨ Funcionalidades

- **Veredito instantâneo:** um card de destaque mostra o vencedor (comprar ou investir), a vantagem em reais e um controle de **horizonte de análise** para ver o resultado em qualquer mês.
- **Vários cenários:** crie, duplique, renomeie e remova cenários, cada um com sua cor. Três cenários de exemplo já vêm prontos.
- **Comparação lado a lado** entre todos os cenários criados.
- **Sistemas de amortização SAC e Price.**
- **Três modos de cálculo de seguro:**
  - `Planilha`: valores mês a mês, que você pode colar direto de uma planilha.
  - `Automático (padrão Caixa)`: DFI sobre o valor do imóvel + MIP por faixa etária sobre o saldo devedor.
  - `Fixo`: um valor mensal constante.
- **Gráficos interativos:** evolução patrimonial e fluxo de caixa mensal.
- **Composição de custos:** quanto do total pago vai para juros, amortização, seguros, IPTU e condomínio.
- **Marcos da simulação:** mês em que o aluguel passa a prestação, pico do investimento, mês da virada patrimonial definitiva e eventual reserva negativa.
- **Pontos de equilíbrio (break-even):** calcula o aluguel inicial, a rentabilidade mensal e o CET que deixariam os dois cenários empatados.
- **Tabela de amortização completa** com visão mensal e anual.
- **Exportação para CSV** da simulação mês a mês.
- **Tema claro e escuro**, com detecção da preferência do sistema.
- **Salvamento automático** dos cenários no `localStorage`: nada sai do seu navegador.

## 🧮 Como o cálculo funciona

Para cada mês `m` do prazo:

| Item | Fórmula |
|---|---|
| Juros | `saldo devedor anterior × CET mensal` |
| Amortização (SAC) | `valor financiado ÷ nº de meses` |
| Amortização (Price) | `PMT − juros` |
| Prestação | `amortização + juros + seguros + taxa adm.` |
| Custo total da compra | `prestação + IPTU + condomínio` |
| Aluguel | `aluguel inicial × (1 + reajuste anual)^ano` |
| Excedente | `custo total da compra − aluguel` |
| Investimento | `(investimento anterior + excedente) × (1 + rentabilidade mensal)` |
| Imóvel atualizado | `valor do imóvel × (1 + valorização anual)^ano` |
| Patrimônio líquido da compra | `imóvel atualizado − saldo devedor` |

O investimento começa com o valor da entrada. Os reajustes de aluguel, valorização do imóvel e, opcionalmente, de IPTU e condomínio acontecem uma vez por ano.

Os pontos de equilíbrio são encontrados por **bisseção numérica**, rodando a simulação inteira várias vezes até achar o valor do parâmetro que zera a diferença final.

> ⚠️ **Aviso:** este projeto é uma ferramenta educacional de simulação. Ele não considera impostos sobre rendimentos, custos de escritura/ITBI, inflação real nem riscos de mercado, e **não é recomendação financeira**. Consulte um profissional antes de tomar decisões.

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) | Interface e reatividade |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem do motor financeiro e dos componentes |
| [Vite](https://vite.dev/) | Servidor de desenvolvimento e build |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilização e tema claro/escuro |
| SVG nativo | Gráficos, sem bibliotecas externas |

A aplicação não tem backend e tem só uma dependência de runtime (`vue`).

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) **20.19+** ou **22.12+** (exigido pelo Vite 8)
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/imerlim/simulador-comprar-ou-alugar.git
cd simulador-comprar-ou-alugar

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Depois, abra **http://localhost:5173** no navegador.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o build de produção na pasta `dist/` |
| `npm run preview` | Serve localmente o build de produção |
| `npm run type-check` | Verifica os tipos com `vue-tsc` |

## 📁 Estrutura do projeto

```
src/
├── components/                  # Componentes de interface
│   ├── AppHeader.vue            # Cabeçalho, abas, tema e exportação
│   ├── ScenarioTabsBar.vue      # Barra de cenários (criar, duplicar, remover)
│   ├── ScenarioFormSidebar.vue  # Formulário de parâmetros do cenário
│   ├── VerdictHeroCard.vue      # Veredito e horizonte de análise
│   ├── SpreadsheetSummaryCards.vue
│   ├── PatrimonyChart.vue       # Gráfico de evolução patrimonial
│   ├── MonthlyCashflowChart.vue # Gráfico de fluxo de caixa mensal
│   ├── CostBreakdownCard.vue    # Composição dos custos
│   ├── ScenarioComparisonView.vue
│   ├── AmortizationTableView.vue
│   ├── InsurancePasteModal.vue  # Colar seguros de uma planilha
│   ├── MoneyInput.vue           # Input monetário formatado em BRL
│   └── AppIcon.vue
├── composables/
│   ├── useFinancialEngine.ts    # Motor de cálculo (SAC/Price, seguros, marcos, break-even)
│   ├── useScenarios.ts          # Estado e persistência dos cenários
│   └── useTheme.ts              # Tema claro/escuro
├── data/
│   └── defaultSpreadsheetSeguros.ts  # Cenários e seguros padrão
├── types/
│   └── scenario.ts              # Tipos e interfaces do domínio
├── utils/
│   └── formatters.ts            # Formatação de moeda/percentual e exportação CSV
├── App.vue
├── main.ts
└── style.css
```

## 📦 Deploy

O build gera arquivos estáticos em `dist/`, então dá para publicar em qualquer hospedagem estática, como **Vercel**, **Netlify**, **GitHub Pages** ou **Cloudflare Pages**.

```bash
npm run build
```

> Para o GitHub Pages em um subdiretório (`https://<usuario>.github.io/<repo>/`), defina `base: '/<repo>/'` no `vite.config.ts`.

## 🗺️ Próximos passos

- [ ] Imposto de renda sobre os rendimentos do investimento
- [ ] Custos de aquisição (ITBI, escritura e registro)
- [ ] Amortizações extraordinárias no financiamento
- [ ] Uso do FGTS na entrada e nas amortizações
- [ ] Valores reais (descontando a inflação)
- [ ] Compartilhar cenários por link

## 🤝 Contribuindo

Contribuições são bem-vindas.

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça commit das mudanças: `git commit -m "feat: minha feature"`
4. Envie para o seu fork: `git push origin feature/minha-feature`
5. Abra um Pull Request

Antes de abrir o PR, rode `npm run type-check` e `npm run build` para garantir que está tudo certo.

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ☕ e muitas planilhas.

</div>
