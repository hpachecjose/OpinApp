// backend/src/routes/feedbacks.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateParams, schemas, idParamSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/feedbacks (rota pública - não requer autenticação)
 * Criar novo feedback
 */
router.post('/', validate(schemas.createFeedback), async (req, res) => {
    try {
        const { form_id, opinstars, comentario_texto, modo, nome_cliente, email_cliente } = req.body;

        // Verificar se o formulário existe e está ativo
        const form = await prisma.forms.findUnique({
            where: { id: form_id }
        });

        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        if (form.status !== 'ACTIVE') {
            return res.status(400).json({ error: 'Este formulário não está aceitando respostas no momento' });
        }

        const feedback = await prisma.feedbacks.create({
            data: {
                form_id,
                opinstars,
                comentario_texto,
                modo: modo || 'PUBLIC',
                nome_cliente: modo === 'ANONYMOUS' ? null : nome_cliente,
                email_cliente: modo === 'ANONYMOUS' ? null : email_cliente,
                status_moderacao: 'PENDING'
            }
        });

        res.status(201).json({
            message: 'Feedback enviado com sucesso! Obrigado pela sua opinião.',
            feedback: {
                id: feedback.id,
                opinstars: feedback.opinstars
            }
        });

        logger.info(`Novo feedback ${feedback.id} criado para formulário ${form_id}`);
    } catch (error) {
        logger.error('Erro ao criar feedback:', error);
        res.status(500).json({ error: 'Erro ao enviar feedback' });
    }
});

// Rotas abaixo requerem autenticação
router.use(authenticate);

/**
 * GET /api/feedbacks
 * Listar feedbacks dos formulários do usuário
 */
router.get('/', async (req, res) => {
    try {
        const {
            form_id,
            sentiment,
            opinstars,
            status_moderacao,
            page = 1,
            limit = 20,
            sortBy = 'data_envio',
            sortOrder = 'desc'
        } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        // Buscar IDs dos formulários do usuário
        const userForms = await prisma.forms.findMany({
            where: { usuario_id: req.user.id },
            select: { id: true }
        });

        const userFormIds = userForms.map(f => f.id);

        if (userFormIds.length === 0) {
            return res.json({
                feedbacks: [],
                pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 }
            });
        }

        const where = {
            form_id: { in: userFormIds },
            ...(form_id && { form_id: Number(form_id) }),
            ...(opinstars && { opinstars: Number(opinstars) }),
            ...(status_moderacao && { status_moderacao: status_moderacao.toUpperCase() })
        };

        const [feedbacks, total] = await Promise.all([
            prisma.feedbacks.findMany({
                where,
                include: {
                    forms: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: Number(limit)
            }),
            prisma.feedbacks.count({ where })
        ]);

        res.json({
            feedbacks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });

        logger.info(`Usuário ${req.user.id} listou feedbacks`);
    } catch (error) {
        logger.error('Erro ao listar feedbacks:', error);
        res.status(500).json({ error: 'Erro ao buscar feedbacks' });
    }
});

/**
 * GET /api/feedbacks/stats
 * Estatísticas de feedbacks
 */
router.get('/stats', async (req, res) => {
    try {
        const { form_id, days = 30 } = req.query;

        // Buscar IDs dos formulários do usuário
        const userForms = await prisma.forms.findMany({
            where: { usuario_id: req.user.id },
            select: { id: true }
        });

        const userFormIds = userForms.map(f => f.id);

        if (userFormIds.length === 0) {
            return res.json({
                totalFeedbacks: 0,
                averageOpinStars: 0,
                starDistribution: {},
                sentimentDistribution: {}
            });
        }

        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - Number(days));

        const where = {
            form_id: { in: form_id ? [Number(form_id)] : userFormIds },
            data_envio: { gte: dateFilter }
        };

        const feedbacks = await prisma.feedbacks.findMany({
            where,
            select: {
                opinstars: true
            }
        });

        const total = feedbacks.length;
        const sum = feedbacks.reduce((acc, f) => acc + (f.opinstars || 0), 0);
        const average = total > 0 ? (sum / total).toFixed(2) : 0;

        // Distribuição por estrelas
        const starDistribution = {
            5: feedbacks.filter(f => f.opinstars === 5).length,
            4: feedbacks.filter(f => f.opinstars === 4).length,
            3: feedbacks.filter(f => f.opinstars === 3).length,
            2: feedbacks.filter(f => f.opinstars === 2).length,
            1: feedbacks.filter(f => f.opinstars === 1).length
        };

        // Calcular sentimento baseado em estrelas
        const positive = feedbacks.filter(f => f.opinstars >= 4).length;
        const neutral = feedbacks.filter(f => f.opinstars === 3).length;
        const negative = feedbacks.filter(f => f.opinstars <= 2).length;

        res.json({
            totalFeedbacks: total,
            averageOpinStars: Number(average),
            starDistribution,
            sentimentDistribution: {
                positive,
                neutral,
                negative,
                positivePercentage: total > 0 ? ((positive / total) * 100).toFixed(1) : 0,
                negativePercentage: total > 0 ? ((negative / total) * 100).toFixed(1) : 0
            }
        });

        logger.info(`Usuário ${req.user.id} consultou estatísticas`);
    } catch (error) {
        logger.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

/**
 * GET /api/feedbacks/:id
 * Buscar feedback específico
 */
router.get('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        // Buscar IDs dos formulários do usuário
        const userForms = await prisma.forms.findMany({
            where: { usuario_id: req.user.id },
            select: { id: true }
        });

        const userFormIds = userForms.map(f => f.id);

        const feedback = await prisma.feedbacks.findFirst({
            where: {
                id: Number(req.params.id),
                form_id: { in: userFormIds }
            },
            include: {
                forms: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback não encontrado' });
        }

        res.json({ feedback });
    } catch (error) {
        logger.error('Erro ao buscar feedback:', error);
        res.status(500).json({ error: 'Erro ao buscar feedback' });
    }
});

/**
 * DELETE /api/feedbacks/:id
 * Deletar feedback
 */
router.delete('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        // Verificar se o feedback pertence a um formulário do usuário
        const feedback = await prisma.feedbacks.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                forms: {
                    select: { usuario_id: true }
                }
            }
        });

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback não encontrado' });
        }

        if (feedback.forms.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para deletar este feedback' });
        }

        await prisma.feedbacks.delete({
            where: { id: Number(req.params.id) }
        });

        res.json({ message: 'Feedback deletado com sucesso' });

        logger.info(`Usuário ${req.user.id} deletou feedback ${req.params.id}`);
    } catch (error) {
        logger.error('Erro ao deletar feedback:', error);
        res.status(500).json({ error: 'Erro ao deletar feedback' });
    }
});

export default router;
