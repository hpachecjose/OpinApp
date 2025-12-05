// frontend/src/services/forms.service.ts
import api from '../lib/api';

export interface CreateFormData {
    nome: string;
    campos_json?: any;
    status?: 'ACTIVE' | 'PAUSED' | 'DRAFT';
}

export interface UpdateFormData {
    nome?: string;
    campos_json?: any;
    status?: 'ACTIVE' | 'PAUSED' | 'DRAFT';
}

export interface GetFormsParams {
    status?: string;
    page?: number;
    limit?: number;
}

class FormsService {
    /**
     * Listar formulários do usuário
     */
    async getForms(params?: GetFormsParams) {
        const response = await api.get('/api/forms', { params });
        return response.data;
    }

    /**
     * Buscar formulário por ID
     */
    async getFormById(id: number) {
        const response = await api.get(`/api/forms/${id}`);
        return response.data;
    }

    /**
     * Criar novo formulário
     */
    async createForm(data: CreateFormData) {
        const response = await api.post('/api/forms', data);
        return response.data;
    }

    /**
     * Atualizar formulário
     */
    async updateForm(id: number, data: UpdateFormData) {
        const response = await api.put(`/api/forms/${id}`, data);
        return response.data;
    }

    /**
     * Alterar status do formulário
     */
    async updateFormStatus(id: number, status: 'ACTIVE' | 'PAUSED' | 'DRAFT') {
        const response = await api.patch(`/api/forms/${id}/status`, { status });
        return response.data;
    }

    /**
     * Deletar formulário
     */
    async deleteForm(id: number) {
        const response = await api.delete(`/api/forms/${id}`);
        return response.data;
    }
}

export default new FormsService();
