// backend/src/routes/channels.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.js';
import { validate, validateParams, schemas, idParamSchema } from '../utils/validators.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/channels
 * Listar canais do usuário
 */
router.get('/', async (req, res) => {
    try {
        const { form_id, tipo } = req.query;

        // Buscar IDs dos formulários do usuário
        const userForms = await prisma.forms.findMany({
            where: { usuario_id: req.user.id },
            select: { id: true }
        });

        const userFormIds = userForms.map(f => f.id);

        if (userFormIds.length === 0) {
            return res.json({ channels: [] });
        }

        const where = {
            form_id: { in: form_id ? [Number(form_id)] : userFormIds },
            ...(tipo && { tipo: tipo.toUpperCase() })
        };

        const channels = await prisma.channels.findMany({
            where,
            include: {
                forms: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });

        res.json({ channels });

        logger.info(`Usuário ${req.user.id} listou canais`);
    } catch (error) {
        logger.error('Erro ao listar canais:', error);
        res.status(500).json({ error: 'Erro ao buscar canais' });
    }
});

/**
 * GET /api/channels/:id
 * Buscar canal específico
 */
router.get('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        const channel = await prisma.channels.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                forms: {
                    select: {
                        id: true,
                        nome: true,
                        usuario_id: true
                    }
                }
            }
        });

        if (!channel) {
            return res.status(404).json({ error: 'Canal não encontrado' });
        }

        // Verificar se o canal pertence ao usuário
        if (channel.forms.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para acessar este canal' });
        }

        res.json({ channel });
    } catch (error) {
        logger.error('Erro ao buscar canal:', error);
        res.status(500).json({ error: 'Erro ao buscar canal' });
    }
});

/**
 * POST /api/channels
 * Criar novo canal
 */
router.post('/', validate(schemas.createChannel), async (req, res) => {
    try {
        const { form_id, tipo, link, estatisticas_json } = req.body;

        // Verificar se o formulário pertence ao usuário
        const form = await prisma.forms.findFirst({
            where: {
                id: form_id,
                usuario_id: req.user.id
            }
        });

        if (!form) {
            return res.status(404).json({ error: 'Formulário não encontrado' });
        }

        // Gerar link único se for tipo LINK ou QR_CODE
        let channelLink = link;
        if ((tipo === 'LINK' || tipo === 'QR_CODE') && !link) {
            const uniqueId = crypto.randomBytes(8).toString('hex');
            channelLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/f/${form_id}/${uniqueId}`;
        }

        const channel = await prisma.channels.create({
            data: {
                form_id,
                tipo,
                link: channelLink,
                estatisticas_json: estatisticas_json || { views: 0, clicks: 0, submissions: 0 }
            }
        });

        res.status(201).json({
            message: 'Canal criado com sucesso',
            channel
        });

        logger.info(`Usuário ${req.user.id} criou canal ${channel.id} para formulário ${form_id}`);
    } catch (error) {
        logger.error('Erro ao criar canal:', error);
        res.status(500).json({ error: 'Erro ao criar canal' });
    }
});

/**
 * PUT /api/channels/:id
 * Atualizar canal
 */
router.put('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        const { tipo, link, estatisticas_json } = req.body;

        // Verificar se o canal pertence ao usuário
        const existing = await prisma.channels.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                forms: {
                    select: { usuario_id: true }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Canal não encontrado' });
        }

        if (existing.forms.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para atualizar este canal' });
        }

        const channel = await prisma.channels.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(tipo && { tipo }),
                ...(link && { link }),
                ...(estatisticas_json && { estatisticas_json })
            }
        });

        res.json({
            message: 'Canal atualizado com sucesso',
            channel
        });

        logger.info(`Usuário ${req.user.id} atualizou canal ${channel.id}`);
    } catch (error) {
        logger.error('Erro ao atualizar canal:', error);
        res.status(500).json({ error: 'Erro ao atualizar canal' });
    }
});

/**
 * DELETE /api/channels/:id
 * Deletar canal
 */
router.delete('/:id', validateParams(idParamSchema), async (req, res) => {
    try {
        // Verificar se o canal pertence ao usuário
        const existing = await prisma.channels.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                forms: {
                    select: { usuario_id: true }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Canal não encontrado' });
        }

        if (existing.forms.usuario_id !== req.user.id) {
            return res.status(403).json({ error: 'Sem permissão para deletar este canal' });
        }

        await prisma.channels.delete({
            where: { id: Number(req.params.id) }
        });

        res.json({ message: 'Canal deletado com sucesso' });

        logger.info(`Usuário ${req.user.id} deletou canal ${req.params.id}`);
    } catch (error) {
        logger.error('Erro ao deletar canal:', error);
        res.status(500).json({ error: 'Erro ao deletar canal' });
    }
});

export default router;
