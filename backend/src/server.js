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
import reportsRoutes from "./routes/reports.routes.js";

const app = express();
const prisma = new PrismaClient();

// ... (existing middleware code) ...

// ========================================
// ROTAS DE NEGÓCIO
// ========================================

app.use('/api/forms', formsRoutes);
app.use('/api/feedbacks', feedbacksRoutes);
app.use('/api/channels', channelsRoutes);
app.use('/api/reports', reportsRoutes);

// ... (existing error handling code) ...

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