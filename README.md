![alt text](frontend/public/opinapp_logo_rb.png)

O **OpinApp** é uma plataforma SaaS brasileira para coleta e análise inteligente de feedbacks de clientes. O sistema centraliza comentários recebidos através de múltiplos canais e tem como objetivo utilizar Inteligência Artificial para processar, analisar e gerar insights automáticos.

## 🚀 Visão Geral

Empresas coletam feedbacks de forma desorganizada. O OpinApp resolve isso centralizando tudo em um único lugar, permitindo:
1. **Coleta Centralizada:** De múltiplos canais (Links, QR Code).
2. **Sistema OpinStars:** Avaliação híbrida (0-5 estrelas + texto).
3. **Dashboard:** Métricas visuais e gerenciamento de formulários.
4. **Análise de Sentimento:** Processada por IA (**Google Gemini**), gerando classificação, resumo e detecção de temas.

## 🛠️ Tecnologias e Arquitetura

O projeto opera no modelo **Full Stack** com uma arquitetura moderna e escalável.

### Backend (API)
- **Node.js**: Ambiente de execução.
- **Express**: Framework web.
- **Prisma ORM**: Gerenciamento de banco de dados e migrations.
- **Banco de Dados**: PostgreSQL (Schemas de Users, Forms, Feedbacks, PasswordReset).
- **Autenticação**: JWT (JSON Web Tokens) e Argon2 para hash de senhas.
- **Segurança**: Helmet, Rate Limiting, CORS configurado.

### Frontend
- **Framework**: Next.js 14 (App Router).
- **Estilização**: Tailwind CSS 4.
- **Gerenciamento de Estado**: Zustand (Auth, Forms, Feedbacks).
- **UI**: Responsiva e dinâmica, preparada para PWA.

## 📂 Estrutura do Projeto

```
opinapp/
├── frontend/             # Aplicação Next.js
│   ├── src/app/          # Páginas e Rotas (Dashboard, Login, Forms)
│   ├── src/services/     # Integração com API (Axios)
│   └── src/store/        # Gerenciamento de Estado Global
│
├── backend/              # API Node.js/Express
│   ├── src/controllers/  # (Lógica consolidada em rotas no MVP)
│   ├── src/middlewares/  # Auth, RateLimit
│   ├── src/routes/       # Definição de endpoints
│   └── prisma/           # Schema do Banco de Dados
```

## ⚡ Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- Banco de dados PostgreSQL (ou SQLite para testes rápidos, configurável no `.env`)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/hpachecjose/opinapp.git
   cd opinapp
   ```

2. Instale as dependências (Raiz, Frontend e Backend):
   ```bash
   npm install      # Instala dependências da raiz (concurrently)
   npm run install:all # Script customizado para instalar tudo
   ```
   *Caso o script `install:all` não esteja disponível, execute `npm install` em cada pasta manualmente.*

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `backend/` com a `DATABASE_URL`, `JWT_SECRET` e `GEMINI_API_KEY`.
   - Crie um arquivo `.env.local` na pasta `frontend/` se necessário (ex: `NEXT_PUBLIC_API_URL`).

4. Configure o Banco de Dados (Prisma):
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push # Cria as tabelas sem migrations (dev)
   ```

### Executando (Desenvolvimento)

Na raiz do projeto, execute:

```bash
npm run dev
```

Este comando utilizará o `concurrently` para subir simultaneamente:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000 (ou porta definida no .env)

## ✅ Estado Atual do Desenvolvimento (MVP)

O projeto encontra-se funcional com as seguintes features implementadas:

- [x] Landing Page, Páginas Institucionais e Legais.
- [x] Sistema de Autenticação Completo (Login, Registro, Recuperação de Senha).
- [x] Dashboard Interativo (Gráficos de distribuição, Lista de Feedbacks).
- [x] Criação e Gestão de Formulários.
- [x] Coleta de Feedbacks (Links Públicos).
- [x] Análise de Sentimento com IA (Google Gemini).
- [x] Moderação automática de conteúdo.

**Próximos Passos (Roadmap):**
- [ ] Exportação de relatórios (PDF/Excel).
- [ ] Refinamento da Moderação de Conteúdo.

## 📄 Licença
Proprietário: OpinApp Team. Todos os direitos reservados.
