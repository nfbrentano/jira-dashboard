# 📊 Dashboard Operacional Jira

Uma Single Page Application (SPA) moderna, responsiva e totalmente estática, hospedada no **GitHub Pages**, para monitoramento em tempo real de métricas operacionais de times de produto/engenharia a partir da **API do Jira Cloud**.

![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5+-purple?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🎯 Visão Geral

O Dashboard Operacional Jira fornece uma visualização centralizada e acionável de:
- ✅ Distribuição de itens por status (WIP, fila de testes, etc.)
- ✅ Itens estagnados (aging) - quanto tempo cada item ficou parado na mesma coluna
- ✅ Distribuição de responsabilidades entre o time
- ✅ Gargalo de QA (fila de testes vs. em validação)
- ✅ Rastreabilidade de código (PR/Branch vinculado)
- ✅ Gestão de Release Versions
- ✅ Métricas de backlog e qualidade de bugs

**Totalmente estático** → Sem backend necessário. Hospedado diretamente no GitHub Pages.

---

## 🚀 Quick Start

### 1. Clone o Repositório
```bash
git clone https://github.com/nfbrentano/jira-dashboard.git
cd jira-dashboard
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Proxy CORS (Importante!)

Como a aplicação roda no navegador, chamadas diretas ao Jira Cloud são bloqueadas por CORS. Você precisa de um proxy reverso:

#### Opção A: Usar Cloudflare Worker (Recomendado)
1. Crie uma conta em [Cloudflare](https://dash.cloudflare.com/)
2. Vá para **Workers & Pages** → **Create application** → **Create a Worker**
3. Cole este código:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response('Missing "url" parameter', { status: 400 });
    }
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', '*');
    
    return newResponse;
  },
};
```

4. Deploy e copie a URL do worker (ex: `https://seu-proxy.workers.dev`)

#### Opção B: CORS Anywhere (Desenvolvimento)
Para desenvolvimento rápido, use [CORS Anywhere](https://cors-anywhere.herokuapp.com/):
- URL: `https://cors-anywhere.herokuapp.com/?url=`
- ⚠️ Não recomendado para produção

### 4. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:5173` e configure suas credenciais Jira na aba de Setup.

---

## ⚙️ Stack Tecnológica

| Tecnologia | Propósito |
|---|---|
| **React 18+** | Framework UI moderno |
| **TypeScript** | Type safety e melhor DX |
| **Vite** | Build tool ultra-rápido |
| **Tailwind CSS** | Estilização utilitária responsiva |
| **Lucide Icons** | Ícones modernos |
| **Recharts** | Gráficos e visualizações |
| **TanStack Query** | Caching e sincronização de dados |
| **Zustand** | Gerenciamento de estado leve |
| **localStorage** | Persistência local de config |

---

## 📋 Configuração Inicial

### Modal de Setup

Ao abrir a aplicação, você verá um formulário para configurar:

**Campos Obrigatórios:**
- 🔗 **Jira Domain:** ex: `sua-empresa.atlassian.net`
- 📧 **Email da Conta Atlassian:** ex: `seu.email@empresa.com`
- 🔑 **API Token do Jira:** Gerar em https://id.atlassian.com/manage-profile/security/api-tokens
- 🌐 **CORS Proxy URL (Recomendado):** ex: `https://seu-proxy.workers.dev/?url=`

**Funcionalidades:**
- ✅ Botão "Testar Conexão" → Validação imediata via `/rest/api/3/myself`
- ✅ Seletor de Projeto Dinâmico → Busca via `/rest/api/3/project`
- ✅ Persistência automática em localStorage
- ✅ Indicador visual de status (conectado ✓ / desconectado ✗)
- ✅ Botão para limpar cache e reconectar

---

## 📊 Dashboard Operacional (Aba Principal)

### 1️⃣ Seção Superior: KPIs de Status

**Cards de Destaque (6 métricas):**
- `📌 Total de Itens` no projeto selecionado
- `⚡ Em Progresso (WIP)` com alerta se > limite
- `🧪 Fila de Testes` (status = "Pronto para QA")
- `🔍 Em Teste` (status = "Com QA")
- `✅ Concluído este Sprint` (se Sprint ativo)
- `⚠️ Itens sem Release Version` (alerta)

**Gráfico de Distribuição por Status:**
- Barras horizontais mostrando quantidade de itens em cada coluna do fluxo
- Exemplo: `To Do → In Progress → Code Review → Pronto para QA → Com QA → Done`
- Cores diferenciadas por status
- Clicável: Filtrar tabela ao clicar em uma barra

### 2️⃣ Tabela de Itens Estagnados (Aging)

**Identifica rapidamente o que está travado:**

| Issue Key | Resumo | Status Atual | Responsável | Tempo Parado | Prioridade |
|---|---|---|---|---|---|
| ECASH-123 | Implementar API de Pagamento | In Progress | João Silva | 15 dias 🔴 | High |
| ECASH-112 | Revisar Código | Code Review | Maria Santos | 8 dias 🟡 | Medium |

**Alertas Visuais:**
- 🟡 **Amarelo:** > 5 dias na mesma coluna
- 🔴 **Vermelho:** > 10 dias na mesma coluna
- 🔵 **Azul:** < 5 dias (em dia)

**Filtros:**
- Ordenação por "Dias Parado" (descendente por padrão)
- Filtro por Status
- Limite: Top 15 itens mais velhos (com paginação)

**Issue Key é clicável** → Abre a issue diretamente no Jira em nova aba

### 3️⃣ Distribuição por Responsável

**Gráfico de Pizza ou Barras Horizontais:**
- Quantidade de itens atribuídos a cada desenvolvedor/membro do time
- Segmento "👤 Não Atribuído" destacado em vermelho
- Tooltip com percentual e contagem exata
- Clicável: Filtrar tabela para mostrar apenas itens deste responsável

**Card Complementar:**
- Média de itens por pessoa
- Pessoa com maior carga (potencial rebalanceamento)
- Itens "orfãos" (unassigned) com CTA destacado

### 4️⃣ Fila e Gargalo de QA (Destaque Especial)

**Dois Cards Lado a Lado:**

| 🧪 Fila de Testes | 🔍 Em Validação |
|---|---|
| Contagem total de "Pronto para QA" | Contagem total de "Com QA" |
| ⏱️ Tempo médio na fila | ⏱️ Tempo médio em teste |
| 📋 Lista rápida (primeiros 5 itens) | 👥 Testadores envolvidos |
| 🔴 Alerta se fila > 10 itens | ⚠️ Itens bloqueados/com feedback |

**Micro-tabela abaixo de cada card:**
- Primeiros 5 itens com Key, Resumo, Data de entrada, Testador
- Clique na Key abre issue no Jira em nova aba

### 5️⃣ Rastreabilidade de Código (Git/Bitbucket/GitHub)

**Dois Cards de Alerta lado a lado:**

| ✅ Itens COM Código Vinculado | ❌ Itens SEM Código Vinculado |
|---|---|
| **X itens (YY%)** | **Z itens (WW%)** |
| 📊 Breakdown: PR, Branch, Commit | 🔴 Destacado em vermelho |

**Tabela Filtrada: "Sem Código"**
- Mostra itens em `In Progress` ou `Code Review` **sem PR/Branch vinculado**
- Colunas: Key | Resumo | Responsável | Status | Dias sem código
- CTA: "Cobrar Dev" (cópia automática ou link para comentar no Jira)

**Como funciona:**
- Usa `/rest/dev-status/1.0/issue/detail` (dev-status API do Jira)
- Verifica se há PR, Branch ou Commit vinculado
- Calcula tempo desde entrada no status de código

### 6️⃣ Gestão de Releases e Fix Versions

**Card de Alerta:**
- 🚀 **Itens sem Release Version:** Contagem de itens **sem FixVersion preenchida**
- Cor vermelha se > 20% do total
- Link: "Ver itens" → Abre tabela filtrada

**Gráfico de Barras Empilhadas (Horizontal):**
```
v1.2.0  [████ 5 Done ██ 2 In Progress █ 1 To Do]
v1.3.0  [██ 2 Done ████████ 8 In Progress]
v2.0.0  [█████████ 9 To Do]
```

- Breakdown por status dentro de cada versão
- Hover para ver números exatos
- Clicável: Filtrar tabela por versão

---

## 📑 Abas Adicionais

### Aba 2: Gestão de Backlog & Refinamento

**Métricas de Prontidão:**
- 📊 Total de itens no backlog sem estimativa (Story Points = 0 ou vazio)
- 📝 Itens sem critérios de aceite preenchidos
- 🏷️ Itens sem épico pai
- 📈 Distribuição por Tipo (Story, Bug, Task, Spike)
- 🎯 Distribuição por Prioridade (Highest → Lowest)

**Matriz de Idade do Backlog:**
- Gráfico de dispersão: X = Dias desde criação, Y = Prioridade
- Highlight: Itens criados > 60 dias sem movimentação (candidatos a arquivamento)
- Sugestão: "Revisar e descartar ou agendar"

**Score de Maturidade do Backlog:** Percentual de itens bem definidos (estimativa + critérios + épico)

### Aba 3: Qualidade & Saúde de Bugs

**Relatório de Bugs:**
- Gráfico de linha temporal (últimos 30 dias): Abertos vs. Fechados
- Breakdown por severidade (Critical, High, Medium, Low)

**Origem dos Bugs:**
- Pie chart: QA vs. Produção vs. Homolog vs. Dev
- Taxa de vazamento (% bugs encontrados em Prod vs. QA)

**Tempo Médio de Resolução:**
- Por severidade
- 🔴 Alertar se Critical > 7 dias aberto

**Bugs por Responsável:** Quem mais encontra/corrige bugs

### Aba 4: Sprint & Velocidade (Opcional)

- **Burndown Chart:** Queima de Sprint (ideal vs. real)
- **Velocidade Histórica:** Últimos N sprints com trend
- **Taxa de Conclusão:** % de itens planejados vs. entregues

---

## 🎛️ Sistema de Filtros Globais

Barra fixa no topo (colapsável em mobile):

- **🏗️ Projeto:** Dropdown com projeto selecionado
- **🏃 Sprint:** Filtrar por Sprint ativa/futura
- **🏷️ Tipo de Item:** Multi-select (Story, Bug, Task, etc.)
- **📌 Épico:** Multi-select dinâmico
- **👤 Responsável:** Multi-select com avatares
- **🎯 Prioridade:** Multi-select
- **📅 Período:** Range picker (7d, 30d, 90d, customizado)

**Comportamento:**
- Filtros refletem em **todas as abas e gráficos**
- Botão "🔄 Limpar Filtros" para resetar
- Indicador: "X filtros ativos" se aplicados

---

## 💫 Funcionalidades Adicionais de UX

- 🌙 **Dark Mode:** Toggle no header, persistido em localStorage
- 📊 **Exportação CSV:** Botão em cada tabela para baixar dados filtrados
- 🔄 **Auto-refresh:** Checkbox "Atualizar a cada 2 minutos" (configurável)
- 📱 **Responsividade:** Mobile-first, mobile ≤ 768px oculta gráficos menores
- ⚡ **Paginação Resiliente:** Jira API com `startAt` e `maxResults` para projetos > 100 itens
- 💾 **Cache Inteligente:** TanStack Query com staleTime=5min
- 🎨 **Tema Customizável:** Cores de alerta customizáveis (amarelo em X dias, vermelho em Y dias)
- 📋 **Histórico Local:** Carrega últimas configurações usadas (projeto, filtros, aba)

---

## 📂 Estrutura de Pastas

```
src/
├── services/
│   ├── jiraAPI.ts          # Chamadas REST ao Jira (com proxy handling)
│   ├── devStatusAPI.ts     # /rest/dev-status para código vinculado
│   ├── storageService.ts   # localStorage (criptografia básica opcional)
│   └── analyticsService.ts # Cálculos de aging, distribuição, etc.
├── hooks/
│   ├── useJiraConfig.ts    # Hook para config (domain, email, token)
│   ├── useProject.ts       # Hook para projeto selecionado
│   ├── useFilterState.ts   # Hook para filtros globais
│   └── useIssuesQuery.ts   # TanStack Query para fetch de issues
├── components/
│   ├── Header.tsx          # Logo, projeto selector, dark mode toggle
│   ├── Sidebar.tsx         # Navegação de abas
│   ├── GlobalFilters.tsx   # Barra de filtros superiores
│   ├── Dashboard/
│   │   ├── DashboardMain.tsx
│   │   ├── KPICards.tsx
│   │   ├── StatusChart.tsx
│   │   ├── AgingTable.tsx
│   │   ├── ResponsibleChart.tsx
│   │   ├── QAGapCard.tsx
│   │   ├── CodeLinkageCard.tsx
│   │   └── ReleaseChart.tsx
│   ├── Backlog/
│   │   ├── BacklogMetrics.tsx
│   │   └── BacklogMatrix.tsx
│   ├── Quality/
│   │   ├── BugChart.tsx
│   │   └── BugMetrics.tsx
│   ├── Setup/
│   │   ├── ConfigForm.tsx
│   │   └── ConnectionTest.tsx
│   └── Common/
│       ├── Table.tsx       # Tabela reutilizável
│       ├── Card.tsx
│       ├── Chart.tsx       # Wrapper Recharts
│       └── Loading.tsx
├── store/
│   ├── filterStore.ts      # Zustand para filtros globais
│   └── configStore.ts      # Zustand para config
├── types/
│   ├── jira.ts             # Types da API do Jira
│   └── app.ts              # Types da aplicação
├── utils/
│   ├── dateUtils.ts        # Cálculos de aging, datas
│   ├── formatUtils.ts      # Formatação de strings, números
│   ├── corsProxy.ts        # Lógica de bypass CORS
│   └── csvExport.ts        # Exportação para CSV
├── App.tsx                 # Root component
├── main.tsx                # Entry point
└── index.css               # Tailwind imports

package.json                # deps + script "gh-pages"
vite.config.ts             # Config Vite + base="/jira-dashboard/"
.github/workflows/deploy.yml # CI/CD automático
```

---

## 📦 Instalação e Desenvolvimento

### Instalar Dependências
```bash
npm install
```

### Desenvolvimento Local
```bash
npm run dev
```
Acesso: `http://localhost:5173`

### Build para Produção
```bash
npm run build
```
Saída em `dist/`

### Preview de Produção Localmente
```bash
npm run preview
```

### Deploy para GitHub Pages
```bash
npm run deploy
```

Isto irá:
1. Build a aplicação
2. Push os arquivos para branch `gh-pages`
3. Publicar automaticamente em `https://nfbrentano.github.io/jira-dashboard/`

---

## 🔐 Segurança

⚠️ **Importante:**

1. **Nunca commite o token do Jira** no repositório
2. **API Token é armazenado em localStorage** → Acessível via DevTools
   - Considere usar `sessionStorage` (mais seguro, mas perde ao fechar aba)
   - Implemente logout para limpar credenciais
3. **CORS Proxy** é recomendado para produção (crie seu próprio Cloudflare Worker)
4. **Não use CORS Anywhere** para produção (não é confiável)

---

## ⚙️ Configuração do Vite

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/jira-dashboard/', // Substitua pelo nome real do repo
})
```

### GitHub Actions Automático

O arquivo `.github/workflows/deploy.yml` faz deploy automático ao fazer push para `main`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 📊 Exemplos de Uso

### Cenário 1: Identificar Gargalo de QA
1. Abra o Dashboard
2. Veja os cards "🧪 Fila de Testes" e "🔍 Em Validação"
3. Se fila > 10 itens → Alerta vermelho
4. Clique no card para expandir tabela com todos os itens
5. Identifique qual testador está sobrecarregado

### Cenário 2: Cobrar Devs sem Código
1. Vá para o Dashboard
2. Procure card "❌ Itens SEM Código Vinculado"
3. Clique para ver tabela filtrada
4. Cada linha mostra há quantos dias o item está sem PR/Branch
5. Use CTA "Cobrar Dev" para gerar comentário no Jira

### Cenário 3: Analisar Saúde do Backlog
1. Clique na aba "Backlog & Refinamento"
2. Veja "Itens sem estimativa" e "Sem critérios de aceite"
3. Matriz de Idade mostra itens candidatos a descarte
4. Score de Maturidade indica saúde geral do backlog

### Cenário 4: Exportar Relatório
1. Abra qualquer tabela (Aging, QA, Bugs, etc.)
2. Clique no botão "📥 Exportar CSV"
3. Arquivo baixa com filtros aplicados
4. Abra no Excel/Sheets para análise adicional

---

## 🚀 Deploy no GitHub Pages

### Pré-requisitos
- Repositório público no GitHub
- Node.js 18+ instalado

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/jira-dashboard.git
cd jira-dashboard
```

2. **Instale dependências:**
```bash
npm install
```

3. **Configure o Cloudflare Worker** (confira sessão "Quick Start")

4. **Faça push para main:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

5. **GitHub Actions fará deploy automaticamente** ✨

6. **Acesse:**
   - `https://seu-usuario.github.io/jira-dashboard/`

---

## 📋 Checklist de Funcionalidades

- [ ] Configuração de credenciais Jira + teste de conexão
- [ ] Seletor dinâmico de projetos
- [ ] Dashboard com KPIs de status (6 cards)
- [ ] Gráfico de distribuição por status
- [ ] Tabela de aging (itens estagnados)
- [ ] Distribuição por responsável (gráfico + cards)
- [ ] Fila de QA e em validação (cards destacados)
- [ ] Rastreabilidade de código (PR/Branch vinculado)
- [ ] Gestão de Release Versions
- [ ] Aba de Backlog & Refinamento
- [ ] Aba de Qualidade & Bugs
- [ ] Filtros globais (tipo, épico, responsável, período)
- [ ] Dark Mode
- [ ] Exportação CSV
- [ ] Auto-refresh configurável
- [ ] Paginação resiliente
- [ ] Cache inteligente (TanStack Query)
- [ ] Responsividade mobile
- [ ] Deploy automático GitHub Pages

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 📞 Suporte

Dúvidas ou problemas? Abra uma [issue](https://github.com/nfbrentano/jira-dashboard/issues) no repositório.

---

## 🙏 Agradecimentos

- [React](https://react.dev/) - UI Framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charting
- [TanStack Query](https://tanstack.com/query/latest) - Data fetching
- [Atlassian Jira API](https://developer.atlassian.com/cloud/jira/rest/v3/) - API

---

**Desenvolvido com ❤️ para melhorar a visibilidade operacional de times ágeis.**
