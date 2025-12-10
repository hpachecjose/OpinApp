import { PrismaClient } from '@prisma/client';
import { CreateFeedbackRequest } from '../schemas/validation';

const prisma = new PrismaClient();

export class FeedbackService {
  // ==================== CRIAR FEEDBACK ====================
  static async create(data: CreateFeedbackRequest) {
    const feedback = await prisma.feedbacks.create({
      data: {
        form_id: data.form_id,
        opinstars: data.opinstars,
        comentario_texto: data.comentario_texto,
        modo: data.modo,
        nome_cliente: data.nome_cliente,
        email_cliente: data.email_cliente,
        status_moderacao: 'PENDING'
      }
    });

    return feedback;
  }

  // ==================== LISTAR FEEDBACKS DO FORMULÁRIO ====================
  static async listByForm(formId: number, skip: number = 0, take: number = 20) {
    const [feedbacks, total] = await Promise.all([
      prisma.feedbacks.findMany({
        where: { form_id: formId },
        skip,
        take,
        orderBy: { data_envio: 'desc' }
      }),
      prisma.feedbacks.count({ where: { form_id: formId } })
    ]);

    return { feedbacks, total, paginas: Math.ceil(total / take) };
  }

  // ==================== APROVAR FEEDBACK ====================
  static async approve(id: number) {
    return await prisma.feedbacks.update({
      where: { id },
      data: { status_moderacao: 'APPROVED' }
    });
  }

  // ==================== REJEITAR FEEDBACK ====================
  static async reject(id: number) {
    return await prisma.feedbacks.update({
      where: { id },
      data: { status_moderacao: 'REJECTED' }
    });
  }

  // ==================== ANALISAR COM IA ====================
  static async analyzeWithAI(feedback: string, stars: number) {
    // Integração com OpenAI será implementada aqui
    // Por enquanto, retorna análise mock
    
    const sentimentScore = stars >= 4 ? 'positive' : stars >= 3 ? 'neutral' : 'negative';
    
    return {
      sentiment: sentimentScore,
      themes: this.extractThemes(feedback),
      confidence: 0.85,
      recommendations: this.getRecommendations(sentimentScore)
    };
  }

  private static extractThemes(text: string): string[] {
    const temas = [];
    const palavrasChave = {
      'atendimento': ['atend', 'receb', 'trat'],
      'produto': ['produt', 'item', 'qualid'],
      'entrega': ['entrega', 'envio', 'demora'],
      'preço': ['preço', 'caro', 'valor']
    };

    for (const [tema, palavras] of Object.entries(palavrasChave)) {
      if (palavras.some(p => text.toLowerCase().includes(p))) {
        temas.push(tema);
      }
    }

    return temas;
  }

  private static getRecommendations(sentiment: string): string[] {
    if (sentiment === 'negative') {
      return ['Contatar cliente', 'Revisar processo', 'Oferecer compensação'];
    }
    if (sentiment === 'neutral') {
      return ['Investigar detalhes', 'Melhorar ponto fraco'];
    }
    return ['Manter padrão', 'Usar como case de sucesso'];
  }
}