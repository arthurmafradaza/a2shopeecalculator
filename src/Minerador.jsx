import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pickaxe, Plus, Trash2, ExternalLink, Search, Sparkles, RefreshCw, Image as ImageIcon, X } from 'lucide-react';

const Minerador = () => {
    const navigate = useNavigate();

    // State for form inputs
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [reason, setReason] = useState('');
    const [image, setImage] = useState(null); // Base64 string for upload
    const [selectedImage, setSelectedImage] = useState(null); // For modal viewing

    // State for products list
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // API URLs
    const SAVE_API_URL = '/api/save-mined';
    const GET_API_URL = '/api/get-mined?type=shopee';

    // Load from API on mount
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(GET_API_URL);
            const result = await response.json();

            if (result.success && result.products) {
                setProducts(result.products);
            } else {
                // Fallback to localStorage if API fails or returns empty
                const saved = localStorage.getItem('minedProducts');
                if (saved) {
                    setProducts(JSON.parse(saved));
                }
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            // Fallback to localStorage
            const saved = localStorage.getItem('minedProducts');
            if (saved) {
                setProducts(JSON.parse(saved));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('A imagem deve ter no máximo 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddProduct = async () => {
        if (!name.trim() || !link.trim()) {
            alert('Por favor, preencha pelo menos o Nome e o Link.');
            return;
        }

        setIsSaving(true);

        const newProduct = {
            id: Date.now(),
            name,
            link,
            reason,
            image, // Send image to API
            type: 'shopee', // Important flag for backend
            date: new Date().toLocaleDateString('pt-BR')
        };

        // Optimistic update (update UI immediately)
        const updatedProducts = [newProduct, ...products];
        setProducts(updatedProducts);
        localStorage.setItem('minedProducts', JSON.stringify(updatedProducts));

        // Reset form
        setName('');
        setLink('');


        setReason('');
        setImage(null);

        try {
            const response = await fetch(SAVE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct),
            });

            const result = await response.json();

            if (result.success) {
                // Success!
            } else {
                console.error('Erro ao salvar na API:', result.error);
                alert('Produto salvo localmente, mas houve um erro ao salvar na nuvem.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Produto salvo localmente. Erro de conexão com a nuvem.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja remover este item? (Isso removerá apenas da visualização local por enquanto)')) {
            const updated = products.filter(p => p.id !== id);
            setProducts(updated);
            localStorage.setItem('minedProducts', JSON.stringify(updated));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/minerador')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="Voltar"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Pickaxe className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                                A2 Digital Miner
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={loadProducts}
                        disabled={isLoading}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Atualizar Lista"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - INPUT FORM */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-blue-600" />
                                    Novo Produto Minerado
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Ex: Fone Bluetooth Pro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link do Anúncio</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="https://shopee.com.br/..."
                                        />
                                        <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Mineração</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={4}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                        placeholder="Por que este produto é bom? (Ex: Alta demanda, pouca concorrência...)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Produto (Opcional)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {image ? (
                                            <div className="relative">
                                                <img src={image} alt="Preview" className="h-32 mx-auto object-contain rounded-md" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImage(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-500">
                                                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                                                <span className="text-sm">Clique ou arraste uma imagem</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddProduct}
                                    disabled={isSaving}
                                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    {isSaving ? 'Salvando...' : 'Adicionar à Lista'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - LIST */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Produtos Encontrados ({products.length})
                            </h2>
                        </div>

                        {isLoading && products.length === 0 ? (
                            <div className="text-center py-12">
                                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                <p className="text-gray-500">Carregando produtos...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Sua lista está vazia</h3>
                                <p className="text-gray-500 mt-1">Comece a minerar e adicione seus achados aqui!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {products.map((product) => (
                                    <div key={product.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1 pr-8" title={product.name}>
                                                {product.name}
                                            </h3>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors absolute top-5 right-5"
                                                title="Remover"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm text-gray-600 min-h-[80px]">
                                            {product.reason ? (
                                                <p className="line-clamp-3">{product.reason}</p>
                                            ) : (
                                                <span className="italic text-gray-400">Sem motivo especificado.</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                            <span className="text-xs text-gray-400 font-medium">{product.date}</span>
                                            <div className="flex gap-3">
                                                {product.image && (
                                                    <button
                                                        onClick={() => setSelectedImage(product.image)}
                                                        className="text-sm font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 hover:underline"
                                                    >
                                                        <ImageIcon className="w-3 h-3" /> Ver Foto
                                                    </button>
                                                )}
                                                <a
                                                    href={product.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                                                >
                                                    Ver Anúncio <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] shadow-2xl">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="flex items-center justify-center bg-gray-100 h-full min-h-[300px]">
                            <img
                                src={selectedImage}
                                alt="Produto Minerado"
                                className="max-w-full max-h-[85vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Minerador;
