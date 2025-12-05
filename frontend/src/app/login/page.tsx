"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/store";
import authService from "../../services/auth.service";

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(""); // Limpar erro ao digitar
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.login(formData);

            // Armazenar no state global e localStorage
            setAuth(response.user, response.token);

            // Redirecionar para dashboard
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans min-h-screen bg-background overflow-x-hidden flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200/30 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <a href="/" className="flex items-center">
                            <img
                                src="/opinapp_logo_rb.png"
                                alt="OpinApp Logo"
                                className="h-8 w-auto"
                            />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground">
                            Faça login na sua conta
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Ou{" "}
                            <a
                                href="/enrollment"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                crie uma conta gratuita
                            </a>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="seuemail@exemplo.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Senha
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <a
                                href="/forgot"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                Esqueceu sua senha?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-auto">
                <div className="container mx-auto px-4">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} OpinApp. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}