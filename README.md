# Agile Ops & Delivery Dashboard for Jira Cloud 🚀

Painel analítico avançado e nativo para Jira Cloud, desenvolvido com **Atlassian Forge (Custom UI)**, **React 19**, **TypeScript** e **Tailwind CSS**.

Oferece visibilidade ponta a ponta sobre fluxo de entrega, limites de WIP (*Work in Progress*), envelhecimento de backlog (*Backlog Aging*), métricas por setor/time e análise preventiva de qualidade (bugs e retrabalho).

---

## ✨ Principais Funcionalidades

- 📊 **Métricas de Fluxo Contínuo:** Acompanhamento de Throughput semanal/mensal, Lead Time e Cycle Time em tempo real.
- 🚦 **Gestão Visual de Limites WIP:** Configuração flexível de limites WIP por projeto ou status, com alertas dinâmicos de sobrecarga e gargalos.
- ⏳ **Backlog Aging & Distribuição:** Identificação imediata de itens estagnados, com filtros por severidade, tipo de issue e prioridade.
- 🛡️ **Painel de Qualidade & Bugs:** Taxa de bugs por entrega (*Defect Density*), distribuição por responsável e severidade, com histórico comparativo.
- 🏢 **Métricas por Setor / Time:** Segmentação inteligente por squads, áreas de negócio ou componentes de produto.
- 🔒 **100% Nativo & Seguro (Atlassian Forge):** As consultas rodam diretamente na sessão autenticada do Jira Cloud (`@forge/bridge`). Nenhum dado de clientes ou issues sai do ecossistema seguro da Atlassian.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Atlassian Forge](https://developer.atlassian.com/platform/forge/) (Custom UI)
- **Frontend:** React 19, TypeScript, Vite
- **Estilização:** Tailwind CSS v4, Lucide Icons
- **Gráficos & Visualização:** Recharts
- **Estado Global:** Zustand & TanStack Query (React Query)

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 22+
- Forge CLI instalado globalmente: `npm install -g @forge/cli`
- Sessão autenticada: `forge login`

### 2. Instalação e Desenvolvimento
```bash
npm install
npm run dev
```

### 3. Desenvolvimento Integrado ao Jira com Túnel (Hot Reload)
```bash
# Terminal 1: Inicia o servidor local
npm run dev

# Terminal 2: Conecta o Jira Cloud ao seu código local
npm run forge:tunnel
```

---

## 📦 Deploy e Publicação

Consulte os guias detalhados:
- [Guia do Forge](file:///Users/natanaelfernandogattibrentano/jira-dashboard/FORGE_GUIDE.md): Passo a passo de deploy, testes e comandos do Forge.
- [Kit de Publicação no Marketplace](file:///Users/natanaelfernandogattibrentano/jira-dashboard/MARKETPLACE_SUBMISSION.md): Textos comerciais prontos, requisitos de homologação, Política de Privacidade e Termos de Uso para aprovação na Atlassian Store.

---

## 📄 Licença, Privacidade e Termos de Uso

Distribuído sob a licença [MIT](file:///Users/natanaelfernandogattibrentano/jira-dashboard/LICENSE).

- 🛡️ **Portal de Conformidade e Segurança:** [https://nfbrentano.github.io/jira-dashboard/](https://nfbrentano.github.io/jira-dashboard/)
- 🔒 **Política de Privacidade Online:** [https://nfbrentano.github.io/jira-dashboard/privacy.html](https://nfbrentano.github.io/jira-dashboard/privacy.html) (ou [PRIVACY.md](file:///Users/natanaelfernandogattibrentano/jira-dashboard/PRIVACY.md))
- 📜 **Termos de Serviço Online:** [https://nfbrentano.github.io/jira-dashboard/terms.html](https://nfbrentano.github.io/jira-dashboard/terms.html) (ou [TERMS.md](file:///Users/natanaelfernandogattibrentano/jira-dashboard/TERMS.md))
