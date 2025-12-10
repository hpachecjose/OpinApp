import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erro:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ erro: 'Validação falhou', detalhes: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ erro: 'Recurso não encontrado' });
  }

  return res.status(500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};