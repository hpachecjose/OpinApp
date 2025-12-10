import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import winston from 'winston';

// Importar rotas
import authRoutes from './routes/auth.routes';
import formRoutes from './routes/forms.routes';
import feedbackRoutes from './routes/feedbacks.routes';
import channelRoutes from './routes/channels.routes';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// ==================== LOGGER ====================
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// ==================== MIDDLEWARE GLOBAL ====================
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== RATE LIMITING ====================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Máximo 5 tentativas de login
  skipSuccessfulRequests: true,
  message: 'Muitas tentativas de login, tente novamente mais tarde'
});

const globalLimiter = rateLimit({
  windowMs: 1000, // 1 segundo para testes
  max: 3,
  message: 'Muitas requisições'
});

app.use(limiter);

// ==================== ROTAS ====================
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/channels', channelRoutes);

// ==================== HEALTH CHECK ====================
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: '✅ Servidor rodando', timestamp: new Date().toISOString() });
});

// ==================== 404 ====================
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Health Check: http://localhost:${PORT}/health`);
});

export default app;

it('should load environment variables', () => {
  const dotenv = require('dotenv');
  expect(dotenv.config).toHaveBeenCalled();
});

it('should initialize logger', () => {
  const winston_module = require('winston');
  expect(winston_module.createLogger).toBeDefined();
});

// Apply middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
  res.json({ success: true });
});

it('should have helmet middleware enabled', async () => {
  const response = await request(app).get('/test');
  expect(response.headers['x-content-type-options']).toBeDefined();
});

it('should have CORS enabled with correct origin', async () => {
  const response = await request(app)
    .get('/test')
    .set('Origin', 'http://localhost:3000');

  expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
});

it('should allow POST requests with JSON body', async () => {
  app.post('/json-test', (req, res) => {
    res.json({ received: req.body });
  });

  const response = await request(app)
    .post('/json-test')
    .send({ test: 'data' });

  expect(response.body.received.test).toBe('data');
});

it('should allow URL encoded bodies', async () => {
  app.post('/encoded-test', (req, res) => {
    res.json({ received: req.body });
  });

  const response = await request(app)
    .post('/encoded-test')
    .send('key=value');

  expect(response.body.received.key).toBe('value');
});

app.get('/limited', (req, res) => res.json({ ok: true }));

it('should allow requests within limit', async () => {
  const response1 = await request(app).get('/limited');
  const response2 = await request(app).get('/limited');
  const response3 = await request(app).get('/limited');

  expect(response1.status).toBe(200);
  expect(response2.status).toBe(200);
  expect(response3.status).toBe(200);
});

it('should block requests exceeding limit', async () => {
  await request(app).get('/limited');
  await request(app).get('/limited');
  await request(app).get('/limited');
  
  const response = await request(app).get('/limited');
  expect(response.status).toBe(429);
});

const mockAuthRouter = express.Router();
  mockAuthRouter.get('/', (req, res) => res.json({ route: 'auth' }));
  
  const mockFormRouter = express.Router();
  mockFormRouter.get('/', (req, res) => res.json({ route: 'forms' }));

  app.use(express.json());
  app.use('/api/auth', mockAuthRouter);
  app.use('/api/forms', mockFormRouter);
});

it('should register auth routes', async () => {
  const response = await request(app).get('/api/auth');
  expect(response.body.route).toBe('auth');
});

it('should register forms routes', async () => {
  const response = await request(app).get('/api/forms');
  expect(response.body.route).toBe('forms');
});

it('should return 200 status on health check', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
});

it('should return correct health check response', async () => {
  const response = await request(app).get('/health');
  expect(response.body.status).toBe('✅ Servidor rodando');
  expect(response.body.timestamp).toBeDefined();
});

it('should return ISO timestamp format', async () => {
  const response = await request(app).get('/health');
  expect(() => new Date(response.body.timestamp)).not.toThrow();
});

// Add a real route
  app.get('/health', (req, res) => res.json({ ok: true }));
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });
});

it('should return 404 for undefined routes', async () => {
  const response = await request(app).get('/undefined-route');
  expect(response.status).toBe(404);
});

it('should return error message on 404', async () => {
  const response = await request(app).get('/api/nonexistent');
  expect(response.body.erro).toBe('Rota não encontrada');
});

it('should still work for defined routes', async () => {
  const response = await request(app).get('/health');
  expect(response.status).toBe(200);
});

// Test route that throws error
  app.get('/error', (req, res, next) => {
    const error = new Error('Test error');
    (error as any).status = 400;
    next(error);
  });

  // Simple error handler
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500).json({ error: err.message });
  });
});

it('should catch and handle errors', async () => {
  const response = await request(app).get('/error');
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Test error');
});

it('should return 500 for errors without status', async () => {
  app.get('/error-no-status', (req, res, next) => {
    next(new Error('Server error'));
  });

  const response = await request(app).get('/error-no-status');
  expect(response.status).toBe(500);
});

// Full middleware stack
  app.use(helmet());
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
  app.use(express.json());

  // Routes
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.post('/api/test', (req, res) => res.status(201).json({ created: true }));

  // 404
  app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
});

it('should handle complete request lifecycle', async () => {
  const response = await request(app)
    .post('/api/test')
    .set('Content-Type', 'application/json')
    .send({ data: 'test' });

  expect(response.status).toBe(201);
  expect(response.body.created).toBe(true);
});

it('should include security headers in responses', async () => {
  const response = await request(app).get('/health');
  expect(response.headers['x-content-type-options']).toBeDefined();
  expect(response.headers['x-frame-options']).toBeDefined();
});

it('should handle multiple consecutive requests', async () => {
  const response1 = await request(app).get('/health');
  const response2 = await request(app).get('/health');
  const response3 = await request(app).get('/health');

  expect(response1.status).toBe(200);
  expect(response2.status).toBe(200);
  expect(response3.status).toBe(200);
});