# Estokitas - Gestão Robusta de Estoque

O **Estokitas** é um sistema avançado e rápido para gerenciamento de estoque, criado com uma interface Neo-Brutalista de alto impacto visual. O foco principal do sistema é facilitar a vida do lojista na hora de adicionar, remover ou rastrear produtos e analisar o fluxo financeiro diário/mensal de forma direta.

## 🚀 Funcionalidades Principais

- **Dashboard Financeiro e de Métricas:** Visualização clara do fluxo de caixa (Faturamento real calculado por _Vendas - Entradas_), Total de vendas e Alertas críticos de falta de estoque.
- **Movimentações Dinâmicas:** Registro intuitivo de transações:
  - **Vendas (Saídas):** Deduz do estoque e soma no faturamento.
  - **Entradas (Reposição/Compras):** Acrescenta ao estoque e desconta no faturamento (registra o gasto com a mercadoria).
- **Gerenciamento de Produtos e Variáveis:** Cadastro de produtos simples ou com variações (ex: Tamanhos P, M, G, Cores), cada um com seu respectivo alerta de estoque mínimo customizado.
- **Alertas Inteligentes:** Notificações em tempo real sobre produtos zerados ou abaixo da margem de segurança configurada.
- **Controle de Acessos (SaaS):** Páginas bloqueadas e liberadas através do nível de assinatura do usuário logado via Supabase.
- **Tema Dual:** Suporte a Light Mode e Dark Mode sem perder o DNA Brutalista (Preto profundo, Branco absoluto e Vermelho vibrante).

## 🛠️ Tecnologias, Bibliotecas e Componentes

Este projeto foi construído utilizando um Stack React moderno e escalável, apoiado num backend BaaS:

- **Frontend Core:**
  - `React.js` (com Hooks funcionais)
  - `TypeScript` (para tipagem rígida e escalabilidade)
  - `Vite` (como Build tool ultra-rápido)

- **UI / CSS / Componentes:**
  - `Tailwind CSS`: Customizado fortemente com variáveis CSS cruas criando o _Design System Brutalista_ presente em todo o projeto.
  - `shadcn/ui`: Componentes robustos e acessíveis customizados (`Card`, `Dialog`, `Button`, `Input`, `DropdownMenu`, etc).
  - `Lucide React`: Biblioteca leve e moderna de ícones vetoriais.
  - `Framer Motion`: Para animações complexas como o "PageLoader" (a cortina de encerramento super fluida).
  - `date-fns`: Formatação e lógica de manipulação de datas temporais (filtros de "Últimos 7 dias", "Hoje", "Mês atual").

- **Backend, Auth & Database:**
  - `Supabase`: Serviço que entrega a camada completa de Authentication e o banco de dados via APIs seguras (PostgreSQL). 

## ⚙️ Como rodar o projeto localmente

1. Clone o repositório na sua máquina.
2. Certifique-se de estar usando o `npm` ou `bun` e instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto copiando as chaves baseadas no arquivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   **Importante:** Insira suas próprias chaves de projeto fornecidas pelo _Dashboard do Supabase_. O `.env` original deve ser mantido sempre no `.gitignore` por segurança.
4. Rode a aplicação no ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acesse no seu navegador através de `http://localhost:8080` (a porta que aparecer no seu terminal ao inicializar).

## ⚠️ Sobre o `.env` e `.gitignore`
Por segurança, o seu `.env` já está incluso no `.gitignore` para evitar vazamento acidental das credenciais do Supabase. Todos os efeitos da UI testados no projeto que não estão sendo mais utilizados também estão no ignorados para não poluir os futuros commits.
