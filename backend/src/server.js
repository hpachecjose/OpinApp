// backend/src/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "./utils/hashPassword.js";
import { generateToken } from "./utils/jwt.js";
import { authenticate } from "./middlewares/auth.js";
import { sendEmail } from "./utils/email.js";

const app = express();
const prisma = new PrismaClient();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota de health check
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
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, company } = req.body;

  try {
    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Senha deve ter no mínimo 6 caracteres."
      });
    }

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
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: "Erro ao cadastrar usuário."
    });
  }
});

// Login de usuário
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios."
      });
    }

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
  } catch (error) {
    console.error('Erro no login:', error);
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
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
});

// ========================================
// ROTAS DE RECUPERAÇÃO DE SENHA
// ========================================

// 1. Solicitar recuperação de senha
app.post("/api/auth/request-reset", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      // Por segurança, não informamos se o email existe ou não, mas retornamos sucesso.
      // Ou podemos retornar erro se preferir UX sobre segurança estrita.
      // Aqui vou retornar sucesso simulado.
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

    // Link de recuperação (ajuste a URL conforme seu frontend)
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

  } catch (error) {
    console.error("Erro ao solicitar reset:", error);
    res.status(500).json({ error: "Erro ao processar solicitação." });
  }
});

// 2. Validar token (opcional, útil para o frontend verificar antes de mostrar o form)
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
app.post("/api/auth/reset", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres." });
  }

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

  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro ao redefinir senha." });
  }
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor OpinApp rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}`);
  console.log(`🔐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔴 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});