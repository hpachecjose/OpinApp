// frontend/src/store/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos
interface User {
    id: number;
    nome: string;
    email: string;
    empresa?: string;
    plano: string;
    data_cadastro: string;
}

interface Form {
    id: number;
    nome: string;
    usuario_id: number;
    campos_json?: any;
    status: string;
    data_criacao: string;
    _count?: {
        feedbacks: number;
        channels: number;
    };
}

interface Feedback {
    id: number;
    form_id: number;
    opinstars: number;
    comentario_texto?: string;
    modo: string;
    nome_cliente?: string;
    email_cliente?: string;
    data_envio: string;
    resultado_ia_json?: any;
    status_moderacao: string;
    forms?: {
        id: number;
        nome: string;
    };
}

// ========================================
// AUTH STORE
// ========================================

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

// ========================================
// FORMS STORE
// ========================================

interface FormsState {
    forms: Form[];
    currentForm: Form | null;
    loading: boolean;
    error: string | null;
    setForms: (forms: Form[]) => void;
    setCurrentForm: (form: Form | null) => void;
    addForm: (form: Form) => void;
    updateForm: (id: number, form: Partial<Form>) => void;
    deleteForm: (id: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useFormsStore = create<FormsState>((set) => ({
    forms: [],
    currentForm: null,
    loading: false,
    error: null,
    setForms: (forms) => set({ forms }),
    setCurrentForm: (form) => set({ currentForm: form }),
    addForm: (form) => set((state) => ({ forms: [form, ...state.forms] })),
    updateForm: (id, updatedForm) =>
        set((state) => ({
            forms: state.forms.map((f) => (f.id === id ? { ...f, ...updatedForm } : f)),
        })),
    deleteForm: (id) =>
        set((state) => ({
            forms: state.forms.filter((f) => f.id !== id),
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));

// ========================================
// FEEDBACKS STORE
// ========================================

interface FeedbacksState {
    feedbacks: Feedback[];
    stats: any;
    loading: boolean;
    error: string | null;
    setFeedbacks: (feedbacks: Feedback[]) => void;
    setStats: (stats: any) => void;
    deleteFeedback: (id: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useFeedbacksStore = create<FeedbacksState>((set) => ({
    feedbacks: [],
    stats: null,
    loading: false,
    error: null,
    setFeedbacks: (feedbacks) => set({ feedbacks }),
    setStats: (stats) => set({ stats }),
    deleteFeedback: (id) =>
        set((state) => ({
            feedbacks: state.feedbacks.filter((f) => f.id !== id),
        })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
