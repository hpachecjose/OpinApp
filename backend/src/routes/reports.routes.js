
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.js';
import reportsService from '../services/reports.service.js';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

/**
 * Helper para buscar feedbacks do usuário
 */
async function getUserFeedbacks(userId, formId) {
    // Buscar IDs dos formulários do usuário
    const userForms = await prisma.forms.findMany({
        where: { usuario_id: userId },
        select: { id: true, nome: true }
    });

    const userFormIds = userForms.map(f => f.id);

    if (userFormIds.length === 0) return [];

    const where = {
        form_id: { in: formId ? [Number(formId)] : userFormIds }
    };

    return await prisma.feedbacks.findMany({
        where,
        include: {
            forms: {
                select: { id: true, nome: true }
            }
        },
        orderBy: { data_envio: 'desc' }
    });
}

/**
 * GET /api/reports/export/excel
 */
router.get('/export/excel', async (req, res) => {
    try {
        const { form_id } = req.query;
        const feedbacks = await getUserFeedbacks(req.user.id, form_id);

        if (feedbacks.length === 0) {
            return res.status(404).json({ error: 'Nenhum feedback encontrado para exportar.' });
        }

        const buffer = await reportsService.generateExcel(feedbacks);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=feedbacks.xlsx');

        res.send(buffer);

        logger.info(`Usuário ${req.user.id} exportou Excel (${feedbacks.length} feedbacks)`);
    } catch (error) {
        logger.error('Erro ao exportar Excel:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório Excel' });
    }
});

/**
 * GET /api/reports/export/pdf
 */
router.get('/export/pdf', async (req, res) => {
    try {
        const { form_id } = req.query;
        const feedbacks = await getUserFeedbacks(req.user.id, form_id);

        if (feedbacks.length === 0) {
            return res.status(404).json({ error: 'Nenhum feedback encontrado para exportar.' });
        }

        // Calcular estatísticas básicas para o PDF
        const total = feedbacks.length;
        const sum = feedbacks.reduce((acc, f) => acc + (f.opinstars || 0), 0);
        const average = total > 0 ? (sum / total).toFixed(2) : 0;

        const sentiment = {
            positive: feedbacks.filter(f => f.opinstars >= 4).length,
            neutral: feedbacks.filter(f => f.opinstars === 3).length,
            negative: feedbacks.filter(f => f.opinstars <= 2).length
        };

        const stats = {
            totalFeedbacks: total,
            averageOpinStars: average,
            sentimentDistribution: {
                positive: sentiment.positive,
                neutral: sentiment.neutral,
                negative: sentiment.negative,
                positivePercentage: total > 0 ? ((sentiment.positive / total) * 100).toFixed(1) : 0,
                negativePercentage: total > 0 ? ((sentiment.negative / total) * 100).toFixed(1) : 0
            }
        };

        const buffer = await reportsService.generatePDF(feedbacks, stats);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

        res.send(buffer);

        logger.info(`Usuário ${req.user.id} exportou PDF (${feedbacks.length} feedbacks)`);
    } catch (error) {
        logger.error('Erro ao exportar PDF:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
    }
});

export default router;
