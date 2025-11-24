import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clapperboard, Plus, Trash2, ExternalLink, Search, Sparkles, RefreshCw, Image as ImageIcon, X, PlayCircle } from 'lucide-react';

const Criativos = () => {
    const navigate = useNavigate();

    // State for form inputs
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [reason, setReason] = useState('');
    const [file, setFile] = useState(null); // Base64 string (Image or Video)
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const [selectedMedia, setSelectedMedia] = useState(null); // For modal viewing

    // State for products list
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // API URLs
    const SAVE_API_URL = '/api/save-mined';
    const GET_API_URL = '/api/get-mined?type=criativos';

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
                const saved = localStorage.getItem('minedCriativos');
                if (saved) {
                    setProducts(JSON.parse(saved));
                }
            }
        } catch (error) {
            console.error('Erro ao carregar criativos:', error);
            const saved = localStorage.getItem('minedCriativos');
            if (saved) {
                setProducts(JSON.parse(saved));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Limit check (4.5MB for Vercel Serverless)
            if (selectedFile.size > 4.5 * 1024 * 1024) {
                alert('O arquivo deve ter no máximo 4.5MB (Limite do servidor). Para vídeos maiores, salve apenas o link.');
                return;
            }

            const type = selectedFile.type.startsWith('video/') ? 'video' : 'image';
            setFileType(type);

            const reader = new FileReader();
            reader.onloadend = () => {
                setFile(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleAddProduct = async () => {
        if (!name.trim()) {
            alert('Por favor, preencha pelo menos o Nome.');
            return;
        }

        setIsSaving(true);

        const newProduct = {
            id: Date.now(),
            name,
            link,
            reason,
            image: file, // Send file (image or video base64) to API
            type: 'criativos', // Important flag for backend
            date: new Date().toLocaleDateString('pt-BR')
        };

        // Optimistic update
        const updatedProducts = [newProduct, ...products];
        setProducts(updatedProducts);
        localStorage.setItem('minedCriativos', JSON.stringify(updatedProducts));

        // Reset form
        setName('');
        setLink('');
        setReason('');
        setFile(null);
        setFileType(null);

        try {
            const response = await fetch(SAVE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct),
            });

            const result = await response.json();

            if (!result.success) {
                console.error('Erro ao salvar na API:', result.error);
                alert('Salvo localmente, mas erro na nuvem: ' + result.error);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            alert('Salvo localmente. Erro de conexão.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja remover este item?')) {
            const updated = products.filter(p => p.id !== id);
            setProducts(updated);
            localStorage.setItem('minedCriativos', JSON.stringify(updated));
        }
    };

    // Helper to detect if stored file is video based on extension or content
    const isVideo = (url) => {
        if (!url) return false;
        return url.includes('.mp4') || url.includes('video');
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
                            <div className="bg-purple-600 p-2 rounded-lg">
                                <Clapperboard className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                Banco de Criativos
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
                                    <Plus className="w-5 h-5 text-purple-600" />
                                    Novo Criativo
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Título</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="Ex: Vídeo Viral TikTok"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link de Referência (Opcional)</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all"
                                            placeholder="https://..."
                                        />
                                        <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Anotações</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={3}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                                        placeholder="O que chamou atenção nesse criativo?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo (Vídeo ou Imagem)</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {file ? (
                                            <div className="relative">
                                                {fileType === 'video' ? (
                                                    <div className="flex flex-col items-center justify-center h-32 bg-gray-100 rounded-md">
                                                        <PlayCircle className="w-10 h-10 text-purple-500 mb-2" />
                                                        <span className="text-xs text-gray-500">Vídeo Selecionado</span>
                                                    </div>
                                                ) : (
                                                    <img src={file} alt="Preview" className="h-32 mx-auto object-contain rounded-md" />
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFile(null);
                                                        setFileType(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-500">
                                                <Clapperboard className="w-8 h-8 mb-2 text-gray-400" />
                                                <span className="text-sm">Clique para upload (Max 4.5MB)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddProduct}
                                    disabled={isSaving}
                                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95"
                                >
                                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    {isSaving ? 'Salvando...' : 'Salvar Criativo'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - LIST */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Biblioteca ({products.length})
                            </h2>
                        </div>

                        {isLoading && products.length === 0 ? (
                            <div className="text-center py-12">
                                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                                <p className="text-gray-500">Carregando biblioteca...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clapperboard className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Nenhum criativo salvo</h3>
                                <p className="text-gray-500 mt-1">Comece a salvar suas referências!</p>
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

                                        <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm text-gray-600 min-h-[60px]">
                                            {product.reason ? (
                                                <p className="line-clamp-2">{product.reason}</p>
                                            ) : (
                                                <span className="italic text-gray-400">Sem anotações.</span>
                                            )}
                                        </div>

                                        {/* Media Preview Thumbnail */}
                                        {product.image && (
                                            <div
                                                className="mb-4 h-40 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer group/media"
                                                onClick={() => setSelectedMedia(product)}
                                            >
                                                {isVideo(product.image) ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-black/5">
                                                        <PlayCircle className="w-12 h-12 text-purple-600 opacity-80 group-hover/media:scale-110 transition-transform" />
                                                    </div>
                                                ) : (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors flex items-center justify-center">
                                                    <span className="opacity-0 group-hover/media:opacity-100 bg-black/70 text-white text-xs px-2 py-1 rounded-full transition-opacity">
                                                        Clique para ver
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                            <span className="text-xs text-gray-400 font-medium">{product.date}</span>
                                            {product.link && (
                                                <a
                                                    href={product.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline"
                                                >
                                                    Link Ref <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>

            {/* Media Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-black rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] shadow-2xl flex flex-col">
                        <div className="p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-10">
                            <h3 className="font-bold text-lg">{selectedMedia.name}</h3>
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center bg-black h-full min-h-[300px]">
                            {isVideo(selectedMedia.image) ? (
                                <video
                                    src={selectedMedia.image}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[85vh]"
                                />
                            ) : (
                                <img
                                    src={selectedMedia.image}
                                    alt="Criativo"
                                    className="max-w-full max-h-[85vh] object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Criativos;
