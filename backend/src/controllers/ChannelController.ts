import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateChannelRequest, UpdateChannelSchema } from '../schemas/validation';

const prisma = new PrismaClient();

export class ChannelController {
  // ==================== CRIAR CANAL ====================
  static async create(req: Request, res: Response) {
    try {
      const data = req.body as CreateChannelRequest;

      const channel = await prisma.channels.create({
        data: {
          form_id: data.form_id,
          tipo: data.tipo,
          link: data.link || `https://opinapp.com/forms/${data.form_id}/${data.tipo.toLowerCase()}`,
          estatisticas_json: {
            views: 0,
            responses: 0,
            conversion_rate: 0
          }
        }
      });

      res.status(201).json({
        mensagem: 'Canal criado com sucesso',
        channel
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== LISTAR CANAIS DO FORMULÁRIO ====================
  static async listByForm(req: Request, res: Response) {
    try {
      const { formId } = req.params;

      const channels = await prisma.channels.findMany({
        where: { form_id: parseInt(formId) },
        orderBy: { data_criacao: 'desc' }
      });

      res.json({ channels });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== ATUALIZAR CANAL ====================
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const channel = await prisma.channels.update({
        where: { id: parseInt(id) },
        data
      });

      res.json({
        mensagem: 'Canal atualizado com sucesso',
        channel
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== DELETAR CANAL ====================
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.channels.delete({
        where: { id: parseInt(id) }
      });

      res.json({ mensagem: 'Canal deletado com sucesso' });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }
}