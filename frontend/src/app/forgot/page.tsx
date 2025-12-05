"use client";

import { useState } from "react";
import authService from "../../services/auth.service";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await authService.requestPasswordReset(email);
            setSuccess(true);
            setEmail("");
        } catch (err: any) {
            setError(err.message || "Erro ao enviar email de recuperação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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
                            Recuperar senha
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Digite seu email e enviaremos um link para redefinir sua senha
                        </p>
                    </div>

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                            Se o email existir em nossa base, você receberá um link de
                            recuperação em breve. Verifique sua caixa de entrada.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {!success && (
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Enviando..." : "Enviar link de recuperação"}
                            </button>

                            <div className="text-center">
                                <a
                                    href="/login"
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Voltar para o login
                                </a>
                            </div>
                        </form>
                    )}

                    {success && (
                        <div className="text-center">
                            <a
                                href="/login"
                                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all"
                            >
                                Voltar para o login
                            </a>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-auto">
                <div className="container mx-auto px-4">
                    <p className="text-gray-400 text-sm text-center">
                        © {new Date().getFullYear()} OpinApp. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}