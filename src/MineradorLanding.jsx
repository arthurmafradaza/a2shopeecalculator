import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clapperboard, ArrowLeft, Sparkles } from 'lucide-react';

const MineradorLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">

            {/* Header Simples */}
            <div className="absolute top-6 left-6">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-600 flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" /> Voltar
                </button>
            </div>

            <div className="mb-12 text-center animate-fade-in-down">
                <div className="inline-flex items-center justify-center p-3 mb-6 bg-white rounded-2xl shadow-xl shadow-blue-100/50 ring-1 ring-slate-100">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <span className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                        A2<span className="text-blue-600">Miner</span>
                    </span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-700">
                    O que você quer minerar hoje?
                </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">

                {/* Card Shopee */}
                <div
                    onClick={() => navigate('/minerador/shopee')}
                    className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100 hover:-translate-y-1 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingBag className="w-7 h-7 text-orange-600" />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Produtos Shopee</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Minere produtos vencedores, salve links e analise a concorrência.
                        </p>

                        <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Acessar Produtos <span className="ml-2">→</span>
                        </div>
                    </div>
                </div>

                {/* Card Criativos */}
                <div
                    onClick={() => navigate('/minerador/criativos')}
                    className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100 hover:-translate-y-1 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Clapperboard className="w-7 h-7 text-purple-600" />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Banco de Criativos</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Salve vídeos e imagens de anúncios que estão performando bem.
                        </p>

                        <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                            Acessar Criativos <span className="ml-2">→</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MineradorLanding;
