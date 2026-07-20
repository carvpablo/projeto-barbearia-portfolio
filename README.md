# 💈 BarberFlow — Sistema de Agendamento para Barbearia

> Um aplicativo completo (Full-Stack) para gerenciamento e agendamento online de serviços de barbearia. Desenvolvido com uma experiência de usuário moderna, fluida e responsiva.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

---

## 🔗 Demonstração Online

*A melhor forma de avaliar o projeto é vê-lo em ação:*
👉 **[Clique aqui para acessar a demonstração ao vivo](https://link-da-sua-demonstracao-aqui.com)** *(Substitua pelo link após o deploy)*

> **Nota:** Use as seguintes credenciais de teste para explorar as funcionalidades de cliente ou barbeiro:
> - **Cliente Teste:** `cliente@teste.com` / Senha: `senha123` *(ou crie uma nova conta)*
> - **Barbeiro/Admin Teste:** `barbeiro@teste.com` / Senha: `senha123`

---

## 📸 Demonstração Visual

| Tela de Agendamento | Painel Administrativo |
|---|---|
| ![Tela de Agendamento](https://via.placeholder.com/400x250?text=Inserir+GIF+ou+Print+do+Agendamento) | ![Painel Administrativo](https://via.placeholder.com/400x250?text=Inserir+GIF+ou+Print+do+Painel) |

*(Dica: Substitua as imagens acima por GIFs ou capturas de tela reais do seu aplicativo rodando!)*

---

## ✨ Funcionalidades Principais

### Para Clientes:
- **Cadastro e Autenticação Segura:** Login e registro protegidos com criptografia de senha e tokens JWT.
- **Agendamento Inteligente:** Seleção de data, horário disponível, barbeiro de preferência e múltiplos serviços simultâneos.
- **Painel do Cliente:** Visualização rápida de agendamentos futuros e histórico de serviços realizados.
- **Cancelamento de Agendamentos:** Flexibilidade para cancelar horários respeitando as regras do estabelecimento.

### Para Barbeiros / Administradores:
- **Painel Administrativo (Dashboard):** Visão geral dos agendamentos do dia, faturamento estimado e estatísticas de uso.
- **Gerenciamento de Agenda:** Visualização em lista e controle de status dos agendamentos (Confirmado, Concluído, Cancelado).
- **Gerenciamento de Serviços:** Criação, edição, exclusão e alteração de preços e duração dos serviços disponíveis na barbearia.
- **Perfil do Barbeiro:** Customização da biografia, foto de perfil, especialidades e status de disponibilidade.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React (v19) & TypeScript:** Interface de usuário dinâmica, tipagem estática e componentes reutilizáveis.
- **Vite:** Build tool extremamente veloz para desenvolvimento moderno.
- **Tailwind CSS & Radix UI:** Estilização com design system consistente, acessibilidade nativa e responsividade.
- **React Router Dom (v7):** Roteamento robusto do lado do cliente (Client-side routing).
- **React Query (TanStack Query v5):** Gerenciamento e sincronização eficiente de estado assíncrono (cache de requisições, sincronização automática de dados).
- **React Hook Form & Zod:** Validação e manipulação de formulários de forma performática e segura.

### **Backend**
- **Node.js & Express:** Servidor HTTP robusto e modularizado seguindo boas práticas de arquitetura de API REST.
- **Prisma ORM:** Modelagem de banco de dados simplificada, migrações automatizadas e consultas tipadas.
- **SQLite:** Banco de dados relacional leve em arquivo local (ideal para desenvolvimento rápido e demonstração).
- **JSON Web Token (JWT) & BcryptJS:** Autenticação stateless segura e hashing de senhas.

---

## 📁 Estrutura do Projeto

O repositório está organizado como um **Monorepo**:

```text
├── client/          # Aplicação Frontend (React + Vite)
├── server/          # API Backend (Node.js + Express + Prisma)
└── README.md        # Documentação principal
```

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (Versão LTS recomendada)
- Gerenciador de pacotes `npm` (vem com o Node)

---

### Passo 1: Clonar o Repositório e Configurar as Dependências

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/projeto-barbearia.git

# Acessar a pasta do projeto
cd projeto-barbearia
```

---

### Passo 2: Configurar e Rodar o Backend

1. Entre no diretório do servidor:
   ```bash
   cd server
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` baseado no arquivo de exemplo ou crie um diretamente com as variáveis necessárias:
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="sua_chave_secreta_super_segura_aqui"
   ```
4. Execute as migrações do banco de dados (Prisma/SQLite) e popule o banco com dados de teste:
   ```bash
   # Rodar migrações e seed de dados iniciais
   npm run db:reset
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O servidor backend estará rodando em `http://localhost:5000`.*

---

### Passo 3: Configurar e Rodar o Frontend

1. Abra um **novo terminal** na raiz do projeto e entre no diretório do cliente:
   ```bash
   cd client
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   *O frontend estará rodando e disponível em `http://localhost:5173`.*

---

## ⚙️ Variáveis de Ambiente

### Servidor (`server/.env`)
- `PORT`: Porta onde a API vai rodar (padrão: `5000`).
- `DATABASE_URL`: String de conexão com o banco (padrão para SQLite: `file:./dev.db`).
- `JWT_SECRET`: Chave secreta para assinar e validar os tokens JWT de autenticação.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com ☕ e ❤️ por [Seu Nome](https://github.com/seu-usuario).
