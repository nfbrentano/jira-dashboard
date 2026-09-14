# Kit de Submissão na Atlassian Marketplace 🚀

Este documento contém todas as informações, textos comerciais (em inglês e português) e o passo a passo para preencher o formulário de publicação no **Atlassian Marketplace Partner Portal**.

---

## 📌 Informações Básicas do App

| Campo Atlassian | Valor Recomendado |
|---|---|
| **App Name** | Agile Ops & Delivery Dashboard |
| **App ID / ARI** | `ari:cloud:ecosystem::app/4f7d0242-5adf-4de2-b928-6aef786cf730` |
| **Platform** | Cloud (Atlassian Forge) |
| **Hosting Model** | Forge (Runs on Atlassian Cloud) |
| **Category** | Project Management / Analytics & Reporting / Agile |
| **Compatibility** | Jira Cloud (Standard, Premium, Enterprise) |
| **Supported Products** | Jira Software, Jira Work Management |

---

## ✍️ Textos Comerciais da Listagem (Marketplace Copy)

### 1. Tagline / Summary (Máximo 250 caracteres)
> **English (Default):**
> *Actionable Agile & Flow metrics for Jira Cloud. Track Lead Time, Cycle Time, Throughput, WIP Limits, Backlog Aging, and Defect Quality with zero external servers.*
>
> **Português:**
> *Métricas ágeis de fluxo para o Jira Cloud. Monitore Lead Time, Cycle Time, Throughput, Limites WIP, Envelhecimento de Backlog e Qualidade 100% nativo.*

---

### 2. Highlights (3 a 5 Destaques Rápidos)

1. **Native & 100% Secure (Atlassian Forge):**
   Runs entirely inside Atlassian Cloud. Your Jira issue data never leaves Atlassian's secure perimeter.
2. **Actionable Flow Metrics:**
   Real-time Throughput, Cycle Time, and Lead Time calculation across all projects and custom filters.
3. **Bottleneck Prevention with WIP Limits:**
   Visual indicators and real-time warnings whenever Work-In-Progress thresholds are exceeded.
4. **Backlog Aging & Stale Issue Detection:**
   Spot abandoned or stagnant tickets before they impact delivery commitments.
5. **Quality & Defect Density Analytics:**
   Analyze bug ratios per release, assignee distribution, and bug severity trends.

---

### 3. Detailed Description (Visão Completa do Produto)

```markdown
### Deliver Faster, Spot Bottlenecks, and Keep Your Agile Flow Healthy

**Agile Ops & Delivery Dashboard** gives engineering leaders, Scrum Masters, product managers, and agile teams instant clarity over their delivery performance inside Jira Cloud.

Built natively on the **Atlassian Forge** platform, it connects directly with your Jira projects to render interactive charts and KPIs without requiring third-party servers, complex connectors, or data duplication.

---

### Key Capabilities

#### 📊 Continuous Flow & Delivery Velocity
- **Throughput Trends:** Track how many issues and story points your team ships week over week.
- **Lead Time & Cycle Time:** Measure the time from backlog creation to production deployment, pinpointing delays across each status transition.
- **WIP Health Indicators:** Keep your active work within sustainable limits to improve delivery predictability.

#### 🚦 WIP Limits & Bottleneck Alerts
- Set target Work-In-Progress (WIP) limits per column or project.
- Visual alerts highlight active overload immediately, preventing context switching and burnout.

#### ⏳ Backlog Aging & Stagnation Diagnostics
- Automatically group items by age (0-15d, 16-30d, 31-60d, 60d+).
- Spot stale stories and forgotten tasks to maintain a high-signal, clean backlog.

#### 🛡️ Quality & Defect Tracking
- Understand your **Defect Density** (ratio of bugs to deliverable stories/features).
- Review bug distribution by assignee, priority, and root-cause component.

---

### Why Teams Choose Agile Ops Dashboard

- **Zero-Config Setup:** Install from the Atlassian Marketplace and start visualizing metrics immediately.
- **Enterprise-Grade Privacy:** 100% Atlassian Forge architecture. No external API tokens to manage, and no customer data leaves your Jira Cloud instance.
- **Both Global & Project-Level Views:** Access from the global Jira navigation menu or directly inside each project sidebar (*Métricas & Ops*).
- **Fast & Responsive:** High-performance interface built with React 19 and modern interactive charts.
```

---

## 🎨 Especificações de Ativos Visuais (Marketing Assets)

| Ativo | Dimensão | Requisitos / Conteúdo Recomendado |
|---|---|---|
| **App Icon** | 144 x 144 px | Formato PNG (fundo transparente ou azul Atlassian com símbolo de métrica/fogos/dashboard). |
| **Screenshot 1** | 1840 x 900 px | **Visão Geral:** Dashboard principal com KPIs de Throughput, Lead Time, Cycle Time e gráficos de entrega. |
| **Screenshot 2** | 1840 x 900 px | **Limites WIP:** Painel de Work In Progress com alertas de gargalo ativados. |
| **Screenshot 3** | 1840 x 900 px | **Backlog Aging:** Gráfico de distribuição por idade e identificação de issues antigas. |
| **Screenshot 4** | 1840 x 900 px | **Painel de Qualidade:** Gráficos de bugs por responsável, tipo e severidade. |
| **Banner Promocional (Opcional)** | 2460 x 1200 px | Imagem de capa elegante com o título do app e uma amostra da interface. |

---

## 🔗 Links Legais Obrigatórios (Publicados e Acessíveis na Web)

Ao preencher o formulário no Partner Portal da Atlassian, informe exatamente estes links públicos:
- **Privacy Policy URL:** `https://nfbrentano.github.io/jira-dashboard/privacy.html`
- **Terms of Service URL:** `https://nfbrentano.github.io/jira-dashboard/terms.html`
- **Documentation / Support URL:** `https://nfbrentano.github.io/jira-dashboard/` (ou `https://github.com/nfbrentano/jira-dashboard`)

---

## 🚀 Passo a Passo para Submissão

### Passo 1: Fazer o Deploy em Produção no Forge
No seu terminal local, execute:
```bash
npm run forge:deploy:prod
```
Isso compilará o frontend otimizado com Vite e enviará para o ambiente `production` da Atlassian.

### Passo 2: Acessar o Marketplace Partner Portal
1. Acesse: **https://marketplace.atlassian.com/manage**
2. Faça login com a sua conta Atlassian.
3. Se for a primeira vez, conclua o cadastro de **Vendor / Partner**.
4. Clique em **"Create app listing"** (ou "List a new app").
5. Escolha **"Cloud"** e em seguida selecione **"Forge App"**.
6. Informe o **App ID**: `ari:cloud:ecosystem::app/4f7d0242-5adf-4de2-b928-6aef786cf730`.

### Passo 3: Preencher os Detalhes da Listagem
- Cole os textos das seções acima (Tagline, Highlights, Detailed Description).
- Faça o upload do ícone (144x144) e dos screenshots.
- Cole os links de Política de Privacidade e Termos de Uso.
- Selecione o modelo de preço: **Free** (recomendado para aprovação inicial ágil) ou **Paid via Atlassian**.

### Passo 4: Submeter para Revisão
- Clique em **"Submit for review"**.
- A equipe de revisão da Atlassian fará a verificação de segurança e testes de funcionamento.
- Você receberá e-mails de acompanhamento sobre o status da aprovação!
