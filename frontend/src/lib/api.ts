// frontend/src/lib/api.ts
import axios from 'axios';

// Configurar URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Criar instância do axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Erro com resposta do servidor
            const { status, data } = error.response;

            if (status === 401) {
                // Token inválido ou expirado
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirecionar para login se não estiver em rota pública
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }

            // Retornar mensagem de erro formatada
            return Promise.reject({
                status,
                message: data.error || data.message || 'Erro desconhecido',
                details: data.details
            });
        } else if (error.request) {
            // Requisição feita mas sem resposta
            return Promise.reject({
                status: 0,
                message: 'Erro de conexão com o servidor. Verifique sua internet.'
            });
        } else {
            // Erro ao configurar requisição
            return Promise.reject({
                status: 0,
                message: error.message || 'Erro ao processar requisição'
            });
        }
    }
);

export default api;
