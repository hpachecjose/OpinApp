// backend/src/routes/forms.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateParams, schemas, idParamSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/forms
 * Listar todos os formulários do usuário autenticado
 */
router.get('/', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
            usuario_id: req.user.id,
            ...(status && { status: status.toUpperCase() })
        };

        const [forms, total] = await Promise.all([
            prisma.forms.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            feedbacks: true,
                            channels: true
                        }
                    }
                },
                orderBy: { data_criacao: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.forms.count({ where })
        ]);

        res.json({
            forms,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });

        logger.info(`Usuário ${req.user.id} listou formulários`);
    } catch (error) {
        logger.error('Erro ao listar formulários:', error);
        res.status(500).json({ error: 'Erro ao buscar formulários' });
    }
});

/**
 * GET /api/forms/:id
 * Buscar formulário específico
 */
router.get('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        const form = await prisma.forms.findFirst({
            where: {
                id: Number(req.params.id),
                usuario_id: req.user.id
            },
            include: {
                _count: {
                    select: {
                        feedbacks: true,
                        channels: true
                    }
                },
                channels: true
            }
        });

        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        res.json({ form });
    } catch (error) {
        logger.error('Erro ao buscar formulário:', error);
        res.status(500).json({ error: 'Erro ao buscar formulário' });
    }
});

/**
 * POST /api/forms
 * Criar novo formulário
 */
router.post('/', validate(schemas.createForm), async (req, res) => {
    try {
        const { nome, campos_json, status } = req.body;

        const form = await prisma.forms.create({
            data: {
                nome,
                usuario_id: req.user.id,
                campos_json: campos_json || {},
                status: status || 'DRAFT'
            }
        });

        res.status(201).json({
            message: 'Formulário criado com sucesso',
            form
        });

        logger.info(`Usuário ${req.user.id} criou formulário ${form.id}`);
    } catch (error) {
        logger.error('Erro ao criar formulário:', error);
        res.status(500).json({ error: 'Erro ao criar formulário' });
    }
});

/**
 * PUT /api/forms/:id
 * Atualizar formulário
 */
router.put('/:id', validateParams(idParamSchema), validate(schemas.updateForm), async (req, res) => {
    try {
        const { nome, campos_json, status } = req.body;

        // Verificar se o formulário pertence ao usuário
        const existing = await prisma.forms.findFirst({
            where: {
                id: Number(req.params.id),
                usuario_id: req.user.id
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        const form = await prisma.forms.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(nome && { nome }),
                ...(campos_json && { campos_json }),
                ...(status && { status })
            }
        });

        res.json({
            message: 'Formulário atualizado com sucesso',
            form
        });

        logger.info(`Usuário ${req.user.id} atualizou formulário ${form.id}`);
    } catch (error) {
        logger.error('Erro ao atualizar formulário:', error);
        res.status(500).json({ error: 'Erro ao atualizar formulário' });
    }
});

/**
 * PATCH /api/forms/:id/status
 * Alterar status do formulário (ativar/pausar)
 */
router.patch('/:id/status', validateParams(idParamSchema), async (req, res) => {
    try {
        const { status } = req.body;

        if (!['ACTIVE', 'PAUSED', 'DRAFT'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido. Use: ACTIVE, PAUSED ou DRAFT' });
        }

        // Verificar se o formulário pertence ao usuário
        const existing = await prisma.forms.findFirst({
            where: {
                id: Number(req.params.id),
                usuario_id: req.user.id
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        const form = await prisma.forms.update({
            where: { id: Number(req.params.id) },
            data: { status }
        });

        res.json({
            message: `Formulário ${status === 'ACTIVE' ? 'ativado' : status === 'PAUSED' ? 'pausado' : 'salvo como rascunho'}`,
            form
        });

        logger.info(`Usuário ${req.user.id} alterou status do formulário ${form.id} para ${status}`);
    } catch (error) {
        logger.error('Erro ao alterar status:', error);
        res.status(500).json({ error: 'Erro ao alterar status do formulário' });
    }
});

/**
 * DELETE /api/forms/:id
 * Deletar formulário
 */
router.delete('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        // Verificar se o formulário pertence ao usuário
        const existing = await prisma.forms.findFirst({
            where: {
                id: Number(req.params.id),
                usuario_id: req.user.id
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        // O Prisma vai deletar automaticamente feedbacks e channels relacionados (cascade)
        await prisma.forms.delete({
            where: { id: Number(req.params.id) }
        });

        res.json({ message: 'Formulário deletado com sucesso' });

        logger.info(`Usuário ${req.user.id} deletou formulário ${req.params.id}`);
    } catch (error) {
        logger.error('Erro ao deletar formulário:', error);
        res.status(500).json({ error: 'Erro ao deletar formulário' });
    }
});

export default router;
