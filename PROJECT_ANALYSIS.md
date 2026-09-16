# 📊 Análise do Projeto — Jira Agile Ops Dashboard

> Documento de validação técnica, identificação de dados mockados e proposta de melhorias, incluindo o design de um **painel de configuração de campos** para mapeamento flexível de campos Jira (padrão e customizados).

---

## 1. Visão Geral do Projeto

| Item | Detalhe |
|---|---|
| **Nome** | Agile Ops & Delivery Dashboard |
| **Stack** | React 19 + TypeScript + Vite 8 + TailwindCSS 4 |
| **State** | Zustand (persist via localStorage) |
| **Queries** | TanStack React Query v5 |
| **Charts** | Recharts v3 |
| **Routing** | React Router v7 (HashRouter) |
| **Deploy** | Atlassian Forge (iframe) + Standalone via CORS Proxy |
| **API** | Jira Cloud REST API v3 (`/rest/api/3/search/jql`) |

### Páginas / Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `DashboardMain` | KPIs, Throughput, Cycle Time, WIP, tabela de issues |
| `/indicadores` | `SectorMetricsMain` | Indicadores Setoriais (PE, BUS, WIP/dev) |
| `/backlog` | `BacklogMain` | Aging e tipo de backlog |
| `/quality` | `QualityMain` | Bugs por prioridade e por responsável |

---

## 2. Mapa Completo de Dados Mockados

Esta é a seção mais crítica. Abaixo estão **todos os dados hardcoded** encontrados no projeto, com o arquivo de origem e o impacto.

---

### 2.1 `sectorMetricsStore.ts` — Dados Manuais (Alto Impacto)

O store de Indicadores Setoriais contém dois meses com dados **totalmente fixos** que servem como seed inicial do `localStorage`.

```
src/store/sectorMetricsStore.ts
```

| Dado Mockado | Valor | Problema |
|---|---|---|
| `DEFAULT_AGOSTO_2026.pe.previsto` | `17` | Hardcoded, não vem do Jira |
| `DEFAULT_AGOSTO_2026.pe.executado` | `15` | Hardcoded, não vem do Jira |
| `DEFAULT_AGOSTO_2026.pe.agregado` | `88` | Calculado manualmente |
| `DEFAULT_AGOSTO_2026.bus.emExecucaoPico` | `31` | Hardcoded |
| `DEFAULT_AGOSTO_2026.wip.emExecucaoMediaDev` | `2.33` | Hardcoded |
| `DEFAULT_SETEMBRO_2026.*` | Todos os campos | Igualmente hardcoded |
| `createDefaultSectorialData()` defaults | `previsto: 15`, `executado: 12`, etc. | Valores-padrão genéricos |

**Impacto:** O usuário vê dados de "Agosto/2026" que não têm nenhuma relação com o projeto Jira configurado. Só a aba "Ao Vivo (Jira)" usa dados reais.

---

### 2.2 `WipPerDevChart.tsx` — Distribuição Fake por Dev (Médio Impacto)

```
src/components/SectorMetrics/WipPerDevChart.tsx  (linhas 34-41)
```

```typescript
// Default reference sample distribution matching August/2026 (Avg 2.33 tasks/dev)
return [
  { name: 'Dev 1', tasks: 4, overLimit: true },
  { name: 'Dev 2', tasks: 3, overLimit: true },
  { name: 'Dev 3', tasks: 3, overLimit: true },
  { name: 'Dev 4', tasks: 2, overLimit: false },
  { name: 'Dev 5', tasks: 2, overLimit: false },
  { name: 'Dev 6', tasks: 1, overLimit: false },
];
```

**Problema:** Quando `isLive = false`, o gráfico exibe 6 desenvolvedores fictícios ("Dev 1" ... "Dev 6") que não têm qualquer relação com o projeto do usuário.

---

### 2.3 `KPICards.tsx` — KPI "Stuck > 10d" (Baixo Impacto)

```
src/components/Dashboard/KPICards.tsx (linha 39)
```

```typescript
<Card title="Stuck > 10d" value={0 /* TODO: Aging calculation */} icon={Clock} color="amber" />
```

**Problema:** O card está exibindo sempre `0` com um `TODO` no código. Não calcula nada.

---

### 2.4 `SectorMetricsMain.tsx` — Lógica Live com Heurísticas Frágeis (Médio Impacto)

```
src/components/SectorMetrics/SectorMetricsMain.tsx (linhas 55-96)
```

A lógica "Ao Vivo" detecta issues de **PE** verificando se o `issuetype.name` contém `"epic"` ou `"iniciativa"`, ou se o `summary` contém `"[pe]"`. Similarmente, **BUS** é detectado por `"chamado"`, `"suporte"` ou `"bus"` no título.

**Problema:** Essas heurísticas de texto são frágeis. Em projetos onde os tipos de issue têm nomes diferentes (ex: "Story", "Initiative", "Service Request"), a detecção falha silenciosamente e cai no fallback de usar todos os issues como denominador.

---

### 2.5 `CycleTimeChart.tsx` — Simplificação do Cycle Time (Baixo-Médio Impacto)

```
src/components/Dashboard/CycleTimeChart.tsx (linhas 33-46)
```

O cálculo pega a **primeira transição de status** como início do trabalho. Para muitos projetos com fluxo Kanban, isso resulta em Cycle Times incorretos (na verdade calcula Lead Time aproximado, não Cycle Time real a partir de "In Progress").

**Problema:** A simplificação pode não corresponder ao conceito de Cycle Time do usuário (ex: deveria começar em "In Progress", não em qualquer mudança de status).

---

### 2.6 `ThroughputChart.tsx` — Ordenação de Semanas por Ano (Baixo Impacto)

```
src/components/Dashboard/ThroughputChart.tsx (linhas 32-39)
```

```typescript
// Simplificado assumindo mesmo ano para este exemplo
const [d1, m1] = a.split('/').map(Number);
const [d2, m2] = b.split('/').map(Number);
if (m1 !== m2) return m1 - m2;
return d1 - d2;
```

**Problema:** Quando o date range cruza o ano (ex: Dezembro/2025 → Janeiro/2026), a ordenação dos eixos X do gráfico fica errada.

---

### 2.7 `jiraAPI.ts` — Campo Story Points Hardcoded (Médio Impacto)

```
src/services/jiraAPI.ts (linha 86)
```

```typescript
'customfield_10016', // Story Points
```

**Problema:** O ID `customfield_10016` é o padrão para Story Points no Jira Cloud, mas **pode variar por instância**. Alguns projetos usam `customfield_10028`, `customfield_10034`, ou outro ID. O campo está hardcoded sem opção de configuração pelo usuário.

---

### 2.8 `filterStore.ts` — Campo `epics` Não Implementado no JQL

```
src/store/filterStore.ts + src/hooks/useIssuesQuery.ts
```

O `filterStore` tem o campo `epics: string[]`, mas o `useIssuesQuery` não gera cláusula JQL para ele. O filtro de épicos **não funciona**.

---

## 3. Diagnóstico de Arquitetura

| Área | Status | Observação |
|---|---|---|
| Autenticação / Setup | ✅ Funcional | Persistência em localStorage, suporte Forge |
| Conexão Jira API | ✅ Funcional | CORS proxy + Forge bridge |
| Filtros Globais | ⚠️ Parcial | Filtro `epics` não implementado no JQL |
| Dashboard KPIs | ⚠️ Parcial | "Stuck > 10d" sempre retorna 0 |
| Throughput Chart | ✅ Funcional | Bug menor na ordenação cross-year |
| Cycle Time Chart | ⚠️ Parcial | Simplificação pode ser incorreta para muitos fluxos |
| Indicadores Setoriais (Consolidado) | ⚠️ Mockado | Dados de Agosto/Setembro hardcoded |
| Indicadores Setoriais (Ao Vivo) | ✅ Funcional | Calcula em tempo real, mas usa heurísticas de texto |
| WipPerDevChart (Consolidado) | ❌ Mockado | Exibe "Dev 1 ... Dev 6" fictícios |
| BacklogAging Chart | ✅ Funcional | Calcula corretamente |
| BugPriority/BugAssignee | ✅ Funcional | Detecta bugs por nome de issuetype |
| Story Points | ⚠️ Hardcoded | `customfield_10016` fixo |
| Campo "Desenvolvedor" (WIP) | ⚠️ Hardcoded | Usa apenas `assignee`, sem opção para campo custom |

---

## 4. Melhorias Críticas (Alta Prioridade)

### A — Implementar o KPI "Stuck > 10d" Real

```typescript
// Em KPICards.tsx — substituir o TODO
const stuck10d = issues.filter(i => {
  if (i.fields?.status?.statusCategory?.key !== 'indeterminate') return false;
  const updated = new Date(i.fields.updated);
  return differenceInDays(new Date(), updated) > 10;
}).length;
```

### B — Corrigir Ordenação Cross-Year no ThroughputChart

Usar `startOfWeek` retornando a data completa `YYYY-MM-DD` como chave interna e apenas `dd/MM` como label de exibição:

```typescript
const weekKey = format(weekStart, 'yyyy-MM-dd');   // chave para ordenar
const weekLabel = format(weekStart, 'dd/MM');       // label para exibir
```

### C — Implementar Filtro de Épicos no JQL

```typescript
// Em useIssuesQuery.ts — adicionar após o filtro de assignees
if (epics.length > 0) {
  jql += ` AND "Epic Link" in (${epics.map(e => `"${e}"`).join(',')})`;
}
```

### D — Remover Distribuição Fake de Devs no Modo Consolidado

```tsx
// Em WipPerDevChart.tsx — substituir o bloco de dados mockados
if (!isLive || !jiraData?.issues?.length) {
  return (
    <div className="text-text-muted text-sm text-center py-8 italic">
      Distribuição por dev disponível apenas no modo "Ao Vivo (Jira)".
    </div>
  );
}
```

---

## 5. Proposta: Painel de Configuração de Campos (Field Mapping)

> **Esta é a melhoria mais estratégica do projeto.** Permite ao usuário mapear campos padrão e customizados do Jira sem alterar código. Torna o dashboard adaptável a qualquer instância Jira.

---

### 5.1 Conceito

Um painel acessível como aba "Field Mapping" na tela de configurações existente (`ConfigForm.tsx`) — ou por botão no `Header.tsx`. O usuário define quais campos do Jira correspondem a cada conceito do dashboard. Por padrão, os campos nativos do Jira já vêm preenchidos.

---

### 5.2 Campos Configuráveis

#### Grupo 1 — Campos de Pontuação e Esforço

| Label no Dashboard | Campo Padrão Jira | Config Key | Uso |
|---|---|---|---|
| **Story Points** | `customfield_10016` | `storyPointsField` | KPI de esforço, métricas PE |
| **Sprint** | `sprint` (nativo) | *(fixo por ora)* | Filtro global de sprint |

#### Grupo 2 — Classificação de Issues (Indicadores Setoriais)

| Conceito | Padrão | Config Key | Uso |
|---|---|---|---|
| **Issues de PE (Execução Estratégica)** | `Epic`, `Iniciativa` | `peIssueTypes` | Numerador/denominador das metas PE |
| **Issues de BUS (Demandas Interdep.)** | `Chamado`, `Suporte` | `busIssueTypes` | Contagem de chamados simultâneos |
| **Desenvolvedor Responsável (WIP)** | `assignee` (nativo) | `developerField` | Calcular WIP por dev |

#### Grupo 3 — Status Workflow Mapping

| Conceito | Padrão (status category) | Config Key | Uso |
|---|---|---|---|
| **In Progress** | `statusCategory = indeterminate` | `inProgressStatuses` | WIP, KPI "Em andamento" |
| **Done** | `statusCategory = done` | `doneStatuses` | Throughput, Cycle Time |
| **Blocked / Stuck** | *(não detectado)* | `blockedStatuses` | KPI "Stuck > 10d" |
| **QA / Test** | status name contendo `"qa"` | `qaStatuses` | KPI "QA Queue" |

#### Grupo 4 — Labels e Componentes

| Conceito | Padrão | Config Key |
|---|---|---|
| **Label para PE** | `"[pe]"` no summary | `peLabelFilter` |
| **Componente para BUS** | *(nenhum)* | `busComponentFilter` |

---

### 5.3 Estrutura de Dados — `fieldMappingStore.ts` (novo arquivo)

```typescript
// src/store/fieldMappingStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FieldMappingConfig {
  storyPointsField: string;        // default: "customfield_10016"
  peIssueTypes: string[];          // default: ["Epic", "Iniciativa", "Initiative"]
  busIssueTypes: string[];         // default: ["Chamado", "Suporte", "Service Request"]
  developerField: string;          // default: "assignee"
  inProgressStatuses: string[];    // default: [] (usa statusCategory indeterminate)
  doneStatuses: string[];          // default: [] (usa statusCategory done)
  blockedStatuses: string[];       // default: ["Blocked", "Impedido"]
  qaStatuses: string[];            // default: ["QA", "Review", "Testing", "Test"]
  peLabelFilter: string;           // default: "[pe]"
  busComponentFilter: string;      // default: ""
}

export const DEFAULT_FIELD_MAPPING: FieldMappingConfig = {
  storyPointsField: 'customfield_10016',
  peIssueTypes: ['Epic', 'Iniciativa', 'Initiative'],
  busIssueTypes: ['Chamado', 'Suporte', 'Service Request'],
  developerField: 'assignee',
  inProgressStatuses: [],
  doneStatuses: [],
  blockedStatuses: ['Blocked', 'Impedido'],
  qaStatuses: ['QA', 'Review', 'Testing', 'Test'],
  peLabelFilter: '[pe]',
  busComponentFilter: '',
};

interface FieldMappingState extends FieldMappingConfig {
  setMapping: (config: Partial<FieldMappingConfig>) => void;
  resetToDefaults: () => void;
}

export const useFieldMappingStore = create<FieldMappingState>()(
  persist(
    (set) => ({
      ...DEFAULT_FIELD_MAPPING,
      setMapping: (config) => set((state) => ({ ...state, ...config })),
      resetToDefaults: () => set(DEFAULT_FIELD_MAPPING),
    }),
    { name: 'jira-field-mapping-config' }
  )
);
```

---

### 5.4 UI do Painel — Wireframe ASCII

```
┌────────────────────────────────────────────────────────────────┐
│  ⚙ Configurações   [Conexão Jira]  [Field Mapping ←]          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📌 Campos de Pontuação                                        │
│  ┌────────────────────────────────────────┐                    │
│  │ Story Points Field ID                  │                    │
│  │ [customfield_10016              ] [?]  │                    │
│  │ Dica: customfield_10028, story_points  │                    │
│  └────────────────────────────────────────┘                    │
│                                                                │
│  📊 Indicadores Setoriais — Tipos de Issue                     │
│  ┌────────────────────────────────────────┐                    │
│  │ Issue Types para PE (Exec. Estratégica)│                    │
│  │ [× Epic] [× Iniciativa] [+ Adicionar]  │                    │
│  └────────────────────────────────────────┘                    │
│  ┌────────────────────────────────────────┐                    │
│  │ Issue Types para BUS (Interdepartam.)  │                    │
│  │ [× Chamado] [× Suporte] [+ Adicionar]  │                    │
│  └────────────────────────────────────────┘                    │
│                                                                │
│  👤 Campo de Desenvolvedor (WIP por Dev)                       │
│  ┌────────────────────────────────────────┐                    │
│  │ ◉ Assignee (campo nativo Jira)         │                    │
│  │ ○ Campo customizado:                   │                    │
│  │   [customfield_10050          ]        │                    │
│  │   Ex: campo "Dev", "Desenvolvedor"     │                    │
│  └────────────────────────────────────────┘                    │
│                                                                │
│  🔄 Mapeamento de Status do Workflow                           │
│  ┌────────────────────────────────────────┐                    │
│  │ Statuses "Em Progresso"                │                    │
│  │ ◉ Categoria padrão (recomendado)       │                    │
│  │ ○ Customizar: [In Progress] [Dev] [+]  │                    │
│  └────────────────────────────────────────┘                    │
│  ┌────────────────────────────────────────┐                    │
│  │ Statuses "Concluído"                   │                    │
│  │ ◉ Categoria padrão (recomendado)       │                    │
│  │ ○ Customizar: [Done] [Released] [+]    │                    │
│  └────────────────────────────────────────┘                    │
│  ┌────────────────────────────────────────┐                    │
│  │ Statuses "QA / Revisão"                │                    │
│  │ [× QA] [× Testing] [× Review] [+]      │                    │
│  └────────────────────────────────────────┘                    │
│  ┌────────────────────────────────────────┐                    │
│  │ Statuses "Bloqueado"                   │                    │
│  │ [× Blocked] [× Impedido] [+ Adicionar] │                    │
│  └────────────────────────────────────────┘                    │
│                                                                │
│  ──────────────────────────────────────────────               │
│  [↩ Resetar Padrões]          [💾 Salvar Configurações]       │
└────────────────────────────────────────────────────────────────┘
```

---

### 5.5 Impacto do Field Mapping em Cada Componente

| Componente | Campos Afetados | Benefício |
|---|---|---|
| `KPICards.tsx` | `qaStatuses`, `blockedStatuses` | KPI "QA Queue" e "Stuck > 10d" com status reais |
| `ThroughputChart.tsx` | `doneStatuses` | Contagem usa statuses customizados do projeto |
| `CycleTimeChart.tsx` | `inProgressStatuses`, `doneStatuses` | Cycle Time inicia no status correto de "In Progress" |
| `WipPerDevChart.tsx` | `developerField`, `inProgressStatuses` | WIP por dev usa campo correto (custom ou assignee) |
| `SectorMetricsMain.tsx` | `peIssueTypes`, `busIssueTypes` | Detecção de PE e BUS sem heurísticas de texto frágeis |
| `jiraAPI.ts` | `storyPointsField`, `developerField` | API busca os campos corretos dinamicamente |

---

## 6. Roteiro de Implementação

### Fase 1 — Correções de Bugs (1–2 dias)
- [ ] Corrigir `ThroughputChart` — ordenação cross-year de semanas
- [ ] Implementar cálculo real de "Stuck > 10d" em `KPICards`
- [ ] Implementar filtro de épicos (`epics`) no JQL do `useIssuesQuery`
- [ ] Remover distribuição fake de devs no `WipPerDevChart` modo consolidado

### Fase 2 — Field Mapping Store (2–3 dias)
- [ ] Criar `src/store/fieldMappingStore.ts` com defaults + persist
- [ ] Atualizar `jiraAPI.ts` para usar `storyPointsField` dinamicamente
- [ ] Refatorar `SectorMetricsMain.tsx` — substituir heurísticas de texto por `peIssueTypes` e `busIssueTypes`
- [ ] Refatorar `KPICards.tsx` — usar `qaStatuses` e `blockedStatuses`
- [ ] Refatorar `CycleTimeChart.tsx` — usar `inProgressStatuses` como ponto de início do ciclo

### Fase 3 — UI do Painel de Configuração (3–4 dias)
- [ ] Criar `src/components/Settings/FieldMappingPanel.tsx`
- [ ] Criar componente `TagInput` (entrada de múltiplos valores com tags removíveis)
- [ ] Integrar painel como segunda aba no `ConfigForm.tsx` ou via link "Configurações Avançadas"
- [ ] Adicionar botão ⚙ de acesso ao painel no `Header.tsx`

### Fase 4 — Indicadores Setoriais Dinâmicos (2–3 dias)
- [ ] Adicionar opção "Calcular automaticamente do Jira" nos defaults do `sectorMetricsStore`
- [ ] Implementar lógica de auto-seed baseada em dados Jira reais do período selecionado
- [ ] Substituir "Dev 1..Dev 6" por dados reais no gráfico de WIP consolidado

---

## 7. Melhorias de UX e Qualidade Adicionais

| # | Melhoria | Impacto |
|---|---|---|
| 1 | **Paginação**: API retorna `maxResults=100`. Implementar `startAt` paginado ou aviso "X de Y itens carregados" | Alto |
| 2 | **Loading skeletons**: `BacklogMain` e `QualityMain` não têm skeletons de carregamento | Médio |
| 3 | **Error boundaries**: Sem tratamento de erro nas telas de Backlog e Quality | Médio |
| 4 | **Internacionalização**: Mistura PT-BR e EN no código (labels, botões, mensagens) | Baixo |
| 5 | **Export PNG temas**: Dark mode funcional, mas export PNG pode usar tema errado em alguns browsers | Baixo |
| 6 | **Acessibilidade**: Inputs e selects sem `aria-label` explícito | Médio |
| 7 | **Cycle Time configurável**: Tornar configurável qual status marca "início" e "fim" do ciclo | Alto |
| 8 | **Story Points em gráficos**: Campo carregado mas nenhum gráfico o exibe ainda | Médio |
| 9 | **Exportação CSV**: Adicionar exportação da tabela de issues em CSV além do PNG | Médio |
| 10 | **Badge de alerta WIP**: Quando WIP > limite configurado, exibir badge de alerta no Sidebar | Alto |

---

## 8. Sumário Executivo

```
Dados completamente mockados:      3 (WipPerDevChart consolidado,
                                      DEFAULT_AGOSTO_2026, DEFAULT_SETEMBRO_2026)
Dados parcialmente incorretos:     4 (KPI Stuck, Throughput cross-year,
                                      CycleTime simplificado, detecção PE/BUS por texto)
Funcionalidades não-implementadas: 1 (filtro de épicos)
Campos hardcoded críticos:         2 (customfield_10016, assignee como único dev field)

MAIOR GANHO IMEDIATO:
  Implementar o FieldMappingPanel elimina 5 dos 10 problemas identificados
  e torna o dashboard adaptável a qualquer instância Jira — sem alterar código.
```

---

*Gerado em: 16/09/2026 | Projeto: nfbrentano/jira-dashboard*
