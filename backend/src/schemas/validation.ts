import { z } from 'zod';

// ==================== AUTH SCHEMAS ====================
export const RegisterSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter número')
    .regex(/[!@#$%^&*]/, 'Senha deve conter caractere especial'),
  empresa: z.string().optional()
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória')
});

export const PasswordResetSchema = z.object({
  email: z.string().email('Email inválido')
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token inválido'),
  nova_senha: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter número')
});

// ==================== FORMS SCHEMAS ====================
export const FormFieldSchema = z.object({
  id: z.number(),
  type: z.enum(['text', 'email', 'textarea', 'rating', 'select', 'checkbox', 'date']),
  label: z.string().min(1, 'Label obrigatório'),
  required: z.boolean().default(false),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(z.string()).optional()
});

export const CreateFormSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),
  campos_json: z.object({
    fields: z.array(FormFieldSchema).min(1, 'Formulário precisa ter pelo menos 1 campo')
  }),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT')
});

export const UpdateFormSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .optional(),
  campos_json: z.object({
    fields: z.array(FormFieldSchema)
  }).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
});

// ==================== FEEDBACK SCHEMAS ====================
export const CreateFeedbackSchema = z.object({
  form_id: z.number().int('Form ID deve ser um número'),
  opinstars: z.number()
    .int('Avaliação deve ser um número inteiro')
    .min(1, 'Avaliação mínima é 1')
    .max(5, 'Avaliação máxima é 5')
    .optional(),
  comentario_texto: z.string()
    .max(5000, 'Comentário não pode exceder 5000 caracteres')
    .optional(),
  modo: z.enum(['ANONYMOUS', 'NAMED']).default('ANONYMOUS'),
  nome_cliente: z.string().max(100).optional(),
  email_cliente: z.string().email('Email inválido').optional()
    .refine(val => !val || val.length > 0, 'Email inválido')
});

export const AproveFeedbackSchema = z.object({
  status_moderacao: z.enum(['APPROVED', 'REJECTED']),
  motivo: z.string().optional()
});

// ==================== CHANNELS SCHEMAS ====================
export const CreateChannelSchema = z.object({
  form_id: z.number().int('Form ID deve ser um número'),
  tipo: z.enum(['LINK', 'QR', 'EMAIL', 'WHATSAPP', 'TELEGRAM']),
  link: z.string().url('Link inválido').optional()
});

export const UpdateChannelSchema = z.object({
  tipo: z.enum(['LINK', 'QR', 'EMAIL', 'WHATSAPP', 'TELEGRAM']).optional(),
  link: z.string().url('Link inválido').optional(),
  ativo: z.boolean().optional()
});

// ==================== REPORTS SCHEMAS ====================
export const CreateReportSchema = z.object({
  form_id: z.number().int('Form ID deve ser um número'),
  tipo: z.enum(['EXCEL', 'PDF', 'JSON']),
  filtros: z.object({
    data_inicio: z.date().optional(),
    data_fim: z.date().optional(),
    status_moderacao: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    minimo_stars: z.number().min(1).max(5).optional()
  }).optional()
});

// ==================== INTEGRATIONS SCHEMAS ====================
export const CreateIntegrationSchema = z.object({
  tipo: z.enum(['SLACK', 'ZAPIER', 'WEBHOOK', 'EMAIL']),
  config_json: z.record(z.any()),
  ativo: z.boolean().default(true)
});

export const UpdateIntegrationSchema = z.object({
  config_json: z.record(z.any()).optional(),
  ativo: z.boolean().optional()
});

// ==================== TYPE EXPORTS ====================
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type CreateFormRequest = z.infer<typeof CreateFormSchema>;
export type CreateFeedbackRequest = z.infer<typeof CreateFeedbackSchema>;
export type CreateChannelRequest = z.infer<typeof CreateChannelSchema>;
export type CreateReportRequest = z.infer<typeof CreateReportSchema>;
export type CreateIntegrationRequest = z.infer<typeof CreateIntegrationSchema>;