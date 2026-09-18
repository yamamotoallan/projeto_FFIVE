import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import { Plus, Search, Filter, ArrowUp, ArrowDown, History, AlertTriangle, PieChart, ShoppingCart, Printer, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Legend } from 'recharts';
import { useToast } from '../src/contexts/ToastContext';

interface InventoryItem {
    id: number;
    name: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    min_stock: number;
    cost_price: number;
    updated_at?: string;
}

interface InventoryTransaction {
    id: number;
    item_id: number;
    item_name: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    date: string;
    user_name: string;
    description: string;
}

const Inventory: React.FC = () => {
    const { success, error: toastError } = useToast();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'abc' | 'purchases' | 'history'>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    // Form States
    const [formData, setFormData] = useState<any>({});
    const [movementData, setMovementData] = useState({ type: 'in', quantity: 1, description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsData, historyData] = await Promise.all([
                api.get('/inventory/items'),
                api.get('/inventory/transactions')
            ]);
            setItems(itemsData);
            setTransactions(historyData);
        } catch (err) {
            console.error(err);
            toastError('Erro ao carregar dados do estoque');
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleSaveItem = async () => {
        try {
            if (selectedItem) {
                await api.put(`/inventory/items/${selectedItem.id}`, formData);
                success('Item atualizado com sucesso!');
            } else {
                await api.post('/inventory/items', formData);
                success('Item criado com sucesso!');
            }
            setIsItemModalOpen(false);
            fetchData();
        } catch (err) {
            toastError('Erro ao salvar item');
        }
    };

    const handleMovement = async () => {
        if (!selectedItem) return;
        try {
            await api.post('/inventory/movements', {
                item_id: selectedItem.id,
                ...movementData
            });
            success('Movimentação registrada!');
            setIsMovementModalOpen(false);
            fetchData();
        } catch (err) {
            toastError('Erro ao registrar movimentação');
        }
    };

    const openItemModal = (item?: InventoryItem) => {
        setSelectedItem(item || null);
        setFormData(item || { name: '', category: 'Geral', unit: 'un', min_stock: 5, cost_price: 0 });
        setIsItemModalOpen(true);
    };

    const openMovementModal = (item: InventoryItem, type: 'in' | 'out') => {
        setSelectedItem(item);
        setMovementData({ type, quantity: 1, description: '' });
        setIsMovementModalOpen(true);
    };

    // --- Derived Data & Analytics ---

    const totalValue = items.reduce((acc, item) => acc + (item.quantity * (item.cost_price || 0)), 0);
    const lowStockItems = items.filter(item => item.quantity <= item.min_stock);
    const criticalItems = items.filter(item => item.quantity === 0);

    // ABC Analysis
    const getABCData = () => {
        const sortedItems = [...items]
            .map(item => ({ ...item, total_value: item.quantity * (item.cost_price || 0) }))
            .sort((a, b) => b.total_value - a.total_value);

        const totalInvValue = sortedItems.reduce((acc, item) => acc + item.total_value, 0);
        let accumulatedValue = 0;

        const classified = sortedItems.map(item => {
            accumulatedValue += item.total_value;
            const percentage = (accumulatedValue / (totalInvValue || 1)) * 100;
            let classification = 'C';
            if (percentage <= 80) classification = 'A';
            else if (percentage <= 95) classification = 'B';

            return { ...item, classification };
        });

        // Group for Chart
        const groups = {
            A: { name: 'Classe A (80% Valor)', value: classified.filter(i => i.classification === 'A').length, color: '#22c55e' }, // Green
            B: { name: 'Classe B (15% Valor)', value: classified.filter(i => i.classification === 'B').length, color: '#eab308' }, // Yellow
            C: { name: 'Classe C (5% Valor)', value: classified.filter(i => i.classification === 'C').length, color: '#ef4444' }   // Red
        };

        return { classified, groups: Object.values(groups) };
    };

    const abcData = getABCData();

    // --- Sub-Renderers ---

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Summary Cards (Circles Concept) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center aspect-square shadow-lg max-w-[250px] mx-auto animate-scale-in">
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Valor Total</span>
                    <span className="text-2xl font-black text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    </span>
                    <span className="text-gray-400 text-xs mt-2">{items.length} Itens</span>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-6 rounded-full border-4 border-orange-500/20 flex flex-col items-center justify-center aspect-square shadow-lg max-w-[250px] mx-auto animate-scale-in" style={{ animationDelay: '100ms' }}>
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Reposição</span>
                    <span className="text-4xl font-black text-orange-500">{lowStockItems.length}</span>
                    <span className="text-gray-400 text-xs mt-2">Abaixo do Mínimo</span>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-6 rounded-full border-4 border-red-500/20 flex flex-col items-center justify-center aspect-square shadow-lg max-w-[250px] mx-auto animate-scale-in" style={{ animationDelay: '200ms' }}>
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Críticos</span>
                    <span className="text-4xl font-black text-red-500">{criticalItems.length}</span>
                    <span className="text-gray-400 text-xs mt-2">Estoque Zerado</span>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <History size={20} className="text-gray-500" />
                    Movimentações Recentes
                </h3>
                <div className="space-y-3">
                    {transactions.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${t.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {t.type === 'in' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{t.item_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(t.date).toLocaleDateString('pt-BR')} • {t.user_name}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'in' ? '+' : '-'}{t.quantity}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderABC = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribution Chart */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 h-80">
                    <h3 className="font-bold mb-4 text-center">Distribuição de Itens por Classe</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={abcData.groups}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {abcData.groups.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>

                {/* Info Card */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700">
                    <h3 className="font-bold mb-4">Análise ABC</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-green-700 dark:text-green-400">Classe A</span>
                                <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Alta Prioridade</span>
                            </div>
                            <p className="text-sm text-green-800 dark:text-green-300">
                                Itens que representam aprox. 80% do valor do estoque. Requerem controle rigoroso.
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-yellow-700 dark:text-yellow-400">Classe B</span>
                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Média Prioridade</span>
                            </div>
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                Itens intermediários (15% do valor). Controle moderado.
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-red-700 dark:text-red-400">Classe C</span>
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">Baixa Prioridade</span>
                            </div>
                            <p className="text-sm text-red-800 dark:text-red-300">
                                Itens de baixo valor (5%). Controle simplificado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 font-bold">
                    Classificação Detalhada
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-neutral-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Unit.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        {abcData.classified.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                <td className="px-6 py-4">{item.quantity} {item.unit}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.cost_price || 0)}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_value)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.classification === 'A' ? 'bg-green-100 text-green-800' :
                                        item.classification === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        Classe {item.classification}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPurchaseRequests = () => {
        const toBuy = items.filter(i => i.quantity <= i.min_stock).map(i => ({
            ...i,
            suggested: (i.min_stock * 2) - i.quantity // Simple logic: Aim for 2x Min Stock
        }));

        return (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ShoppingCart className="text-primary" />
                            Sugestão de Compras
                        </h3>
                        <p className="text-gray-500 text-sm">Itens abaixo do estoque mínimo</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800">
                            <Printer size={18} />
                            Imprimir
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover">
                            <Download size={18} />
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {toBuy.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                        <p>Estoque abastecido! Nenhum item precisa de reposição no momento.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-neutral-900 border-b">
                            <tr>
                                <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Item</th>
                                <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Estoque Atual</th>
                                <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Mínimo</th>
                                <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Sugestão Compra</th>
                                <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Custo Est.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                            {toBuy.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 text-red-500 font-bold">{item.quantity} {item.unit}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.min_stock} {item.unit}</td>
                                    <td className="px-6 py-4 font-bold text-primary bg-primary/5 rounded-lg w-fit">
                                        {item.suggested} {item.unit}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.suggested * (item.cost_price || 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    const renderItemsList = () => {
        const filteredItems = items.filter(i =>
            i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <>
                <div className="flex gap-4 items-center bg-white dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou categoria..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-5 shadow-sm hover:shadow-md transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-gray-100 dark:bg-neutral-700 text-xs font-bold px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                    {item.category}
                                </span>
                                <button onClick={() => openItemModal(item)} className="text-gray-400 hover:text-primary">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                            </div>

                            <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 h-10 overflow-hidden line-clamp-2">{item.description || 'Sem descrição'}</p>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Quantidade</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-black ${item.quantity <= item.min_stock ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                            {item.quantity}
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">{item.unit}</span>
                                    </div>
                                    {item.quantity <= item.min_stock && (
                                        <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-1">
                                            <AlertTriangle size={12} /> Estoque Baixo
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openMovementModal(item, 'out')}
                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        title="Registrar Saída"
                                    >
                                        <ArrowDown size={18} />
                                    </button>
                                    <button
                                        onClick={() => openMovementModal(item, 'in')}
                                        className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                        title="Registrar Entrada"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // --- Main Render ---

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-gray-50 dark:bg-neutral-900">
            {/* Fixed Header & Tabs */}
            <div className="flex-none w-full bg-gray-50 dark:bg-neutral-900 z-10 shadow-sm border-b dark:border-neutral-800">
                <div className="max-w-7xl mx-auto p-6 pb-0 flex flex-col gap-6">
                    <header className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Gestão de Estoque</h1>
                            <p className="text-gray-500 dark:text-gray-400">Controle inteligente de materiais e insumos</p>
                        </div>
                        <button
                            onClick={() => openItemModal()}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/30"
                        >
                            <Plus size={18} />
                            Novo Item
                        </button>
                    </header>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 pb-2 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                        >
                            Visão Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'items' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                        >
                            Estoque
                        </button>
                        <button
                            onClick={() => setActiveTab('abc')}
                            className={`px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'abc' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                        >
                            Curva ABC
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'purchases' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                        >
                            Solicitação Compras
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                        >
                            Histórico
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 w-full">
                <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'items' && renderItemsList()}
                    {activeTab === 'abc' && renderABC()}
                    {activeTab === 'purchases' && renderPurchaseRequests()}
                    {activeTab === 'history' && (
                        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Data</th>
                                        <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Item</th>
                                        <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Tipo</th>
                                        <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Qtd</th>
                                        <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Usuário</th>
                                        <th className="text-left px-6 py-4 font-bold text-xs uppercase text-gray-500">Obs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                                    {transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.item_name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${t.type === 'in' ? 'bg-green-100 text-green-700' :
                                                    t.type === 'out' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {t.type === 'in' ? 'Entrada' : t.type === 'out' ? 'Saída' : 'Ajuste'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{t.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t.user_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{t.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isItemModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-4">{selectedItem ? 'Editar Item' : 'Novo Item'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome</label>
                                <input className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Categoria</label>
                                    <input className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unidade</label>
                                    <select className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent" value={formData.unit || 'un'} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                        <option value="un">Unidade (un)</option>
                                        <option value="kg">Quilo (kg)</option>
                                        <option value="m">Metro (m)</option>
                                        <option value="m2">M²</option>
                                        <option value="l">Litro (l)</option>
                                        <option value="cx">Caixa (cx)</option>
                                        <option value="pc">Peça (pc)</option>
                                        <option value="ch">Chapa (ch)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                                    <input type="number" className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent" value={formData.min_stock || ''} onChange={e => setFormData({ ...formData, min_stock: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Custo Médio (R$)</label>
                                    <input type="number" className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent" value={formData.cost_price || ''} onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent" rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-100">Cancelar</button>
                            <button onClick={handleSaveItem} className="px-4 py-2 rounded-lg bg-primary text-white font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {isMovementModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            {movementData.type === 'in' ? <ArrowUp className="text-green-500" /> : <ArrowDown className="text-red-500" />}
                            Registrar {movementData.type === 'in' ? 'Entrada' : 'Saída'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Item: <strong>{selectedItem?.name}</strong></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantidade ({selectedItem?.unit})</label>
                                <input
                                    type="number"
                                    className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent text-xl font-bold"
                                    value={movementData.quantity}
                                    onChange={e => setMovementData({ ...movementData, quantity: parseFloat(e.target.value) })}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Observação</label>
                                <input
                                    className="w-full p-2 rounded-lg border dark:border-neutral-700 bg-transparent"
                                    placeholder="Ex: Compra NF 123 ou Uso no Projeto X"
                                    value={movementData.description}
                                    onChange={e => setMovementData({ ...movementData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setIsMovementModalOpen(false)} className="px-4 py-2 rounded-lg hover:bg-gray-100">Cancelar</button>
                            <button onClick={handleMovement} className={`px-4 py-2 rounded-lg text-white font-bold ${movementData.type === 'in' ? 'bg-green-600' : 'bg-red-600'}`}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple icon for empty state
const CheckCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default Inventory;
