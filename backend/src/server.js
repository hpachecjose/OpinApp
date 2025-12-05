// backend/src/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import crypto from "crypto";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "./utils/hashPassword.js";
import { generateToken } from "./utils/jwt.js";
import { authenticate } from "./middlewares/auth.js";
import { sendEmail } from "./utils/email.js";
import { validate, schemas } from "./utils/validators.js";
import logger from "./utils/logger.js";

// Importar rotas
import formsRoutes from "./routes/forms.routes.js";
import feedbacksRoutes from "./routes/feedbacks.routes.js";
import channelsRoutes from "./routes/channels.routes.js";

const app = express();
const prisma = new PrismaClient();

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança HTTP headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Rate limiting global
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Rate limiting mais restrito para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login, tente novamente em 15 minutos.',
  skipSuccessfulRequests: true
});

// Logging de requisições
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// ========================================
// ROTA DE HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "OpinApp API rodando!",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// ========================================
// ROTAS DE AUTENTICAÇÃO
// ========================================

// Cadastro de usuário
app.post("/api/auth/register", authLimiter, validate(schemas.register), async (req, res) => {
  const { name, email, password, company } = req.body;

  try {
    // Verificar se email já existe
    const existing = await prisma.users.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        error: "E-mail já cadastrado."
      });
    }

    // Criar usuário
    const hashedPassword = await hashPassword(password);
    const user = await prisma.users.create({
      data: {
        nome: name,
        email,
        empresa: company,
        senha_hash: hashedPassword,
        plano: 'FREE' // Plano padrão
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        plano: true,
        data_cadastro: true
      }
    });

    // Gerar token JWT
    const token = generateToken(user);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      token,
      user
    });

    logger.info(`Novo usuário cadastrado: ${user.id} - ${user.email}`);
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      error: "Erro ao cadastrar usuário."
    });
  }
});

// Login de usuário
app.post("/api/auth/login", authLimiter, validate(schemas.login), async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuário
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        plano: true,
        senha_hash: true,
        data_cadastro: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: "Email ou senha incorretos."
      });
    }

    // Verificar senha
    const valid = await verifyPassword(user.senha_hash, password);

    if (!valid) {
      return res.status(401).json({
        error: "Email ou senha incorretos."
      });
    }

    // Remover senha_hash do retorno
    const { senha_hash, ...userWithoutPassword } = user;

    // Gerar token JWT
    const token = generateToken(userWithoutPassword);

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: userWithoutPassword
    });

    logger.info(`Login realizado: ${user.id} - ${user.email}`);
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      error: "Erro ao fazer login."
    });
  }
});

// Rota protegida de exemplo (requer autenticação)
app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        plano: true,
        perfil_json: true,
        data_cadastro: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
});

// ========================================
// ROTAS DE RECUPERAÇÃO DE SENHA
// ========================================

// 1. Solicitar recuperação de senha
app.post("/api/auth/request-reset", validate(schemas.requestReset), async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      // Por segurança, não informamos se o email existe ou não
      return res.json({ message: "Se o email existir, um link de recuperação será enviado." });
    }

    // Gerar token aleatório
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash do token para salvar no banco
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Salvar no banco
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 3600000), // 1 hora
      }
    });

    // Link de recuperação
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Enviar email
    await sendEmail(
      email,
      "Recuperação de Senha - OpinApp",
      `<p>Olá ${user.nome},</p>
       <p>Você solicitou a recuperação de senha.</p>
       <p>Clique no link abaixo para redefinir sua senha:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>Este link expira em 1 hora.</p>`
    );

    res.json({ message: "Se o email existir, um link de recuperação será enviado." });

    logger.info(`Solicitação de reset de senha para: ${email}`);
  } catch (error) {
    logger.error("Erro ao solicitar reset:", error);
    res.status(500).json({ error: "Erro ao processar solicitação." });
  }
});

// 2. Validar token
app.post("/api/auth/validate-token", async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ valid: false });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetRequest = await prisma.passwordReset.findFirst({
    where: {
      tokenHash,
      used: false,
      expiresAt: { gt: new Date() }
    }
  });

  if (!resetRequest) {
    return res.json({ valid: false });
  }

  res.json({ valid: true });
});

// 3. Redefinir senha
app.post("/api/auth/reset", validate(schemas.resetPassword), async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRequest) {
      return res.status(400).json({ error: "Token inválido ou expirado." });
    }

    // Atualizar senha do usuário
    const hashedPassword = await hashPassword(newPassword);

    await prisma.users.update({
      where: { id: resetRequest.userId },
      data: { senha_hash: hashedPassword }
    });

    // Marcar token como usado
    await prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { used: true }
    });

    res.json({ message: "Senha redefinida com sucesso!" });

    logger.info(`Senha redefinida para usuário ${resetRequest.userId}`);
  } catch (error) {
    logger.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro ao redefinir senha." });
  }
});

// ========================================
// ROTAS DE NEGÓCIO
// ========================================

app.use('/api/forms', formsRoutes);
app.use('/api/feedbacks', feedbacksRoutes);
app.use('/api/channels', channelsRoutes);

// ========================================
// TRATAMENTO DE ERROS 404
// ========================================

app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.path
  });
});

// ========================================
// TRATAMENTO DE ERROS GLOBAL
// ========================================

app.use((error, req, res, next) => {
  logger.error('Erro não tratado:', error);

  res.status(error.status || 500).json({
    error: error.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor OpinApp rodando na porta ${PORT}`);
  logger.info(`📍 Health check: http://localhost:${PORT}`);
  logger.info(`🔐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n🔴 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});