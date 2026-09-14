# Guia Completo: Publicação no Atlassian Marketplace via Forge

Este guia orienta todo o processo de preparação, teste e publicação do **Jira Ops Dashboard** na **Atlassian Marketplace** utilizando o framework oficial **Atlassian Forge (Custom UI)**.

---

## 1. Pré-Requisitos

1. **Conta Atlassian:** Você precisa de uma conta Atlassian (a mesma utilizada para acessar o Jira).
2. **Ambiente de Desenvolvimento Jira Cloud (Gratuito):**
   - Caso ainda não tenha um Jira de testes, crie uma instância de desenvolvedor gratuita em: [developer.atlassian.com/platform/forge/set-up-forge](https://developer.atlassian.com/platform/forge/set-up-forge/).
3. **Instalação do Forge CLI:**
   Abra o terminal e instale a ferramenta de linha de comando oficial da Atlassian:
   ```bash
   npm install -g @forge/cli
   ```
   Verifique a instalação:
   ```bash
   forge --version
   ```

---

## 2. Autenticação na Atlassian

Autentique seu terminal com suas credenciais de desenvolvedor da Atlassian:
```bash
forge login
```
- O comando solicitará seu e-mail e um **API Token de desenvolvedor**.
- Para gerar o token do Forge, acesse: [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).

---

## 3. Registro do Aplicativo

Antes do primeiro deploy, você deve registrar o aplicativo para que a Atlassian atribua um identificador único (ARI) ao projeto:

```bash
npm run forge:register
```
*(ou `forge register`)*

- O terminal perguntará o nome do aplicativo (ex: `Jira Ops Dashboard`).
- O CLI atualizará automaticamente o campo `app.id` no arquivo [manifest.yml](manifest.yml).

---

## 4. Build e Deploy (Ambiente de Desenvolvimento)

Para compilar o frontend React/Vite e fazer o upload do pacote para os servidores da Atlassian:

```bash
npm run forge:deploy
```
*(Executa `tsc -b && vite build` e em seguida `forge deploy`)*

---

## 5. Instalação no seu Jira Cloud

Com o aplicativo enviado para a nuvem da Atlassian, instale-o na sua instância de Jira:

```bash
npm run forge:install
```
*(ou `forge install`)*

1. Selecione o produto: **Jira**.
2. Digite a URL da sua instância de desenvolvimento (ex: `sua-empresa.atlassian.net`).
3. O Forge confirmará as permissões (`read:jira-work`, `read:jira-user`) e fará a instalação.

---

## 6. Onde o App Aparece no Jira?

De acordo com o [manifest.yml](manifest.yml), o app está configurado em dois locais:
1. **Menu Global de Aplicativos:** No topo do Jira, clique em **Aplicativos (Apps) > Agile Ops Dashboard**.
2. **Dentro de Projetos:** Ao abrir qualquer projeto do Jira, procure na barra lateral esquerda por **Métricas & Ops**.

---

## 7. Desenvolvimento em Tempo Real com `forge tunnel` (Custom UI + Vite)

Conforme a [documentação oficial da Atlassian](https://developer.atlassian.com/platform/forge/tunneling/#tunneling-with-custom-ui), configuramos a propriedade `tunnel.port: 5173` no [manifest.yml](manifest.yml):

```yaml
resources:
  - key: main-app
    path: dist
    tunnel:
      port: 5173
```

### Como funciona:
- Ao rodar `forge tunnel`, a Atlassian **ignora a pasta `dist/` estática** e faz proxy reverso de todas as requisições do iframe do Jira diretamente para o seu servidor Vite local em `http://localhost:5173`.
- Isso permite **Hot Module Replacement (HMR)**: qualquer alteração que você salvar no código React reflete instantaneamente dentro da interface do Jira Cloud sem precisar de novo deploy!

### Passo a passo para rodar o túnel:
1. **Em um terminal**, inicie o servidor Vite:
   ```bash
   npm run dev
   ```
   *(Certifique-se de que está na porta 5173)*.

2. **Em um segundo terminal**, inicie o túnel do Forge:
   ```bash
   npm run forge:tunnel
   ```

3. Abra sua instância de Jira Cloud no navegador (Chrome ou Firefox) e acesse o app: qualquer alteração no código será refletida imediatamente.


---

## 8. Publicação na Atlassian Marketplace

Quando seu aplicativo estiver validado e pronto para ser distribuído para clientes ou disponibilizado publicamente:

### Passo 1: Promover para Produção
O Forge possui ambientes isolados (`development`, `staging`, `production`).
Para fazer deploy em produção:
```bash
forge deploy -e production
forge install -e production --site sua-empresa.atlassian.net
```

### Passo 2: Cadastrar como Parceiro no Atlassian Marketplace
1. Acesse o [Atlassian Marketplace Partner Portal](https://marketplace.atlassian.com/).
2. Faça login com sua conta Atlassian e crie ou selecione o perfil de **Vendor / Partner**.
3. Clique em **Create app listing** e selecione **Forge App**.
4. Insira o App ID (o mesmo ARI presente no seu `manifest.yml`).

### Passo 3: Informações da Listagem na Loja
Prepare os seguintes materiais para a aprovação:
- **Nome e Descrição Curta:** Ex: *Agile Ops & Delivery Dashboard — Métricas de Flow, Backlog Aging e Lead Time*.
- **Screenshots:** 3 a 5 imagens em alta resolução demonstrando as abas de Métricas, Limites WIP, Aging e Qualidade.
- **Ícone:** 144x144 px (PNG transparente).
- **Links Obrigatórios:**
  - Termos de Serviço (*Terms of Use*).
  - Política de Privacidade (*Privacy Policy*).
  - URL de Suporte / Documentação.
- **Tipo de Distribuição:**
  - **Público:** Aberto para qualquer cliente Jira Cloud no mundo instalar (gratuito ou pago).
  - **Privado (Token/Access Token):** Apenas clientes autorizados que receberem o token de acesso da loja podem instalar.

---

## 9. Estrutura de Arquivos Criada

- [manifest.yml](manifest.yml): Configuração dos pontos de extensão (`jira:globalPage`, `jira:projectPage`), permissões do Jira e caminho do build (`dist`).
- [src/services/jiraAPI.ts](src/services/jiraAPI.ts): Adaptador dual-mode que detecta o Forge e usa `@forge/bridge` (`requestJira`) sem precisar de e-mail ou API Token.
- [src/store/configStore.ts](src/store/configStore.ts): Reconhece a sessão nativa do Jira Cloud automaticamente.
- [src/components/Header.tsx](src/components/Header.tsx): Exibe o badge de integração nativa do Forge.
- [vite.config.ts](vite.config.ts): Configurado com `base: './'` para atender o iframe do Custom UI.
- [src/App.tsx](src/App.tsx): Configurado com `HashRouter` para compatibilidade total com o iframe da Atlassian.
