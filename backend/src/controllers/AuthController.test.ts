import { Request, Response } from 'express';
import { AuthController } from './AuthController';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';

jest.mock('../services/UserService');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar novo usuário com sucesso', async () => {
      mockReq.body = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'Senha123!@#',
        empresa: 'Test Corp'
      };

      const mockUser = {
        id: 1,
        nome: 'Test User',
        email: 'test@example.com',
        empresa: 'Test Corp',
        plano: 'FREE',
        data_cadastro: new Date()
      };

      (UserService.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      await AuthController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Usuário registrado com sucesso',
          usuario: mockUser
        })
      );
    });

    it('deve retornar erro para email duplicado', async () => {
      mockReq.body = {
        email: 'existing@example.com',
        senha: 'Senha123!@#'
      };

      (UserService.create as jest.Mock).mockRejectedValue(
        new Error('Email já cadastrado')
      );

      await AuthController.register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      mockReq.body = {
        email: 'test@example.com',
        senha: 'Senha123!@#'
      };

      const mockUser = {
        id: 1,
        nome: 'Test User',
        email: 'test@example.com',
        senha_hash: 'hash-aqui',
        empresa: 'Test Corp',
        plano: 'FREE'
      };

      (UserService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (UserService.validatePassword as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      await AuthController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          mensagem: 'Login realizado com sucesso'
        })
      );
    });

    it('deve rejeitar credenciais inválidas', async () => {
      mockReq.body = {
        email: 'test@example.com',
        senha: 'WrongPassword'
      };

      (UserService.findByEmail as jest.Mock).mockResolvedValue(null);

      await AuthController.login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});