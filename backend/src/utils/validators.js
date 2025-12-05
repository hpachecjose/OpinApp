// backend/src/utils/validators.js
import Joi from 'joi';

// Schemas de validação
export const schemas = {
    // Autenticação
    register: Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Nome deve ter no mínimo 2 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres',
            'any.required': 'Nome é obrigatório'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        }),
        password: Joi.string().min(6).max(100).required().messages({
            'string.min': 'Senha deve ter no mínimo 6 caracteres',
            'string.max': 'Senha deve ter no máximo 100 caracteres',
            'any.required': 'Senha é obrigatória'
        }),
        company: Joi.string().max(100).optional().allow('', null)
    }),

    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Senha é obrigatória'
        })
    }),

    requestReset: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email inválido',
            'any.required': 'Email é obrigatório'
        })
    }),

    resetPassword: Joi.object({
        token: Joi.string().required().messages({
            'any.required': 'Token é obrigatório'
        }),
        newPassword: Joi.string().min(6).max(100).required().messages({
            'string.min': 'Senha deve ter no mínimo 6 caracteres',
            'any.required': 'Nova senha é obrigatória'
        })
    }),

    // Formulários
    createForm: Joi.object({
        nome: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Nome deve ter no mínimo 2 caracteres',
            'any.required': 'Nome é obrigatório'
        }),
        campos_json: Joi.object().optional(),
        status: Joi.string().valid('ACTIVE', 'PAUSED', 'DRAFT').default('DRAFT')
    }),

    updateForm: Joi.object({
        nome: Joi.string().min(2).max(100).optional(),
        campos_json: Joi.object().optional(),
        status: Joi.string().valid('ACTIVE', 'PAUSED', 'DRAFT').optional()
    }).min(1),

    // Feedbacks
    createFeedback: Joi.object({
        form_id: Joi.number().integer().positive().required(),
        opinstars: Joi.number().integer().min(1).max(5).required().messages({
            'number.min': 'Avaliação deve ser entre 1 e 5',
            'number.max': 'Avaliação deve ser entre 1 e 5'
        }),
        comentario_texto: Joi.string().max(2000).optional().allow('', null),
        modo: Joi.string().valid('PUBLIC', 'ANONYMOUS').default('PUBLIC'),
        nome_cliente: Joi.string().max(100).optional().allow('', null),
        email_cliente: Joi.string().email().optional().allow('', null)
    }),

    // Canais
    createChannel: Joi.object({
        form_id: Joi.number().integer().positive().required(),
        tipo: Joi.string().valid('QR_CODE', 'LINK', 'EMAIL', 'WHATSAPP', 'SMS').required(),
        link: Joi.string().uri().optional().allow('', null),
        estatisticas_json: Joi.object().optional()
    })
};

// Middleware de validação
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors
            });
        }

        // Substituir req.body com os dados validados e sanitizados
        req.body = value;
        next();
    };
};

// Validação de parâmetros de URL
export const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false
        });

        if (error) {
            return res.status(400).json({
                error: 'Parâmetros inválidos',
                details: error.details.map(d => d.message)
            });
        }

        req.params = value;
        next();
    };
};

// Schema para validação de ID
export const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});
