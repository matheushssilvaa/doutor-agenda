# Doutor Agenda — SaaS de agendamento para clínicas

Aplicação SaaS para clínicas médicas gerenciarem médicos, pacientes e consultas, com dashboard de métricas, autenticação (e-mail/senha e Google) e assinatura recorrente via Stripe. Interface 100% responsiva (desktop, tablet e mobile).

## Stack

| Camada | Tecnologias |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components, Server Actions, Route Groups), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Radix UI), lucide-react, sonner (toasts), tw-animate-css |
| Formulários | React Hook Form, Zod, @hookform/resolvers, react-number-format |
| Dados | PostgreSQL (Docker), Drizzle ORM, drizzle-kit |
| Autenticação | Better Auth (e-mail/senha, Google OAuth, sessão customizada) |
| Server Actions | next-safe-action (validação com Zod + tratamento centralizado de erros) |
| Estado / URL | TanStack Query (React Query), nuqs (estado sincronizado com query string) |
| Tabelas e gráficos | TanStack Table, Recharts |
| Datas | dayjs (utc/timezone, locale pt-BR), date-fns, react-day-picker |
| Pagamentos | Stripe Checkout, Stripe Customer Portal e Webhooks |
| Qualidade | ESLint (simple-import-sort), Prettier (prettier-plugin-tailwindcss) |

## Funcionalidades

### Autenticação e clínica
- Login e criação de conta com e-mail e senha, e login com Google.
- Mensagem de erro customizada para e-mail já cadastrado.
- Sessão customizada (plugin `customSession`) que injeta a clínica do usuário na sessão.
- Proteção de rotas: redirecionamento para `/authentication` sem sessão e para `/clinic-form` quando o usuário ainda não tem clínica.
- Cadastro da clínica com vínculo usuário ↔ clínica (`users_to_clinics`).

### Layout e navegação
- Sidebar com Route Group `(protected)`, item ativo destacado e menu do usuário (iniciais da clínica, e-mail e logout).
- Header responsivo: no mobile, logo à esquerda e botão do menu à direita (abre a sidebar em *sheet*, que fecha ao navegar).
- Componentes de página reutilizáveis (`PageContainer`, `PageHeader`, `PageTitle`, `PageActions`, `PageContent`).
- Estado vazio reutilizável (`EmptyStateData`) com ação customizável.

### Dashboard
- Cards de métricas: faturamento, agendamentos, pacientes e médicos.
- Filtro por período com date picker de intervalo sincronizado com a URL (nuqs); exibe 1 mês no mobile e 2 no desktop.
- Gráfico de área (Recharts) com agendamentos e faturamento dos últimos/próximos dias, eixo duplo e tooltip formatado.
- Ranking de médicos com mais agendamentos e de especialidades (com ícone por especialidade e barra de progresso).
- Tabela de agendamentos do dia com ações de edição/exclusão.

### Médicos
- Criação, listagem, edição e exclusão de médicos (Server Actions com next-safe-action).
- Disponibilidade por dia da semana e horário, salva em UTC no banco e exibida no fuso local.
- Preço da consulta com máscara monetária (armazenado em centavos).
- Busca de médicos por nome.
- Grid de cards responsivo (`auto-fill`), adaptando o número de colunas à largura disponível.

### Pacientes
- Criação, edição e exclusão de pacientes (nome, e-mail, telefone e sexo).
- Tabela com TanStack Table: busca global, paginação (10/20/50/100), seleção múltipla e exclusão em lote.

### Agendamentos
- Criação, edição e exclusão de agendamentos.
- Apenas os dias de atendimento do médico ficam selecionáveis no calendário.
- Horários disponíveis calculados no servidor (slots de 30 min), desconsiderando horários já ocupados e o próprio agendamento em edição.
- Preço preenchido automaticamente a partir do médico selecionado.
- Tabela com busca, paginação, seleção múltipla e exclusão em lote.

### Assinatura (Stripe)
- Plano *Essential* com checkout via Stripe.
- Webhook (`/api/stripe/webhook`) com verificação de assinatura que ativa/cancela o plano do usuário.
- Acesso ao Customer Portal para gerenciar a assinatura.

### Responsividade
- Layout mobile-first em todas as telas: header mobile, cabeçalhos de página empilhados em telas pequenas e espaçamentos adaptativos.
- Dashboard em coluna única no mobile e grid em telas largas; cards de métricas em 1, 2 ou 4 colunas.
- Tabelas com rolagem horizontal contida, sem estourar a largura da página.
- Diálogos de formulário com altura máxima e rolagem interna em telas pequenas.
- Tela de autenticação e card de plano fluidos (sem larguras fixas).

### Banco de dados
- Schema Drizzle com relacionamentos: usuários, sessões, contas, verificações, clínicas, médicos, pacientes e agendamentos.
- Dados de demonstração automáticos: toda clínica nova (inclusive de quem entra pela primeira vez com Google) já nasce com médicos, pacientes e agendamentos próprios, isolados das demais clínicas. Desative com `SEED_NEW_CLINICS=false`.
- Seed manual (`npm run db:seed`) que popula médicos, pacientes e agendamentos (passados, do dia e futuros) para as clínicas existentes (`--clinic=<id>` para uma clínica específica, `--reset` para limpar antes).

## Habilidades aplicadas no desenvolvimento

- Arquitetura com Next.js App Router: Server Components para busca de dados, Client Components para interação e Server Actions tipadas.
- Modelagem relacional e queries agregadas com Drizzle ORM (`sum`, `count`, `groupBy`, filtros por período).
- Autenticação com Better Auth, OAuth do Google e extensão da sessão.
- Validação ponta a ponta com Zod (formulários e Server Actions).
- Tratamento de datas e fuso horário (UTC ↔ America/Sao_Paulo).
- Integração de pagamentos recorrentes com Stripe (Checkout, Webhooks e Portal).
- Tabelas avançadas com TanStack Table (filtro global, paginação, seleção de linhas).
- Cache e requisições client-side com React Query; estado em URL com nuqs.
- Visualização de dados com Recharts.
- Design system com shadcn/ui + Tailwind CSS e layout responsivo.
- Padronização de código com ESLint e Prettier.

## Como rodar o projeto

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Suba o PostgreSQL com Docker:

   ```bash
   docker compose up -d
   ```

3. Crie o arquivo `.env` com as variáveis:

   ```env
   DATABASE_URL=
   BETTER_AUTH_SECRET=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXT_PUBLIC_APP_URL=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_ESSENTIAL_PLAN_PRICE_ID=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=
   # opcional: "false" desativa os dados de demonstração em clínicas novas
   SEED_NEW_CLINICS=
   ```

4. Aplique o schema no banco:

   ```bash
   npx drizzle-kit push
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. (Opcional) Clínicas novas já recebem dados de demonstração. Para popular clínicas que já existiam:

   ```bash
   npm run db:seed
   ```

## Roadmap

### Setup do projeto

- [x] Inicialização do projeto Next.js
- [x] Configuração de ferramentas (ESlint, Prettier, Tailwind)
- [x] Configuração do Drizzle e banco de dados Postgres com Docker
- [x] Configuração do Shadcn/ui

### Autenticação e configuração do estabelecimento

- [x] Tela de login e criação da conta
- [x] Login com email e senha
- [x] Login com o Google
- [x] Criação de clínicas

### Gerenciamento de Profissionais e disponibilidade

- [x] Sidebar e Route Groups
- [x] Página de médicos
- [x] Criação de médicos e NextSafeAction
- [x] Listagem de médicos
- [x] Atualização de médicos
- [x] Deleção de médicos
- [x] Busca de médicos

### Gerenciamento de pacientes e consultas

- [x] Criação, atualização e exclusão de um paciente
- [x] Criação, listagem, edição e exclusão de agendamentos
- [x] Horários disponíveis por médico e data
- [x] Busca, paginação, seleção múltipla e exclusão em lote

### Dashboard e assinatura

- [x] Dashboard com métricas, gráfico e rankings
- [x] Filtro por período sincronizado com a URL
- [x] Assinatura com Stripe (checkout, webhook e portal)
- [x] Seed do banco de dados

### Responsividade

- [x] Header mobile com logo e menu
- [x] Cards de médicos responsivos
- [x] Revisão de responsividade em todas as telas
