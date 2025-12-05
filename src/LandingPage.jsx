import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Pickaxe, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-600">
            {/* Background Decor */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl translate-y-1/2"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">

                {/* Header / Logo Area */}
                <div className="mb-12 text-center animate-fade-in-down">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-white rounded-2xl shadow-xl shadow-orange-100/50 ring-1 ring-slate-100">
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2.5 rounded-xl">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            A2<span className="text-orange-500">Digital</span>
                        </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-700">
                        Painel de Ferramentas
                    </h2>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

                    {/* Card 1: Calculadora */}
                    <div
                        onClick={() => navigate('/calculadora')}
                        className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calculator className="w-32 h-32 text-orange-500 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Calculator className="w-7 h-7 text-orange-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
                                Calculadora Shopee
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Precifique seus produtos com precisão milimétrica. Calcule taxas, impostos e descubra sua margem real de lucro.
                            </p>

                            <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                                Acessar Ferramenta <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Minerador */}
                    <div
                        onClick={() => navigate('/minerador')}
                        className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Pickaxe className="w-32 h-32 text-blue-500 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Pickaxe className="w-7 h-7 text-blue-600" />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                Anúncios Minerados
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Encontre produtos vencedores. Espione a concorrência e descubra oportunidades ocultas no mercado.
                            </p>

                            <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                                Acessar Ferramenta <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Card 3: Automação */}
                <div className="w-full max-w-4xl mt-8">
                    <div
                        onClick={async () => {
                            const btn = document.getElementById('automation-btn-text');
                            const originalText = btn.innerText;
                            btn.innerText = 'Iniciando...';

                            try {
                                console.log('Tentando enviar webhook (Produção)...');
                                // URL de Produção (sem -test)
                                await fetch('https://primary-production-caa92.up.railway.app/webhook/56ccf2f3-45b3-4e37-af56-13516bc117d2', {
                                    method: 'GET',
                                    mode: 'no-cors'
                                });
                                console.log('Webhook enviado!');
                                alert('Automação iniciada!');
                            } catch (error) {
                                console.error('Erro:', error);
                                alert('Erro ao iniciar.');
                            } finally {
                                btn.innerText = originalText;
                            }
                        }}
                        className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="w-32 h-32 text-green-500 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-7 h-7 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-green-600 transition-colors">
                                        Automação n8n
                                    </h3>
                                    <p className="text-slate-500">
                                        Disparar fluxo de automação
                                    </p>
                                </div>
                            </div>

                            <div id="automation-btn-text" className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform bg-green-50 px-6 py-3 rounded-xl">
                                Iniciar Agora <ArrowRight className="ml-2 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Status */}
                <div className="mt-20 flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Sistema Operacional v2.0</span>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
