import React, { useState, useEffect } from 'react';
import {
    Calculator,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Save,
    RefreshCw,
    Download,
    Info,
    DollarSign,
    Percent,
    ShoppingBag,
    Target,
    ArrowRight,
    Lightbulb,
    Settings,
    Database
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Utility Functions ---

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
};

const getStatus = (margem) => {
    if (margem < 0) return { label: "Prejuízo", color: "text-red-600 bg-red-50 border-red-200", icon: <XCircle className="w-4 h-4" />, hex: "#EF4444" };
    if (margem < 5) return { label: "Risco Alto", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-4 h-4" />, hex: "#F59E0B" };
    if (margem < 15) return { label: "Viável", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <CheckCircle className="w-4 h-4" />, hex: "#3B82F6" };
    if (margem < 25) return { label: "Bom", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <TrendingUp className="w-4 h-4" />, hex: "#10B981" };
    return { label: "Excelente", color: "text-purple-600 bg-purple-50 border-purple-200", icon: <Target className="w-4 h-4" />, hex: "#8B5CF6" };
};

const calculateScenario = (precoVenda, custo, custoVariavel, taxaPercent, taxaFixa, impostoPercent, cpa) => {
    const receitaBruta = parseFloat(precoVenda) || 0;
    const custoProd = parseFloat(custo) || 0;
    const custoVar = parseFloat(custoVariavel) || 0;
    const tShopee = receitaBruta * (parseFloat(taxaPercent) / 100);
    const tFix = parseFloat(taxaFixa) || 0;
    const imp = receitaBruta * (parseFloat(impostoPercent) / 100);
    const cpaVal = parseFloat(cpa) || 0;

    const totalDeducoes = tShopee + tFix + imp + custoProd + custoVar + cpaVal;
    const lucroLiquido = receitaBruta - totalDeducoes;
    const margem = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    return {
        receitaBruta,
        taxaShopee: tShopee,
        taxaFixa: tFix,
        imposto: imp,
        custo: custoProd,
        custoVariavel: custoVar,
        cpa: cpaVal,
        lucroLiquido,
        margem,
        status: getStatus(margem)
    };
};

const calculateSuggestedPrice = (custo, custoVariavel, taxaPercent, taxaFixa, impostoPercent, cpaMin, cpaMax) => {
    const c = parseFloat(custo) || 0;
    const cVar = parseFloat(custoVariavel) || 0;
    const tPct = parseFloat(taxaPercent) || 0;
    const tFix = parseFloat(taxaFixa) || 0;
    const iPct = parseFloat(impostoPercent) || 0;
    const cMin = parseFloat(cpaMin) || 0;
    const cMax = parseFloat(cpaMax) || 0;

    const cpaMedio = (cMin + cMax) / 2;
    const margemAlvo = 0.10; // 10% sobre o custo (conforme pedido)
    const lucroDesejado = c * margemAlvo;

    const fatorReducao = 1 - (tPct / 100) - (iPct / 100);
    if (fatorReducao <= 0) return 0;

    const preco = (c + cVar + cpaMedio + lucroDesejado + tFix) / fatorReducao;
    return Math.ceil(preco * 2) / 2; // Arredonda para .00 ou .50
};

// --- Components ---

const InputField = ({ label, name, value, onChange, type = "number", step = "0.01", icon: Icon, tooltip, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1">
                {label}
                {tooltip && (
                    <div className="group relative">
                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            {children}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {Icon && <Icon className="h-4 w-4 text-gray-400" />}
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                step={step}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] sm:text-sm transition-all"
                placeholder="0.00"
            />
        </div>
    </div>
);

const ShopeeCalculator = () => {
    // --- State ---
    const [inputs, setInputs] = useState({
        nome: '',
        custo: '',
        custoVariavel: '',
        precoVenda: '',
        taxaShopeePercent: 20,
        taxaShopeeFixa: 4.00,
        impostoPercent: 5,
        cpaMin: 3.00,
        cpaMax: 8.00,
        lucroDesejado: '',
        margemDesejada: ''
    });

    const [currentScenario, setCurrentScenario] = useState(null);
    const [suggestedScenario, setSuggestedScenario] = useState(null);
    const [scenarios, setScenarios] = useState([]);
    const [reverseCalc, setReverseCalc] = useState({ lucro: '', cpa: '', resultado: null });
    const [savedProducts, setSavedProducts] = useState([]);
    const [showSaved, setShowSaved] = useState(false);
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const [simulatedCPA, setSimulatedCPA] = useState(0);
    const [sheetsUrl, setSheetsUrl] = useState('');
    const [isSavingToSheets, setIsSavingToSheets] = useState(false);
    const [showSheetsConfig, setShowSheetsConfig] = useState(false);

    // --- Effects ---

    useEffect(() => {
        const saved = localStorage.getItem('shopeeProducts');
        if (saved) {
            setSavedProducts(JSON.parse(saved));
        }
        const url = localStorage.getItem('sheetsUrl');
        if (url) {
            setSheetsUrl(url);
        }
    }, []);

    useEffect(() => {
        calculateAll();
    }, [inputs]);

    // --- Logic ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const applySuggestion = () => {
        setInputs(prev => ({ ...prev, precoVenda: suggestedPrice.toFixed(2) }));
    };

    const calculateAll = () => {
        // Calculate Suggested Price
        const suggestion = calculateSuggestedPrice(
            inputs.custo,
            inputs.custoVariavel,
            inputs.taxaShopeePercent,
            inputs.taxaShopeeFixa,
            inputs.impostoPercent,
            inputs.cpaMin,
            inputs.cpaMax
        );
        setSuggestedPrice(suggestion);

        const avgCpa = (parseFloat(inputs.cpaMin) + parseFloat(inputs.cpaMax)) / 2;

        // Current Situation
        const current = calculateScenario(
            inputs.precoVenda,
            inputs.custo,
            inputs.custoVariavel,
            inputs.taxaShopeePercent,
            inputs.taxaShopeeFixa,
            inputs.impostoPercent,
            avgCpa
        );
        setCurrentScenario(current);

        // Suggested Scenario (for comparison)
        if (suggestion > 0) {
            const suggScenario = calculateScenario(
                suggestion,
                inputs.custo,
                inputs.custoVariavel,
                inputs.taxaShopeePercent,
                inputs.taxaShopeeFixa,
                inputs.impostoPercent,
                avgCpa
            );
            setSuggestedScenario(suggScenario);
        } else {
            setSuggestedScenario(null);
        }

        // Scenarios Grid
        const min = parseFloat(inputs.cpaMin) || 0;
        const max = parseFloat(inputs.cpaMax) || 0;
        if (max > min) {
            const step = (max - min) / 4;
            const newScenarios = [];
            for (let i = 0; i < 5; i++) {
                const cpa = min + (step * i);
                newScenarios.push(calculateScenario(
                    inputs.precoVenda,
                    inputs.custo,
                    inputs.custoVariavel,
                    inputs.taxaShopeePercent,
                    inputs.taxaShopeeFixa,
                    inputs.impostoPercent,
                    cpa
                ));
            }
            setScenarios(newScenarios);
        }
    };

    const handleReverseCalc = () => {
        const custo = parseFloat(inputs.custo) || 0;
        const custoVar = parseFloat(inputs.custoVariavel) || 0;
        const taxaPercent = parseFloat(inputs.taxaShopeePercent) || 0;
        const taxaFixa = parseFloat(inputs.taxaShopeeFixa) || 0;
        const impostoPercent = parseFloat(inputs.impostoPercent) || 0;
        const cpa = parseFloat(reverseCalc.cpa) || 0;
        const lucro = parseFloat(reverseCalc.lucro) || 0;

        const fatorReducao = 1 - (taxaPercent / 100) - (impostoPercent / 100);
        if (fatorReducao <= 0) {
            setReverseCalc(prev => ({ ...prev, resultado: 'Erro: Taxas muito altas' }));
            return;
        }

        const precoNecessario = (custo + custoVar + cpa + lucro + taxaFixa) / fatorReducao;
        setReverseCalc(prev => ({ ...prev, resultado: precoNecessario }));
    };

    const saveProduct = async () => {
        if (!inputs.nome) {
            alert('Preencha o nome do produto!');
            return;
        }
        const newProduct = { ...inputs, id: Date.now(), date: new Date().toLocaleDateString() };
        const updated = [newProduct, ...savedProducts];
        setSavedProducts(updated);
        localStorage.setItem('shopeeProducts', JSON.stringify(updated));
        
        // Salvar no Google Sheets se configurado
        if (sheetsUrl) {
            setIsSavingToSheets(true);
            
            // Tenta primeiro com fetch
            try {
                const response = await fetch(sheetsUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newProduct),
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('✅ Produto salvo no Google Sheets!');
                } else {
                    alert('❌ Erro ao salvar: ' + (result.error || 'Erro desconhecido'));
                    console.error('Erro do Sheets:', result);
                }
            } catch (error) {
                console.error('Erro com fetch, tentando método alternativo:', error);
                
                // Se fetch falhar (CORS), usa método alternativo com redirecionamento
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = sheetsUrl;
                form.target = '_blank';
                form.enctype = 'application/x-www-form-urlencoded';
                form.style.display = 'none';
                
                // Adiciona dados como campos individuais (mais confiável)
                Object.keys(newProduct).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = newProduct[key] || '';
                    form.appendChild(input);
                });
                
                // Também adiciona JSON completo como fallback
                const jsonInput = document.createElement('input');
                jsonInput.type = 'hidden';
                jsonInput.name = 'jsonData';
                jsonInput.value = JSON.stringify(newProduct);
                form.appendChild(jsonInput);
                
                document.body.appendChild(form);
                form.submit();
                
                setTimeout(() => {
                    if (document.body.contains(form)) {
                        document.body.removeChild(form);
                    }
                }, 1000);
                
                alert('✅ Produto enviado! Verifique a planilha.\n\n(Se não apareceu, verifique as permissões)');
            } finally {
                setIsSavingToSheets(false);
            }
        } else {
            alert('✅ Produto salvo localmente!');
        }
    };
    
    const testSheetsConnection = async () => {
        if (!sheetsUrl) {
            alert('Configure a URL do Google Sheets primeiro!');
            return;
        }
        
        try {
            const response = await fetch(sheetsUrl);
            const result = await response.json();
            
            if (result.success !== undefined) {
                alert('✅ Conexão OK! A API está funcionando.\n\nProdutos encontrados: ' + (result.products?.length || 0));
            } else {
                alert('⚠️ Resposta inesperada da API. Verifique o script.');
            }
        } catch (error) {
            alert('❌ Erro ao conectar:\n\n' + error.message + '\n\nVerifique:\n1. Se a URL está correta\n2. Se o deploy foi feito com "Qualquer pessoa"\n3. Se autorizou as permissões');
        }
    };
    
    const loadProductsFromSheets = async () => {
        if (!sheetsUrl) {
            alert('Configure a URL do Google Sheets primeiro!');
            return;
        }
        
        try {
            const response = await fetch(sheetsUrl);
            const result = await response.json();
            
            if (result.success && result.products) {
                // Converter produtos do formato Sheets para o formato local
                const convertedProducts = result.products.map(p => ({
                    id: p.id || Date.now(),
                    date: p.data || new Date().toLocaleDateString(),
                    nome: p.nome || '',
                    custo: p.custo || '',
                    custoVariavel: p.custovariável || p.custovariavel || '',
                    precoVenda: p.preçovenda || p.precovenda || '',
                    taxaShopeePercent: p.taxashopee || p.taxashopeepercent || 20,
                    taxaShopeeFixa: p.taxashopeefixa || 4.00,
                    impostoPercent: p.imposto || p.impostopercent || 5,
                    cpaMin: p.cpamínimo || p.cpaminimo || 3.00,
                    cpaMax: p.cpamáximo || p.cpamaximo || 8.00,
                }));
                
                setSavedProducts(convertedProducts);
                localStorage.setItem('shopeeProducts', JSON.stringify(convertedProducts));
                alert(`${convertedProducts.length} produtos carregados do Google Sheets!`);
            }
        } catch (error) {
            console.error('Erro ao carregar do Sheets:', error);
            alert('Erro ao carregar produtos do Google Sheets');
        }
    };
    
    const saveSheetsUrl = () => {
        localStorage.setItem('sheetsUrl', sheetsUrl);
        setShowSheetsConfig(false);
        alert('URL do Google Sheets salva!');
    };

    const loadProduct = (product) => {
        const { id, date, ...rest } = product;
        setInputs(rest);
        setShowSaved(false);
    };

    const deleteProduct = (id) => {
        const updated = savedProducts.filter(p => p.id !== id);
        setSavedProducts(updated);
        localStorage.setItem('shopeeProducts', JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#EE4D2D] p-2 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#EE4D2D] to-[#8B0000]">
                            Shopee Pricing Pro
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSheetsConfig(!showSheetsConfig)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            title="Configurar Google Sheets"
                        >
                            <Database className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowSaved(!showSaved)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
                        >
                            <Save className="w-5 h-5" />
                            {savedProducts.length > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EE4D2D] rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Google Sheets Config Modal */}
            {showSheetsConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSheetsConfig(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Database className="w-5 h-5 text-green-600" />
                                Configurar Google Sheets
                            </h3>
                            <button onClick={() => setShowSheetsConfig(false)}><XCircle className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL do Web App (Google Apps Script)
                                </label>
                                <input
                                    type="text"
                                    value={sheetsUrl}
                                    onChange={(e) => setSheetsUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    placeholder="https://script.google.com/macros/s/..."
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Cole aqui a URL do Web App do Google Apps Script
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={saveSheetsUrl}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                                >
                                    Salvar URL
                                </button>
                                <button
                                    onClick={testSheetsConnection}
                                    disabled={!sheetsUrl}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors text-sm"
                                >
                                    Testar Conexão
                                </button>
                            </div>
                            <button
                                onClick={loadProductsFromSheets}
                                disabled={!sheetsUrl}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md font-medium transition-colors mt-2"
                            >
                                <Download className="w-4 h-4 inline mr-2" />
                                Carregar do Sheets
                            </button>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                <strong>Como configurar:</strong>
                                <ol className="list-decimal list-inside mt-2 space-y-1">
                                    <li>Abra sua planilha no Google Sheets</li>
                                    <li>Vá em Extensões → Apps Script</li>
                                    <li>Cole o código do arquivo google-apps-script.js</li>
                                    <li>Faça o deploy como Web App</li>
                                    <li>Copie a URL e cole aqui</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Saved Products Sidebar (Overlay) */}
            {showSaved && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSaved(false)}></div>
                    <div className="relative w-80 bg-white h-full shadow-2xl p-4 overflow-y-auto transition-transform">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Produtos Salvos</h3>
                            <button onClick={() => setShowSaved(false)}><XCircle className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        {sheetsUrl && (
                            <button
                                onClick={loadProductsFromSheets}
                                className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Carregar do Google Sheets
                            </button>
                        )}
                        <div className="space-y-3">
                            {savedProducts.map(p => (
                                <div key={p.id} className="p-3 border rounded-lg hover:border-[#EE4D2D] cursor-pointer group bg-gray-50" onClick={() => loadProduct(p)}>
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium truncate">{p.nome || 'Sem nome'}</div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{p.date}</div>
                                    <div className="text-xs font-mono mt-1 text-[#EE4D2D]">R$ {p.precoVenda}</div>
                                </div>
                            ))}
                            {savedProducts.length === 0 && <div className="text-center text-gray-400 py-8">Nenhum produto salvo</div>}
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - INPUTS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-[#EE4D2D]" />
                                    Dados do Produto
                                </h2>
                            </div>
                            <div className="p-6 space-y-1">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                    <input
                                        type="text"
                                        name="nome"
                                        value={inputs.nome}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EE4D2D] focus:border-[#EE4D2D] sm:text-sm"
                                        placeholder="Ex: Shortinho Viral"
                                    />
                                </div>
                                <InputField
                                    label="Custo do Produto"
                                    name="custo"
                                    value={inputs.custo}
                                    onChange={handleInputChange}
                                    icon={DollarSign}
                                    tooltip="Quanto você paga pelo produto"
                                />

                                <InputField
                                    label="Custo Variável"
                                    name="custoVariavel"
                                    value={inputs.custoVariavel}
                                    onChange={handleInputChange}
                                    icon={DollarSign}
                                    tooltip="Embalagem, etiquetas, e outros custos variáveis por unidade"
                                />

                                {/* Custom Input for Preço de Venda with Suggestion */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                            Preço de Venda
                                            <div className="group relative">
                                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                    Preço final para o cliente
                                                </div>
                                            </div>
                                        </label>
                                        {suggestedPrice > 0 && (
                                            <button
                                                onClick={applySuggestion}
                                                className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-full hover:bg-indigo-100 transition-colors flex items-center gap-1 animate-pulse"
                                            >
                                                <Lightbulb size={12} className="fill-indigo-400 text-indigo-600" />
                                                Usar Sugestão: {formatCurrency(suggestedPrice)}
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="precoVenda"
                                            value={inputs.precoVenda}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-[#EE4D2D] sm:text-sm transition-all"
                                            placeholder={suggestedPrice > 0 ? `Sugestão: ${formatCurrency(suggestedPrice)}` : "0.00"}
                                        />
                                    </div>
                                    {suggestedPrice > 0 && (
                                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Info size={10} />
                                            Baseado em CPA médio e margem de 10%
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Taxas e Impostos</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            label="Taxa Shopee %"
                                            name="taxaShopeePercent"
                                            value={inputs.taxaShopeePercent}
                                            onChange={handleInputChange}
                                            icon={Percent}
                                        />
                                        <InputField
                                            label="Taxa Fixa"
                                            name="taxaShopeeFixa"
                                            value={inputs.taxaShopeeFixa}
                                            onChange={handleInputChange}
                                            icon={DollarSign}
                                        />
                                    </div>
                                    <InputField
                                        label="Imposto (DAS) %"
                                        name="impostoPercent"
                                        value={inputs.impostoPercent}
                                        onChange={handleInputChange}
                                        icon={Percent}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Marketing (CPA)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            label="CPA Mínimo"
                                            name="cpaMin"
                                            value={inputs.cpaMin}
                                            onChange={handleInputChange}
                                            icon={DollarSign}
                                        />
                                        <InputField
                                            label="CPA Máximo"
                                            name="cpaMax"
                                            value={inputs.cpaMax}
                                            onChange={handleInputChange}
                                            icon={DollarSign}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={saveProduct}
                                    disabled={isSavingToSheets}
                                    className="w-full mt-6 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200 active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSavingToSheets ? 'Salvando...' : 'Salvar Produto'}
                                    {sheetsUrl && <span className="text-xs bg-green-500 px-2 py-0.5 rounded">+ Sheets</span>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - RESULTS */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* 2.1 CURRENT SITUATION */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-[#EE4D2D]" />
                                    Análise do Preço Atual
                                </h2>
                                {currentScenario && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${currentScenario.status.color}`}>
                                        {currentScenario.status.icon}
                                        {currentScenario.status.label}
                                    </span>
                                )}
                            </div>

                            {currentScenario && currentScenario.receitaBruta > 0 ? (
                                <div className="p-6 grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Receita Bruta</span>
                                            <span className="font-medium">{formatCurrency(currentScenario.receitaBruta)}</span>
                                        </div>

                                        {/* Detailed Breakdown */}
                                        <div className="space-y-1 pl-2 border-l-2 border-gray-100 my-2">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Taxa Shopee ({inputs.taxaShopeePercent}%)</span>
                                                <span>- {formatCurrency(currentScenario.taxaShopee)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Taxa Fixa</span>
                                                <span>- {formatCurrency(currentScenario.taxaFixa)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Imposto ({inputs.impostoPercent}%)</span>
                                                <span>- {formatCurrency(currentScenario.imposto)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Custo Produto</span>
                                                <span>- {formatCurrency(currentScenario.custo)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Custo Variável</span>
                                                <span>- {formatCurrency(currentScenario.custoVariavel)}</span>
                                            </div>

                                            {/* Lucro antes do Ads (New Line) */}
                                            <div className="flex justify-between text-sm font-medium text-indigo-600 py-1 border-y border-dashed border-indigo-100 my-1">
                                                <span>Lucro antes do Ads</span>
                                                <span>{formatCurrency(currentScenario.receitaBruta - currentScenario.taxaShopee - currentScenario.taxaFixa - currentScenario.imposto - currentScenario.custo - currentScenario.custoVariavel)}</span>
                                            </div>

                                            <div className="flex justify-between text-xs text-amber-600/70">
                                                <span>CPA Médio</span>
                                                <span>- {formatCurrency(currentScenario.cpa)}</span>
                                            </div>
                                        </div>

                                        {/* Summary Lines */}
                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex justify-between text-sm text-red-600 font-medium mb-1">
                                                <span>(-) Total de Custos e Taxas</span>
                                                <span>{formatCurrency(currentScenario.taxaShopee + currentScenario.taxaFixa + currentScenario.imposto + currentScenario.custo + currentScenario.custoVariavel + currentScenario.cpa)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Lucro Líquido</span>
                                                <span className={currentScenario.lucroLiquido > 0 ? "text-emerald-600" : "text-red-600"}>
                                                    {formatCurrency(currentScenario.lucroLiquido)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium text-gray-500 mt-1">
                                                <span>Margem Líquida</span>
                                                <span>{formatPercent(currentScenario.margem)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center items-center text-center flex-1">
                                            <div className="text-sm text-gray-500 mb-1">CPA Máximo Viável (Breakeven)</div>
                                            <div className="text-3xl font-bold text-gray-800">
                                                {formatCurrency(currentScenario.lucroLiquido + currentScenario.cpa)}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2 max-w-[200px]">
                                                Este é o valor máximo que você pode gastar em marketing para não ter prejuízo.
                                            </p>
                                        </div>
                                        <div className="bg-indigo-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                                            <div className="text-xs text-indigo-500 mb-1">Valor a Receber (Shopee)</div>
                                            <div className="text-xl font-bold text-indigo-700">
                                                {formatCurrency(currentScenario.receitaBruta - currentScenario.taxaShopee - currentScenario.taxaFixa)}
                                            </div>
                                            <p className="text-[10px] text-indigo-400 mt-1">
                                                O que cai na conta antes de pagar custos e impostos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-400">
                                    Preencha os dados do produto para ver a análise.
                                </div>
                            )}
                        </div>

                        {/* COMPARISON CARD (New Feature) */}
                        {currentScenario && suggestedScenario && Math.abs(currentScenario.receitaBruta - suggestedScenario.receitaBruta) > 0.1 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
                                    <div className="bg-indigo-100 p-1.5 rounded">
                                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-sm">Comparação de Estratégia</h3>
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-gray-100">
                                    {/* User Price */}
                                    <div className="p-4 bg-white">
                                        <div className="text-xs text-gray-500 font-bold uppercase mb-2">Seu Preço</div>
                                        <div className="text-xl font-bold text-gray-800 mb-1">{formatCurrency(currentScenario.receitaBruta)}</div>
                                        <div className="space-y-1">
                                            <div className={`text-sm font-medium ${currentScenario.margem < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                Margem: {formatPercent(currentScenario.margem)}
                                                {currentScenario.margem < 10 && <span className="ml-1">⚠️</span>}
                                            </div>
                                            <div className="text-sm text-gray-600">Lucro: {formatCurrency(currentScenario.lucroLiquido)}</div>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-400">
                                            {currentScenario.margem < suggestedScenario.margem ? "Maior risco, menor margem" : "Maior margem, possível menor volume"}
                                        </div>
                                    </div>

                                    {/* Suggested Price */}
                                    <div className="p-4 bg-indigo-50/30">
                                        <div className="text-xs text-indigo-600 font-bold uppercase mb-2 flex items-center gap-1">
                                            <Lightbulb size={12} /> Sugestão
                                        </div>
                                        <div className="text-xl font-bold text-indigo-700 mb-1">{formatCurrency(suggestedScenario.receitaBruta)}</div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-indigo-700">
                                                Margem: {formatPercent(suggestedScenario.margem)} ✅
                                            </div>
                                            <div className="text-sm text-indigo-600">Lucro: {formatCurrency(suggestedScenario.lucroLiquido)}</div>
                                        </div>
                                        <div className="mt-3 text-xs text-indigo-400">
                                            Equilíbrio ideal entre volume e lucro
                                        </div>
                                        <button
                                            onClick={applySuggestion}
                                            className="mt-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition-colors w-full"
                                        >
                                            Aplicar Sugestão
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2.2 SCENARIOS GRID */}
                        {scenarios.length > 0 && (
                            <div className="grid md:grid-cols-5 gap-3">
                                {scenarios.map((cenario, idx) => (
                                    <div key={idx} className={`bg-white rounded-xl p-3 shadow-sm border-t-4 ${cenario.status.color.replace('bg-', 'border-').split(' ')[2]} flex flex-col justify-between transition-transform hover:-translate-y-1`}>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">CPA {formatCurrency(cenario.cpa)}</div>
                                            <div className={`text-lg font-bold ${cenario.lucroLiquido > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                                {formatCurrency(cenario.lucroLiquido)}
                                            </div>
                                            <div className="text-xs font-medium text-gray-400">{formatPercent(cenario.margem)} margem</div>
                                        </div>
                                        <div className={`mt-3 text-[10px] uppercase font-bold px-2 py-1 rounded-full w-fit ${cenario.status.color}`}>
                                            {cenario.status.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2.3 CPA PLANNING & SIMULATOR */}
                        {currentScenario && currentScenario.receitaBruta > 0 && (
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden border border-slate-700">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Target className="w-40 h-40" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="flex items-center gap-2 font-bold text-lg mb-6 text-white">
                                        <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                                            <Calculator className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        Planejamento de CPA
                                    </h3>

                                    {/* CPA Targets Grid */}
                                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                                        {/* Breakeven */}
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">CPA Limite (Teto)</div>
                                            <div className="text-2xl font-bold text-white">
                                                {formatCurrency(currentScenario.lucroLiquido + currentScenario.cpa)}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-2">
                                                Máximo para não ter prejuízo (0 a 0).
                                            </div>
                                        </div>

                                        {/* Healthy Target (15%) */}
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 backdrop-blur-sm hover:bg-emerald-500/20 transition-colors">
                                            <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1">CPA Ideal (Meta 15%)</div>
                                            <div className="text-2xl font-bold text-emerald-300">
                                                {formatCurrency((currentScenario.lucroLiquido + currentScenario.cpa) - (currentScenario.receitaBruta * 0.15))}
                                            </div>
                                            <div className="text-[10px] text-emerald-400/70 mt-2">
                                                Para manter uma operação saudável.
                                            </div>
                                        </div>

                                        {/* Aggressive Target (5%) */}
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 backdrop-blur-sm hover:bg-amber-500/20 transition-colors">
                                            <div className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-1">CPA Agressivo (Meta 5%)</div>
                                            <div className="text-2xl font-bold text-amber-300">
                                                {formatCurrency((currentScenario.lucroLiquido + currentScenario.cpa) - (currentScenario.receitaBruta * 0.05))}
                                            </div>
                                            <div className="text-[10px] text-amber-400/70 mt-2">
                                                Para escalar com volume máximo.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Simulator */}
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                            Simulador de ROI
                                        </h4>
                                        <div className="flex flex-col md:flex-row gap-6 items-center">
                                            <div className="w-full md:w-1/2">
                                                <label className="text-xs text-slate-400 mb-2 block">Se eu pagar de CPA:</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={simulatedCPA}
                                                        onChange={(e) => setSimulatedCPA(Number(e.target.value))}
                                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-2 pl-8 pr-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div className="hidden md:block text-slate-600">
                                                <ArrowRight className="w-6 h-6" />
                                            </div>

                                            <div className="w-full md:w-1/2 flex justify-between items-center bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                                <div>
                                                    <div className="text-xs text-slate-400">Lucro Estimado</div>
                                                    <div className={`text-xl font-bold ${(currentScenario.lucroLiquido + currentScenario.cpa - simulatedCPA) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {formatCurrency(currentScenario.lucroLiquido + currentScenario.cpa - simulatedCPA)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-400">Margem</div>
                                                    <div className={`text-sm font-bold ${(currentScenario.lucroLiquido + currentScenario.cpa - simulatedCPA) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {formatPercent(((currentScenario.lucroLiquido + currentScenario.cpa - simulatedCPA) / currentScenario.receitaBruta) * 100)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CHART */}
                        {scenarios.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Curva de Lucratividade (Margem x CPA)</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={scenarios}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="cpa"
                                                tickFormatter={(val) => `R$${val.toFixed(0)}`}
                                                stroke="#9ca3af"
                                                fontSize={12}
                                            />
                                            <YAxis
                                                tickFormatter={(val) => `${val.toFixed(0)}%`}
                                                stroke="#9ca3af"
                                                fontSize={12}
                                            />
                                            <Tooltip
                                                formatter={(value, name) => [name === 'margem' ? `${value.toFixed(1)}%` : value, name === 'margem' ? 'Margem' : name]}
                                                labelFormatter={(label) => `CPA: ${formatCurrency(label)}`}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="margem"
                                                stroke="#EE4D2D"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#EE4D2D', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* 2.4 REVERSE CALCULATOR */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5 text-indigo-600" />
                                    Calculadora Reversa
                                </h2>
                            </div>
                            <div className="p-6 grid md:grid-cols-3 gap-6 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lucro Desejado (R$)</label>
                                    <input
                                        type="number"
                                        value={reverseCalc.lucro}
                                        onChange={(e) => setReverseCalc({ ...reverseCalc, lucro: e.target.value })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="10.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CPA Planejado (R$)</label>
                                    <input
                                        type="number"
                                        value={reverseCalc.cpa}
                                        onChange={(e) => setReverseCalc({ ...reverseCalc, cpa: e.target.value })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="5.00"
                                    />
                                </div>
                                <button
                                    onClick={handleReverseCalc}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors h-[42px]"
                                >
                                    Calcular Preço
                                </button>
                            </div>
                            {reverseCalc.resultado && (
                                <div className="px-6 pb-6">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                                        <span className="text-indigo-800 font-medium">Preço de Venda Necessário:</span>
                                        <span className="text-2xl font-bold text-indigo-700">
                                            {typeof reverseCalc.resultado === 'number' ? formatCurrency(reverseCalc.resultado) : reverseCalc.resultado}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShopeeCalculator;
