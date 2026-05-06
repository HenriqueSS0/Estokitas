# Estokitas 📦

Estokitas é uma plataforma SaaS (Software as a Service) voltada para o gerenciamento inteligente de estoque, vendas e movimentações em tempo real. Projetado para oferecer uma experiência ágil e segura, o sistema possui uma interface premium focada em produtividade e um backend robusto capaz de lidar com múltiplas requisições simultâneas e controle multi-inquilino (multi-tenant).

## 🚀 Principais Funcionalidades

- **Gestão de Produtos e Variáveis:** Cadastro de produtos principais e suas respectivas variações (tamanho, cor, etc.) com controles de estoque independentes.
- **Movimentações em Tempo Real:** Atualizações via WebSockets garantem que as vendas ou entradas reflitam instantaneamente nos painéis de todos os usuários logados.
- **Dashboard e Relatórios:** Acompanhamento de faturamento diário, tickets médios e alertas automáticos de produtos com estoque baixo ou zerado.
- **API Pública Integrada:** Chaves de API (`keysecret`) para integrações externas (ex: PDV, e-commerce) que deduzem o estoque com segurança e atomicidade no banco de dados.
- **Arquitetura Multi-Tenant:** Isolamento rigoroso de dados em nível de banco de dados (Row-Level Security manual via `user_id`) garantindo que clientes não acessem dados uns dos outros.

## 💻 Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas do mercado, dividindo a aplicação entre Frontend e Backend em um ecossistema conteinerizado.

### Frontend
- **Framework:** React 18 com Vite
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Radix UI (Componentes Acessíveis)
- **Roteamento:** React Router DOM
- **Ícones:** Lucide React

### Backend
- **Ambiente:** Node.js com Express
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (driver `pg`)
- **Tempo Real:** Socket.IO
- **Segurança:** Autenticação via JWT (JSON Web Tokens) e controle de Rate Limiting.

### Infraestrutura
- **Deploy/Execução:** Docker & Docker Compose
- **Proxy/Web Server:** Nginx (embutido no container do frontend)

## 🛠️ Como Instalar e Rodar

A aplicação foi desenhada para ser executada via Docker, garantindo que o ambiente seja idêntico em qualquer máquina sem necessidade de instalar dependências locais de Node ou PostgreSQL.

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) instalado.
- [Docker Compose](https://docs.docker.com/compose/install/) instalado.
- Git.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/estokitas.git
   cd estokitas
   ```

2. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo e crie o seu arquivo definitivo:
   ```bash
   cp .env.example .env
   ```
   *Abra o arquivo `.env` e preencha as chaves obrigatórias como senhas do banco de dados e as chaves de criptografia (JWT e ENCRYPTION_KEY).*

3. **Suba a infraestrutura completa:**
   Com um único comando, o Docker fará o download das imagens do Postgres, construirá o Backend (Node) e o Frontend (React), e iniciará todos os serviços:
   ```bash
   docker compose up -d --build
   ```

4. **Acesse a aplicação:**
   Após a conclusão, o sistema estará rodando na sua máquina.
   Abra no seu navegador:
   [http://localhost](http://localhost)

> **Nota sobre o Banco de Dados:** O esquema inicial das tabelas é criado automaticamente pela engine de migração do backend no momento em que ele liga pela primeira vez, lendo o arquivo `001_init.sql`.

## 🛡️ Segurança

O Estokitas emprega hashing seguro (bcrypt/Argon2) para senhas e algoritmos criptográficos (AES-256) para as chaves de API Públicas dos usuários. Todo e qualquer acesso de escrita ou leitura no banco de dados é interceptado por validações restritas de identidade (JWT Auth).

---
*Desenvolvido para revolucionar a logística de pequenas e médias empresas.*
