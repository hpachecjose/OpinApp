import { Request, Response } from 'express';
import { FeedbackService } from '../services/FeedbackService';
import { CreateFeedbackRequest } from '../schemas/validation';

export class FeedbackController {
  // ==================== CRIAR FEEDBACK ====================
  static async create(req: Request, res: Response) {
    try {
      const data = req.body as CreateFeedbackRequest;
      const feedback = await FeedbackService.create(data);

      // Analisar com IA se houver comentário
      if (data.comentario_texto) {
        const analise = await FeedbackService.analyzeWithAI(
          data.comentario_texto,
          data.opinstars || 3
        );

        // Atualizar feedback com análise
        // await FeedbackService.updateAnalysis(feedback.id, analise);
      }

      res.status(201).json({
        mensagem: 'Feedback registrado com sucesso',
        feedback
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== LISTAR FEEDBACKS DO FORMULÁRIO ====================
  static async listByForm(req: Request, res: Response) {
    try {
      const { formId } = req.params;
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 20;

      const { feedbacks, total, paginas } = await FeedbackService.listByForm(
        parseInt(formId),
        skip,
        take
      );

      res.json({
        feedbacks,
        paginacao: { total, paginas, pagina_atual: Math.floor(skip / take) + 1 }
      });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== APROVAR FEEDBACK ====================
  static async approve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const feedback = await FeedbackService.approve(parseInt(id));

      res.json({
        mensagem: 'Feedback aprovado com sucesso',
        feedback
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== REJEITAR FEEDBACK ====================
  static async reject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const feedback = await FeedbackService.reject(parseInt(id));

      res.json({
        mensagem: 'Feedback rejeitado',
        feedback
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }
}