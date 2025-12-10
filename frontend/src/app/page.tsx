"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/store";


export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToPrecos = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('precos');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
  return (
    <div className="font-sans min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/30 header sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-0">
            {/* Logo */}
            <a href="#" className="flex items-center cursor-pointer">
              <img src="/opinapp_logo_rb.png" alt="OpinApp Logo" className="logo h-8 sm:h-10 lg:h-50 w-auto" />
            </a>

            {/* Desktop Navigation */}

            <nav className="hidden lg:flex space-x-8">

              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium cursor-pointer">Início</a>
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium cursor-pointer">Sobre</a>
              <a href="#precos" onClick={scrollToPrecos} className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium cursor-pointer">Preços</a>
              <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium cursor-pointer">Contato</a>
              {isMounted && isAuthenticated && (
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium cursor-pointer">Dashboard</a>
              )}


            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-1">
              {isMounted && isAuthenticated ? (
                <a href="/dashboard" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-lg cursor-pointer">
                  Ir para Dashboard
                </a>
              ) : (
                <>
                  <a className="link-login text-muted-foreground hover:text-foreground transition-colors duration-200 mr-4 text-lg font-medium cursor-pointer" href="/login">Login</a>
                  <a href="/enrollment" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-lg cursor-pointer">
                    Inscrever-se
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden border-t border-gray-100 py-4`}>
            <nav className="flex flex-col space-y-4">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium py-2 cursor-pointer">Início</a>
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium py-2 cursor-pointer">Sobre</a>
              <a href="#precos" onClick={scrollToPrecos} className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium py-2 cursor-pointer">Preços</a>
              <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium py-2 cursor-pointer">Contato</a>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100 items-center">
                {isMounted && isAuthenticated ? (
                  <a href="/dashboard" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-lg w-full sm:w-auto text-center block cursor-pointer">
                    Ir para Dashboard
                  </a>
                ) : (
                  <>
                    <a href="/login" className="link-login text-muted-foreground hover:text-foreground transition-colors duration-200 text-lg font-medium py-2 text-center w-full sm:w-auto cursor-pointer">Login</a>
                    <a href="/enrollment" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-lg w-full sm:w-auto text-center block cursor-pointer">
                      Inscrever-se
                    </a>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-6xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Colete opiniões valiosas para o seu negócio
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-4xl mx-auto">
            Nossa <span className="font-semibold text-primary">Inteligência Artificial</span> analisa e resume automaticamente todos os comentários dos seus clientes.
            Receba insights valiosos, relatórios profissionais e análises que impulsionam seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
            <a href="/enrollment">
              <button className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-base sm:text-lg cursor-pointer">
                Começar gratuitamente
              </button></a>
            <a href="/about">
              <button className="border border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-primary-dark hover:text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-base sm:text-lg cursor-pointer">
                Saiba mais
              </button>
            </a>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              Por que escolher o OpinApp?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma inteligente com <span className="font-semibold text-primary">IA integrada</span> para analisar e resumir feedbacks automaticamente
            </p>
          </div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            <div className="text-center p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Validação Genuína</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">Teste suas hipóteses e receba feedbacks reais para melhorar o seu negócio.</p>
            </div>



            <div className="text-center p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
                IA Inteligente
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                Nossa IA analisa e resume automaticamente todos os comentários, extraindo insights valiosos.
              </p>
            </div>




            <div className="text-center p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Análises Inteligentes</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">Relatórios automáticos que destacam os insights mais importantes.</p>
            </div>




            <div className="text-center p-4 sm:p-6 lg:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary rounded-lg flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Compartilhamento Fácil</h3>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">Compartilhe pesquisas com um link único ou incorpore em seu site.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Seção de preços */}
      <section id="precos" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
              Planos e Preços
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Escolha o plano ideal e comece a coletar feedbacks reais dos seus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plano Gratuito */}
            <div className="bg-card shadow-md rounded-xl p-8 text-center hover-glow">
              <h3 className="text-xl font-semibold mb-2">Gratuito</h3>
              <p className="text-muted-foreground mb-6">Ideal para começar sem custo</p>
              <p className="text-4xl font-bold text-primary mb-6">R$0</p>
              <ul className="text-muted-foreground text-sm space-y-3 mb-6">
                <li>✔️ Até 50 comentários</li>
                <li>✔️ 1 formulário ativo</li>
                <li>✔️ Dashboard básico</li>
                <li>✔️ Suporte via FAQ</li>
              </ul>
              <a href="/enrollment">
                <button className="bg-primary text-white w-full py-3 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  Começar gratuitamente
                </button></a>
            </div>

            {/* Plano Pro */}
            <div className="bg-card shadow-lg rounded-xl p-8 text-center border-2 border-primary hover-glow">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">Para quem precisa de escala</p>
              <p className="text-4xl font-bold text-primary mb-6">
                R$49<span className="text-lg font-normal">/mês</span>
              </p>
              <ul className="text-muted-foreground text-sm space-y-3 mb-6">
                <li>✔️ Comentários ilimitados</li>
                <li>✔️ Formulários ilimitados</li>
                <li>✔️ Relatórios exportáveis (CSV/Excel)</li>
                <li>✔️ Dashboard avançado com gráficos</li>
                <li>✔️ Suporte por e-mail</li>
              </ul>
              <a href="/enrollment">
                <button className="bg-primary text-white w-full py-3 rounded-lg font-medium hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  Escolher plano Pro
                </button></a>
            </div>
          </div>
        </div>
      </section>



      {/* Seção de testemunhos */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Feedback real de empreendedores que usam o OpinApp todos os dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-card shadow-md rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                "O OpinApp mudou a forma como ouvimos nossos clientes. Hoje tomamos decisões baseadas em dados reais."
              </p>
              <div className="flex items-center space-x-4 min-h-[60px]">
                <img src="/avatars/cliente1.jpg" alt="Cliente 1" className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">Ana Souza</p>
                  <p className="text-sm text-muted-foreground truncate">Fundadora da Loja Verde</p>
                </div>
              </div>
            </div>

            <div className="bg-card shadow-md rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                "Receber feedbacks nunca foi tão fácil. A IA resume tudo em minutos!"
              </p>
              <div className="flex items-center space-x-4 min-h-[60px]">
                <img src="/avatars/cliente2.webp" alt="Cliente 2" className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">Carlos Lima</p>
                  <p className="text-sm text-muted-foreground truncate">CEO da StartupTech</p>
                </div>
              </div>
            </div>

            <div className="bg-card shadow-md rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                "Simples, rápido e eficiente. Hoje consigo validar meu MVP sem gastar fortunas."
              </p>
              <div className="flex items-center space-x-4 min-h-[60px]">
                <img src="/avatars/cliente3.webp" alt="Cliente 3" className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">Juliana Pereira</p>
                  <p className="text-sm text-muted-foreground truncate">Empreendedora Digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
            Pronto para aprimorar seu negócio?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto leading-relaxed">
            Junte-se a milhares de empreendedores que usam o OpinApp para tomar decisões baseadas em dados reais de comentários de seus clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
            <a href="/enrollment">
              <button className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-primary-dark hover:text-white hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-base sm:text-lg cursor-pointer">
                Criar conta gratuita
              </button></a>
            {/* <button className="border border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-primary-dark hover:border-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-base sm:text-lg cursor-pointer">
              Ver demonstração
            </button> */}
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* Logo + descrição */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/opinapp_logo_rb.png" alt="OpinApp Logo" className="logo h-8 sm:h-10 lg:h-50 w-auto" />
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Sua plataforma de coleta de feedbacks
              </p>
            </div>

            {/* Coluna Produto */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Produto</h3>
              <ul className="space-y-3">
                <li><a href="/resources" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Recursos</a></li>
                <li><a href="#precos" onClick={scrollToPrecos} className="text-gray-400 hover:text-white transition-colors cursor-pointer">Preços</a></li>
              </ul>
            </div>

            {/* Coluna Empresa */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Sobre</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Contato</a></li>
              </ul>
            </div>

            {/* Coluna Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Termos de uso</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Política de Privacidade</a></li>
                <li><a href="/cookies" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Política de Cookies</a></li>
              </ul>
            </div>
          </div>

          {/* Seção de Redes Sociais */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Siga-nos nas redes sociais</h3>
                <div className="flex space-x-4">
                  {/* Facebook */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="Facebook">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="LinkedIn">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>



                  {/* Instagram */}
                  <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer" aria-label="Instagram">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.206.056 2.003.246 2.48.415a4.92 4.92 0 011.675 1.01 4.92 4.92 0 011.01 1.675c.169.477.359 1.274.415 2.48.058 1.266.07 1.647.07 4.851s-.012 3.584-.07 4.85c-.056 1.206-.246 2.003-.415 2.48a4.918 4.918 0 01-1.01 1.675 4.917 4.917 0 01-1.675 1.01c-.477.169-1.274.359-2.48.415-1.266.058-1.647.07-4.85.07s-3.584-.012-4.85-.07c-1.206-.056-2.003-.246-2.48-.415a4.918 4.918 0 01-1.675-1.01 4.918 4.918 0 01-1.01-1.675c-.169-.477-.359-1.274-.415-2.48-.058-1.266-.07-1.647-.07-4.85s.012-3.584.07-4.85c.056-1.206.246-2.003.415-2.48a4.92 4.92 0 011.01-1.675 4.92 4.92 0 011.675-1.01c.477-.169 1.274-.359 2.48-.415 1.266-.058 1.647-.07 4.85-.07zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.642.435 3.68 1.06a7.073 7.073 0 00-2.566 2.566c-.625.962-.93 2.095-.988 3.373C.013 8.332 0 8.741 0 12s.013 3.668.072 4.948c.058 1.278.363 2.411.988 3.373a7.08 7.08 0 002.566 2.566c.962.625 2.095.93 3.373.988C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.278-.058 2.411-.363 3.373-.988a7.073 7.073 0 002.566-2.566c.625-.962.93-2.095.988-3.373.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.058-1.278-.363-2.411-.988-3.373a7.08 7.08 0 00-2.566-2.566c-.962-.625-2.095-.93-3.373-.988C15.668.013 15.259 0 12 0z" />
                      <path d="M12 5.838A6.162 6.162 0 005.838 12 6.162 6.162 0 0012 18.162 6.162 6.162 0 0018.162 12 6.162 6.162 0 0012 5.838zm0 10.324a4.162 4.162 0 114.162-4.162A4.167 4.167 0 0112 16.162zM18.406 4.594a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                    </svg>

                  </a>
                </div>
              </div>

              {/* Direitos autorais */}
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-xs sm:text-sm">
                  © {new Date().getFullYear()} OpinApp. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}




