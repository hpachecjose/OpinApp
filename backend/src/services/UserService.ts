import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { RegisterRequest, LoginRequest } from '../schemas/validation';

const prisma = new PrismaClient();

export class UserService {
  // ==================== CRIAR USUÁRIO ====================
  static async create(data: RegisterRequest) {
    try {
      const usuarioExistente = await prisma.users.findUnique({
        where: { email: data.email }
      });

      if (usuarioExistente) {
        throw new Error('Email já cadastrado');
      }

      const senha_hash = await bcrypt.hash(data.senha, 10);

      const usuario = await prisma.users.create({
        data: {
          nome: data.nome,
          email: data.email,
          senha_hash,
          empresa: data.empresa,
          plano: 'FREE'
        },
        select: {
          id: true,
          nome: true,
          email: true,
          empresa: true,
          plano: true,
          data_cadastro: true
        }
      });

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  // ==================== BUSCAR POR EMAIL ====================
  static async findByEmail(email: string) {
    return await prisma.users.findUnique({
      where: { email }
    });
  }

  // ==================== BUSCAR POR ID ====================
  static async findById(id: number) {
    return await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        plano: true,
        ativo: true,
        data_cadastro: true,
        ultimo_acesso: true
      }
    });
  }

  // ==================== ATUALIZAR ÚLTIMO ACESSO ====================
  static async updateLastAccess(id: number) {
    return await prisma.users.update({
      where: { id },
      data: { ultimo_acesso: new Date() }
    });
  }

  // ==================== VALIDAR SENHA ====================
  static async validatePassword(senha: string, senhaHash: string): Promise<boolean> {
    return await bcrypt.compare(senha, senhaHash);
  }

  // ==================== LISTAR TODOS ====================
  static async list(skip: number = 0, take: number = 10) {
    const [usuarios, total] = await Promise.all([
      prisma.users.findMany({
        skip,
        take,
        select: {
          id: true,
          nome: true,
          email: true,
          empresa: true,
          plano: true,
          ativo: true,
          data_cadastro: true
        },
        orderBy: { data_cadastro: 'desc' }
      }),
      prisma.users.count()
    ]);

    return { usuarios, total, paginas: Math.ceil(total / take) };
  }

  // ==================== DESATIVAR USUÁRIO ====================
  static async deactivate(id: number) {
    return await prisma.users.update({
      where: { id },
      data: { ativo: false }
    });
  }
}