<div align="center">
  <img src="frontend/public/opinapp_logo_rb.png" alt="OpinApp Logo" width="300">
  
  <br />
  
  # OpinApp 

  **Plataforma de Coleta e Análise Inteligente de Feedbacks**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
</div>

<hr />

O **OpinApp** é uma plataforma SaaS projetada para revolucionar a forma como empresas coletam, gerenciam e compreendem o feedback de seus clientes. Centralizando comentários de múltiplos canais, o sistema utiliza Inteligência Artificial avançada para processar dados, detectar sentimentos e gerar insights automáticos e acionáveis.

## 🚀 Principais Funcionalidades

- 📊 **Dashboard Inteligente:** Métricas detalhadas, gráficos customizáveis e visualização clara do desempenho de satisfação.
- 🤖 **Análise de Sentimento com IA:** Integração com **Google Gemini** para classificar feedbacks, gerar resumos e extrair temas principais automaticamente.
- 📝 **Gestão de Formulários:** Crie formulários flexíveis para coleta via link ou QR Code.
- ⭐ **Sistema OpinStars:** Avaliação híbrida que combina notas (0-5 estrelas) com comentários abertos.
- 🔒 **Segurança e Moderação:** Autenticação JWT robusta e moderação automática de conteúdo ofensivo.
- 📱 **Interface Responsiva:** Design moderno, limpo e adaptável a qualquer dispositivo.

## 🛠️ Stack Tecnológico

O OpinApp foi construído com foco em performance, escalabilidade e produtividade de desenvolvimento:

**Frontend**
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Requisições:** Axios

**Backend**
- **Ambiente:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Segurança:** JWT, Argon2 (Hash), Helmet, CORS, Rate Limiting

## 📂 Estrutura do Repositório

```bash
opinapp/
├── frontend/             # Aplicação Next.js (Dashboard, Páginas Públicas, UI)
│   ├── public/           # Assets estáticos
│   ├── src/app/          # Rotas e Páginas (App Router)
│   ├── src/components/   # Componentes reutilizáveis React
│   ├── src/services/     # Configuração do Axios e chamadas à API
│   └── src/store/        # Stores do Zustand (Auth, Feedbacks, etc.)
│
├── backend/              # API Express
│   ├── prisma/           # Schema do banco e migrations
│   ├── src/controllers/  # Lógica de controle de requisições
│   ├── src/middlewares/  # Middlewares (Auth, Validação, etc.)
│   ├── src/routes/       # Definição de rotas da API
│   └── src/services/     # Lógica de negócio e integrações (IA)
```

## ⚙️ Configuração do Ambiente

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (ou um cluster online como Supabase/Neon)
- Git

### 2. Clonando o Projeto
```bash
git clone https://github.com/hpachecjose/opinapp.git
cd opinapp
```

### 3. Variáveis de Ambiente
Você precisará configurar os arquivos `.env`.

**No Backend (`backend/.env`):**
Crie um arquivo `.env` na pasta `backend/` seguindo o modelo abaixo:
```env
PORT=4000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/opinapp"
JWT_SECRET="sua_chave_secreta_super_segura"
FRONTEND_URL="http://localhost:3000"
GEMINI_API_KEY="sua_chave_api_do_google_gemini"
```

**No Frontend (`frontend/.env.local`):**
Crie um arquivo `.env.local` na pasta `frontend/`:
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 4. Instalação e Banco de Dados

Instale as dependências de ambos os projetos:
```bash
# Na raiz do projeto
npm install
npm run install:all
```

Configure o banco de dados via Prisma:
```bash
cd backend
npx prisma generate
npx prisma db push
cd ..
```

### 5. Executando a Aplicação
O projeto utiliza bibliotecas para rodar frontend e backend com um único comando na raiz:

```bash
npm run dev
```
- A API estará disponível em: `http://localhost:4000`
- O Dashboard estará disponível em: `http://localhost:3000`

## ✅ Roadmap de Desenvolvimento

- [x] Landing Page e Auth completa (Login/Registro/Recuperação)
- [x] Dashboard interativo com gráficos de distribuição
- [x] Criação de formulários e links de coleta
- [x] Análise de Sentimento com IA (Google Gemini)
- [x] Funcionalidades Produtivas (Product Intelligence)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Múltiplos fluxos de aprovação de feedback

## 📄 Licença

Este projeto é proprietário.
**OpinApp Team**. Todos os direitos reservados.
# OpinApp
