import { Request, Response } from 'express';
import { FormService } from '../services/FormService';
import { CreateFormRequest } from '../schemas/validation';

export class FormController {
  // ==================== CRIAR FORMULÁRIO ====================
  static async create(req: Request, res: Response) {
    try {
      const data = req.body as CreateFormRequest;
      const form = await FormService.create(req.userId!, data);

      res.status(201).json({
        mensagem: 'Formulário criado com sucesso',
        form
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== LISTAR FORMULÁRIOS ====================
  static async list(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const take = parseInt(req.query.take as string) || 10;

      const { forms, total, paginas } = await FormService.listByUser(req.userId!, skip, take);

      res.json({
        forms,
        paginacao: { total, paginas, pagina_atual: Math.floor(skip / take) + 1 }
      });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== OBTER FORMULÁRIO POR ID ====================
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await FormService.findById(parseInt(id), req.userId!);

      if (!form) {
        return res.status(404).json({ erro: 'Formulário não encontrado' });
      }

      res.json({ form });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== ATUALIZAR FORMULÁRIO ====================
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await FormService.update(parseInt(id), req.userId!, req.body);

      res.json({
        mensagem: 'Formulário atualizado com sucesso',
        form
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== PUBLICAR FORMULÁRIO ====================
  static async publish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await FormService.publish(parseInt(id), req.userId!);

      res.json({
        mensagem: 'Formulário publicado com sucesso',
        form
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== DELETAR FORMULÁRIO ====================
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await FormService.softDelete(parseInt(id), req.userId!);

      res.json({ mensagem: 'Formulário deletado com sucesso' });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== OBTER ESTATÍSTICAS ====================
  static async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await FormService.getStats(parseInt(id));

      res.json({ stats });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }
}