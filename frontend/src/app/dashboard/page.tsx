"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useFeedbacksStore, useFormsStore } from '../../store/store';
import feedbacksService from '../../services/feedbacks.service';
import formsService from '../../services/forms.service';

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { feedbacks, stats, setFeedbacks, setStats } = useFeedbacksStore();
  const { forms, setForms } = useFormsStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, feedbacksResponse, formsResponse] = await Promise.all([
        feedbacksService.getStats({ days: 30 }),
        feedbacksService.getFeedbacks({ limit: 10, sortBy: 'data_envio', sortOrder: 'desc' }),
        formsService.getForms({ limit: 10 })
      ]);

      setStats(statsResponse);
      setFeedbacks(feedbacksResponse.feedbacks || []);
      setForms(formsResponse.forms || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      if (type === 'excel') {
        await feedbacksService.downloadExcel();
      } else {
        await feedbacksService.downloadPDF();
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setError('Erro ao baixar relatório. Tente novamente.');
    }
  };

  const getSentimentColor = (opinstars: number) => {
    if (opinstars >= 4) return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
    if (opinstars === 3) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
    return 'bg-gradient-to-r from-rose-500 to-red-600 text-white';
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-amber-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-sm text-gray-600 mt-4 font-medium">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header Premium */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <img src="/opinapp_logo_rb.png" alt="OpinApp" className="h-10" />

              <nav className="hidden md:flex gap-1">
                <a
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg"
                >
                  Dashboard
                </a>
                <a
                  href="/forms"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Formulários
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {user?.nome?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-indigo-600 font-medium">{user?.plano}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Olá, {user?.nome?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Aqui está um resumo das suas métricas dos últimos 30 dias</p>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">📊</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">30d</span>
              </div>
              <p className="text-white/80 text-sm mb-1 font-medium">Total de Feedbacks</p>
              <p className="text-4xl font-bold mb-2">{stats?.totalFeedbacks || 0}</p>
              <p className="text-xs text-white/60">Respostas coletadas</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">⭐</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">Média</span>
              </div>
              <p className="text-white/80 text-sm mb-1 font-medium">Avaliação Média</p>
              <p className="text-4xl font-bold mb-2">{stats?.averageOpinStars || 0}<span className="text-2xl">/5</span></p>
              <div className="flex">
                {renderStars(Math.round(stats?.averageOpinStars || 0))}
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">😊</span>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">↑</span>
              </div>
              <p className="text-white/80 text-sm mb-1 font-medium">Satisfação</p>
              <p className="text-4xl font-bold mb-2">{stats?.sentimentDistribution?.positivePercentage || 0}%</p>
              <p className="text-xs text-white/60">
                {stats?.sentimentDistribution?.positive || 0} feedbacks positivos
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="group relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">📝</span>
                </div>
                <span className="text-xs bg-emerald-400 px-2 py-1 rounded-full">
                  {forms?.filter((f: any) => f.status === 'ACTIVE').length || 0} ativos
                </span>
              </div>
              <p className="text-white/80 text-sm mb-1 font-medium">Formulários</p>
              <p className="text-4xl font-bold mb-2">{forms?.length || 0}</p>
              <p className="text-xs text-white/60">Total criados</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200/50 overflow-x-auto">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'feedbacks', label: 'Feedbacks', icon: '💬' },
              { id: 'forms', label: 'Formulários', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'feedbacks' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Feedbacks Recentes</h2>
                <p className="text-sm text-gray-600 mt-1">Últimos feedbacks recebidos</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('excel')}
                  className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">📊</span> Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-3 py-2 text-sm font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">📄</span> PDF
                </button>
              </div>
            </div>

            {feedbacks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📭</span>
                </div>
                <p className="text-gray-700 font-semibold">Nenhum feedback ainda</p>
                <p className="text-sm text-gray-500 mt-2">Comece criando um formulário!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {feedbacks.map((feedback: any) => (
                  <div key={feedback.id} className="p-6 hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {feedback.modo === 'ANONYMOUS' || !feedback.nome_cliente
                                ? '?'
                                : feedback.nome_cliente.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {feedback.modo === 'ANONYMOUS' || !feedback.nome_cliente
                                ? 'Anônimo'
                                : feedback.nome_cliente}
                            </p>
                            <p className="text-xs text-gray-500">{feedback.forms?.nome || 'Formulário'}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {feedback.comentario_texto || 'Sem comentário'}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex">{renderStars(feedback.opinstars)}</div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getSentimentColor(
                              feedback.opinstars
                            )}`}
                          >
                            {feedback.opinstars >= 4
                              ? '😊 Positivo'
                              : feedback.opinstars === 3
                                ? '😐 Neutro'
                                : '😞 Negativo'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(feedback.data_envio).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'forms' && forms.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Seus Formulários</h2>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                + Novo Formulário
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form: any) => (
                <div
                  key={form.id}
                  className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📋</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${form.status === 'ACTIVE'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        }`}
                    >
                      {form.status === 'ACTIVE' ? '✓ Ativo' : form.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{form.nome}</h3>

                  <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <p className="text-3xl font-bold text-indigo-600 mb-1">
                      {form._count?.feedbacks || 0}
                    </p>
                    <p className="text-sm text-gray-600">respostas coletadas</p>
                  </div>

                  <button className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg">
                    Ver Detalhes →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gráfico de distribuição */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuição de Avaliações</h3>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats?.starDistribution?.[star] || 0;
                  const total = stats?.totalFeedbacks || 1;
                  const percentage = (count / total) * 100;

                  return (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-semibold text-gray-700">{star}</span>
                        <span className="text-amber-400">★</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sentimento geral */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Análise de Sentimento</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-emerald-700">😊 Positivos</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {stats?.sentimentDistribution?.positivePercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${stats?.sentimentDistribution?.positivePercentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-amber-700">😐 Neutros</span>
                    <span className="text-xl font-bold text-amber-600">
                      {((stats?.sentimentDistribution?.neutral || 0) / (stats?.totalFeedbacks || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${((stats?.sentimentDistribution?.neutral || 0) / (stats?.totalFeedbacks || 1) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border border-rose-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-rose-700">😞 Negativos</span>
                    <span className="text-xl font-bold text-rose-600">
                      {stats?.sentimentDistribution?.negativePercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-rose-200 rounded-full h-2">
                    <div
                      className="bg-rose-600 h-2 rounded-full"
                      style={{ width: `${stats?.sentimentDistribution?.negativePercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}