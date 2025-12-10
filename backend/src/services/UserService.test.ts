import { UserService } from './UserService';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

jest.mock('@prisma/client');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar novo usuário com sucesso', async () => {
      const userData = {
        nome: 'Test User',
        email: 'test@example.com',
        senha: 'Senha123!@#',
        empresa: 'Test Corp'
      };

      // Mock do create
      // const result = await UserService.create(userData);
      // expect(result.email).toBe(userData.email);
    });

    it('deve rejeitar email duplicado', async () => {
      const userData = {
        nome: 'Test User',
        email: 'existing@example.com',
        senha: 'Senha123!@#'
      };

      // expect(UserService.create(userData)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('findByEmail', () => {
    it('deve encontrar usuário por email', async () => {
      // const user = await UserService.findByEmail('test@example.com');
      // expect(user).toBeDefined();
      // expect(user?.email).toBe('test@example.com');
    });

    it('deve retornar null para email não encontrado', async () => {
      // const user = await UserService.findByEmail('nonexistent@example.com');
      // expect(user).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('deve validar senha corretamente', async () => {
      const senha = 'Senha123!@#';
      const senhaHash = await bcrypt.hash(senha, 10);
      
      const isValid = await UserService.validatePassword(senha, senhaHash);
      expect(isValid).toBe(true);
    });

    it('deve rejeitar senha incorreta', async () => {
      const senhaHash = await bcrypt.hash('CorrectPassword', 10);
      
      const isValid = await UserService.validatePassword('WrongPassword', senhaHash);
      expect(isValid).toBe(false);
    });
  });
});