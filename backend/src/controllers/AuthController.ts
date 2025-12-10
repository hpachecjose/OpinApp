import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';
import { RegisterRequest, LoginRequest, PasswordResetSchema } from '../schemas/validation';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export class AuthController {
  // ==================== REGISTRAR ====================
  static async register(req: Request, res: Response) {
    try {
      const data = req.body as RegisterRequest;
      
      const usuario = await UserService.create(data);
      
      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET || 'seu-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        mensagem: 'Usuário registrado com sucesso',
        usuario,
        token
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  // ==================== LOGIN ====================
  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body as LoginRequest;

      const usuario = await UserService.findByEmail(email);

      if (!usuario) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      const senhaValida = await UserService.validatePassword(senha, usuario.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      // Atualizar último acesso
      await UserService.updateLastAccess(usuario.id);

      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET || 'seu-secret',
        { expiresIn: '7d' }
      );

      res.json({
        mensagem: 'Login realizado com sucesso',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          empresa: usuario.empresa,
          plano: usuario.plano
        },
        token
      });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== SOLICITAR RESET DE SENHA ====================
  static async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const usuario = await UserService.findByEmail(email);

      if (!usuario) {
        // Retornar sucesso mesmo que email não exista (segurança)
        return res.json({ mensagem: 'Se o email existe, link de reset foi enviado' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora

      await prisma.passwordReset.create({
        data: {
          userId: usuario.id,
          tokenHash,
          expiresAt
        }
      });

      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperar senha - OpinApp',
        html: `
          <h2>Recuperar Senha</h2>
          <p>Clique no link abaixo para resetar sua senha:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Resetar Senha
          </a>
          <p>Link válido por 1 hora.</p>
          <p>Se você não solicitou este reset, ignore este email.</p>
        `
      });

      res.json({ mensagem: 'Email de reset enviado com sucesso' });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== CONFIRMAR RESET DE SENHA ====================
  static async confirmPasswordReset(req: Request, res: Response) {
    try {
      const { token, nova_senha } = req.body;

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const resetRecord = await prisma.passwordReset.findUnique({
        where: { tokenHash }
      });

      if (!resetRecord || resetRecord.expiresAt < new Date() || resetRecord.used) {
        return res.status(400).json({ erro: 'Token inválido ou expirado' });
      }

      const senha_hash = await require('bcrypt').hash(nova_senha, 10);

      await prisma.users.update({
        where: { id: resetRecord.userId },
        data: { senha_hash }
      });

      await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true, usedAt: new Date() }
      });

      res.json({ mensagem: 'Senha resetada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  // ==================== OBTER PERFIL ATUAL ====================
  static async getProfile(req: Request, res: Response) {
    try {
      const usuario = await UserService.findById(req.userId!);
      res.json({ usuario });
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }
}