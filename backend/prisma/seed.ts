import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ==================== LIMPAR DADOS ANTERIORES ====================
  await prisma.audit_logs.deleteMany();
  await prisma.logs.deleteMany();
  await prisma.reports.deleteMany();
  await prisma.feedbacks.deleteMany();
  await prisma.channels.deleteMany();
  await prisma.forms.deleteMany();
  await prisma.integrations.deleteMany();
  await prisma.PasswordReset.deleteMany();
  await prisma.users.deleteMany();
  
  console.log('✅ Dados anteriores removidos');

  // ==================== CRIAR USUÁRIOS ====================
  const senhaHash = await bcrypt.hash('senha123', 10);

  const usuario1 = await prisma.users.create({
    data: {
      nome: 'João Silva',
      email: 'joao@opinapp.com',
      senha_hash: senhaHash,
      empresa: 'Tech Solutions',
      plano: 'PRO',
      ativo: true,
      perfil_json: {
        avatar: 'https://avatar.example.com/joao.jpg',
        telefone: '(11) 98765-4321'
      },
      notificacoes: {
        email: true,
        push: true,
        sms: false
      }
    }
  });

  const usuario2 = await prisma.users.create({
    data: {
      nome: 'Maria Santos',
      email: 'maria@opinapp.com',
      senha_hash: senhaHash,
      empresa: 'Varejo Brasil',
      plano: 'BASIC',
      ativo: true,
      perfil_json: {
        avatar: 'https://avatar.example.com/maria.jpg',
        telefone: '(21) 99876-5432'
      },
      notificacoes: {
        email: true,
        push: false,
        sms: true
      }
    }
  });

  const usuario3 = await prisma.users.create({
    data: {
      nome: 'Carlos Admin',
      email: 'admin@opinapp.com',
      senha_hash: senhaHash,
      empresa: 'OpinApp Inc',
      plano: 'ENTERPRISE',
      ativo: true,
      perfil_json: {
        role: 'admin',
        avatar: 'https://avatar.example.com/carlos.jpg'
      },
      notificacoes: {
        email: true,
        push: true,
        sms: true
      }
    }
  });

  console.log('✅ Usuários criados:', [usuario1.id, usuario2.id, usuario3.id]);

  // ==================== CRIAR FORMULÁRIOS ====================
  const form1 = await prisma.forms.create({
    data: {
      nome: 'Feedback de Atendimento',
      usuario_id: usuario1.id,
      status: 'PUBLISHED',
      campos_json: {
        fields: [
          {
            id: 1,
            type: 'rating',
            label: 'Como foi sua experiência?',
            required: true,
            min: 1,
            max: 5
          },
          {
            id: 2,
            type: 'textarea',
            label: 'Deixe seu comentário',
            required: false,
            maxLength: 500
          },
          {
            id: 3,
            type: 'select',
            label: 'Motivo da visita',
            required: true,
            options: ['Compra', 'Devolução', 'Consulta', 'Reclamação']
          }
        ]
      }
    }
  });

  const form2 = await prisma.forms.create({
    data: {
      nome: 'Pesquisa de Satisfação',
      usuario_id: usuario2.id,
      status: 'PUBLISHED',
      campos_json: {
        fields: [
          {
            id: 1,
            type: 'rating',
            label: 'Qualidade do Produto',
            required: true
          },
          {
            id: 2,
            type: 'rating',
            label: 'Atendimento',
            required: true
          },
          {
            id: 3,
            type: 'text',
            label: 'Seu nome (opcional)',
            required: false
          },
          {
            id: 4,
            type: 'email',
            label: 'Seu email',
            required: false
          }
        ]
      }
    }
  });

  const form3 = await prisma.forms.create({
    data: {
      nome: 'Feedback Interno',
      usuario_id: usuario1.id,
      status: 'DRAFT',
      campos_json: {
        fields: [
          {
            id: 1,
            type: 'rating',
            label: 'Satisfação Geral',
            required: true
          }
        ]
      }
    }
  });

  console.log('✅ Formulários criados:', [form1.id, form2.id, form3.id]);

  // ==================== CRIAR CANAIS ====================
  const channel1 = await prisma.channels.create({
    data: {
      form_id: form1.id,
      tipo: 'LINK',
      link: 'https://opinapp.com/forms/feedback-atendimento',
      ativo: true,
      estatisticas_json: {
        views: 125,
        responses: 42,
        conversion_rate: 33.6,
        ultimaAtualizacao: new Date().toISOString()
      }
    }
  });

  const channel2 = await prisma.channels.create({
    data: {
      form_id: form1.id,
      tipo: 'QR',
      link: 'https://opinapp.com/qr/feedback-atendimento',
      ativo: true,
      estatisticas_json: {
        views: 89,
        responses: 34,
        conversion_rate: 38.2
      }
    }
  });

  const channel3 = await prisma.channels.create({
    data: {
      form_id: form2.id,
      tipo: 'EMAIL',
      link: 'https://opinapp.com/forms/pesquisa-satisfacao',
      ativo: true,
      estatisticas_json: {
        views: 200,
        responses: 55,
        conversion_rate: 27.5
      }
    }
  });

  console.log('✅ Canais criados:', [channel1.id, channel2.id, channel3.id]);

  // ==================== CRIAR FEEDBACKS ====================
  const feedback1 = await prisma.feedbacks.create({
    data: {
      form_id: form1.id,
      opinstars: 5,
      comentario_texto: 'Excelente atendimento! Recomendo muito.',
      modo: 'NAMED',
      nome_cliente: 'Pedro Costa',
      email_cliente: 'pedro@email.com',
      status_moderacao: 'APPROVED',
      resultado_ia_json: {
        sentiment: 'positive',
        themes: ['atendimento', 'qualidade'],
        confidence: 0.95,
        recommendations: ['Manter padrão de qualidade']
      }
    }
  });

  const feedback2 = await prisma.feedbacks.create({
    data: {
      form_id: form1.id,
      opinstars: 3,
      comentario_texto: 'Produto bom, mas demorou para chegar.',
      modo: 'NAMED',
      nome_cliente: 'Ana Silva',
      email_cliente: 'ana@email.com',
      status_moderacao: 'APPROVED',
      resultado_ia_json: {
        sentiment: 'neutral',
        themes: ['entrega', 'produto'],
        confidence: 0.88,
        recommendations: ['Otimizar logística']
      }
    }
  });

  const feedback3 = await prisma.feedbacks.create({
    data: {
      form_id: form1.id,
      opinstars: 2,
      comentario_texto: 'Não gostei da qualidade. Esperava mais.',
      modo: 'ANONYMOUS',
      status_moderacao: 'PENDING',
      resultado_ia_json: {
        sentiment: 'negative',
        themes: ['qualidade'],
        confidence: 0.92,
        recommendations: ['Revisar controle de qualidade', 'Contato com cliente']
      }
    }
  });

  const feedback4 = await prisma.feedbacks.create({
    data: {
      form_id: form2.id,
      opinstars: 4,
      comentario_texto: 'Bom custo-benefício',
      modo: 'NAMED',
      nome_cliente: 'Roberto Martins',
      email_cliente: 'roberto@email.com',
      status_moderacao: 'APPROVED',
      resultado_ia_json: {
        sentiment: 'positive',
        themes: ['preço', 'valor'],
        confidence: 0.87,
        recommendations: []
      }
    }
  });

  console.log('✅ Feedbacks criados:', [feedback1.id, feedback2.id, feedback3.id, feedback4.id]);

  // ==================== CRIAR INTEGRAÇÕES ====================
  const integracao1 = await prisma.integrations.create({
    data: {
      usuario_id: usuario1.id,
      tipo: 'SLACK',
      ativo: true,
      config_json: {
        webhook_url: 'https://hooks.slack.com/services/XXXX/YYYY/ZZZZ',
        channel: '#feedback',
        notifications: 'all'
      }
    }
  });

  const integracao2 = await prisma.integrations.create({
    data: {
      usuario_id: usuario1.id,
      tipo: 'WEBHOOK',
      ativo: true,
      config_json: {
        url: 'https://seu-servidor.com/webhook',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer token-aqui'
        }
      }
    }
  });

  console.log('✅ Integrações criadas:', [integracao1.id, integracao2.id]);

  // ==================== CRIAR RELATÓRIOS ====================
  const relatorio1 = await prisma.reports.create({
    data: {
      form_id: form1.id,
      usuario_id: usuario1.id,
      tipo: 'EXCEL',
      status: 'READY',
      caminho_arquivo: '/uploads/reports/feedback-atendimento-2025-01.xlsx'
    }
  });

  const relatorio2 = await prisma.reports.create({
    data: {
      form_id: form2.id,
      usuario_id: usuario2.id,
      tipo: 'PDF',
      status: 'READY',
      caminho_arquivo: '/uploads/reports/pesquisa-satisfacao-2025-01.pdf'
    }
  });

  console.log('✅ Relatórios criados:', [relatorio1.id, relatorio2.id]);

  // ==================== CRIAR LOGS ====================
  await prisma.logs.create({
    data: {
      usuario_id: usuario1.id,
      acao: 'LOGIN',
      ip: '192.168.1.100'
    }
  });

  await prisma.logs.create({
    data: {
      usuario_id: usuario1.id,
      acao: 'CRIAR_FORMULARIO',
      ip: '192.168.1.100'
    }
  });

  console.log('✅ Logs criados');

  // ==================== CRIAR AUDIT LOGS ====================
  await prisma.audit_logs.create({
    data: {
      usuario_id: usuario1.id,
      tabela: 'forms',
      registro_id: form1.id,
      acao: 'CREATE',
      dados_depois: {
        nome: 'Feedback de Atendimento',
        status: 'PUBLISHED'
      },
      ip: '192.168.1.100',
      user_agent: 'Mozilla/5.0...'
    }
  });

  console.log('✅ Audit logs criados');

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });