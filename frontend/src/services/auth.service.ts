// frontend/src/services/auth.service.ts
import api from '../lib/api';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    company?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
}

class AuthService {
    /**
     * Registrar novo usuário
     */
    async register(data: RegisterData) {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    }

    /**
     * Fazer login
     */
    async login(data: LoginData) {
        const response = await api.post('/api/auth/login', data);
        return response.data;
    }

    /**
     * Buscar dados do usuário autenticado
     */
    async getMe() {
        const response = await api.get('/api/auth/me');
        return response.data;
    }

    /**
     * Solicitar recuperação de senha
     */
    async requestPasswordReset(email: string) {
        const response = await api.post('/api/auth/request-reset', { email });
        return response.data;
    }

    /**
     * Validar token de recuperação
     */
    async validateResetToken(token: string) {
        const response = await api.post('/api/auth/validate-token', { token });
        return response.data;
    }

    /**
     * Redefinir senha
     */
    async resetPassword(data: ResetPasswordData) {
        const response = await api.post('/api/auth/reset', data);
        return response.data;
    }

    /**
     * Fazer logout (limpar dados locais)
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

export default new AuthService();
