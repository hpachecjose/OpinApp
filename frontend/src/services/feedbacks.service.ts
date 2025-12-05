// frontend/src/services/feedbacks.service.ts
import api from '../lib/api';

export interface GetFeedbacksParams {
    form_id?: number;
    sentiment?: string;
    opinstars?: number;
    status_moderacao?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface GetStatsParams {
    form_id?: number;
    days?: number;
}

export interface CreateFeedbackData {
    form_id: number;
    opinstars: number;
    comentario_texto?: string;
    modo?: 'PUBLIC' | 'ANONYMOUS';
    nome_cliente?: string;
    email_cliente?: string;
}

class FeedbacksService {
    /**
     * Listar feedbacks (requer autenticação)
     */
    async getFeedbacks(params?: GetFeedbacksParams) {
        const response = await api.get('/api/feedbacks', { params });
        return response.data;
    }

    /**
     * Buscar estatísticas de feedbacks
     */
    async getStats(params?: GetStatsParams) {
        const response = await api.get('/api/feedbacks/stats', { params });
        return response.data;
    }

    /**
     * Buscar feedback por ID
     */
    async getFeedbackById(id: number) {
        const response = await api.get(`/api/feedbacks/${id}`);
        return response.data;
    }

    /**
     * Criar feedback (rota pública - não requer autenticação)
     */
    async createFeedback(data: CreateFeedbackData) {
        const response = await api.post('/api/feedbacks', data);
        return response.data;
    }

    /**
     * Deletar feedback
     */
    async deleteFeedback(id: number) {
        const response = await api.delete(`/api/feedbacks/${id}`);
        return response.data;
    }
}

export default new FeedbacksService();
