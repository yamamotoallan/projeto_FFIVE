import React, { useState, useEffect } from 'react';
import { api } from '../../src/services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Types
interface Stage {
    id: number;
    name: string;
    order_position: number;
    color: string;
    icon: string;
}

interface ChecklistItem {
    id: number;
    stage_id: number;
    item_label: string;
    order_position: number;
    is_required: boolean;
}

const KanbanChecklistSettings: React.FC = () => {
    const [stages, setStages] = useState<Stage[]>([]);
    const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [isStageModalOpen, setIsStageModalOpen] = useState(false);
    const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
    const [editingStage, setEditingStage] = useState<Stage | null>(null);
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

    // Temporary inputs
    const [stageName, setStageName] = useState('');
    const [stageColor, setStageColor] = useState('blue');
    const [stageIcon, setStageIcon] = useState('circle');

    const [itemLabel, setItemLabel] = useState('');
    const [itemRequired, setItemRequired] = useState(false);

    useEffect(() => {
        fetchStages();
    }, []);

    useEffect(() => {
        if (selectedStage) {
            fetchChecklist(selectedStage.id);
        } else {
            setChecklistItems([]);
        }
    }, [selectedStage]);

    const fetchStages = async () => {
        try {
            const data = await api.kanban.stages.list();
            setStages(data);
            if (data.length > 0 && !selectedStage) {
                setSelectedStage(data[0]);
            }
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchChecklist = async (stageId: number) => {
        try {
            const data = await api.kanban.checklist.list(stageId);
            setChecklistItems(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveStage = async () => {
        try {
            const payload = {
                name: stageName,
                color: stageColor,
                icon: stageIcon,
                order_position: editingStage ? editingStage.order_position : stages.length + 1
            };

            if (editingStage) {
                await api.kanban.stages.update(editingStage.id, payload);
            } else {
                await api.kanban.stages.create(payload);
            }
            await fetchStages();
            closeStageModal();
        } catch (error) {
            alert('Erro ao salvar etapa');
        }
    };

    const handleDeleteStage = async (id: number) => {
        if (!confirm('Tem certeza? Isso pode afetar projetos existentes.')) return;
        try {
            await api.kanban.stages.delete(id);
            await fetchStages();
            if (selectedStage?.id === id) setSelectedStage(null);
        } catch (error) {
            alert('Erro ao deletar etapa');
        }
    };

    const handleSaveItem = async () => {
        if (!selectedStage) return;
        try {
            const payload = {
                stage_id: selectedStage.id,
                item_label: itemLabel,
                is_required: itemRequired,
                order_position: editingItem ? editingItem.order_position : checklistItems.length + 1
            };

            if (editingItem) {
                await api.kanban.checklist.update(editingItem.id, payload);
            } else {
                await api.kanban.checklist.create(payload);
            }
            await fetchChecklist(selectedStage.id);
            closeChecklistModal();
        } catch (error) {
            alert('Erro ao salvar item');
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await api.kanban.checklist.delete(id);
            if (selectedStage) fetchChecklist(selectedStage.id);
        } catch (error) {
            alert('Erro ao deletar item');
        }
    };

    const openStageModal = (stage?: Stage) => {
        if (stage) {
            setEditingStage(stage);
            setStageName(stage.name);
            setStageColor(stage.color);
            setStageIcon(stage.icon);
        } else {
            setEditingStage(null);
            setStageName('');
            setStageColor('blue');
            setStageIcon('circle');
        }
        setIsStageModalOpen(true);
    };

    const openChecklistModal = (item?: ChecklistItem) => {
        if (item) {
            setEditingItem(item);
            setItemLabel(item.item_label);
            setItemRequired(item.is_required);
        } else {
            setEditingItem(null);
            setItemLabel('');
            setItemRequired(false);
        }
        setIsChecklistModalOpen(true);
    };

    const closeStageModal = () => setIsStageModalOpen(false);
    const closeChecklistModal = () => setIsChecklistModalOpen(false);

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark p-8 overflow-y-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Checklist Kanban</h1>
                    <p className="text-text-muted">Configure as etapas do fluxo e seus checklists padrão.</p>
                </div>
                <button
                    onClick={() => openStageModal()}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span> Nova Etapa
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stage List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="text-xl font-bold mb-4">Etapas do Fluxo</h2>
                    {stages.map(stage => (
                        <div
                            key={stage.id}
                            onClick={() => setSelectedStage(stage)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group
                                ${selectedStage?.id === stage.id
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md transform scale-[1.02]'
                                    : 'border-[#e7dbcf] dark:border-neutral-800 bg-surface-light dark:bg-surface-dark hover:border-primary/50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-3 h-3 rounded-full bg-${stage.color}-500`}></span>
                                <span className="font-bold">{stage.name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); openStageModal(stage); }} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"><span className="material-symbols-outlined text-sm">edit</span></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage.id); }} className="p-1 hover:bg-red-100 text-red-500 rounded"><span className="material-symbols-outlined text-sm">delete</span></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checklist Editor */}
                <div className="lg:col-span-2">
                    {selectedStage ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full bg-${selectedStage.color}-500`}></span>
                                    {selectedStage.name}
                                    <span className="text-text-muted text-sm font-normal ml-2">(Checklist Padrão)</span>
                                </h2>
                                <button
                                    onClick={() => openChecklistModal()}
                                    className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-lg">add_task</span> Adicionar Item
                                </button>
                            </div>

                            {checklistItems.length === 0 ? (
                                <div className="text-center py-10 text-text-muted border border-dashed border-[#e7dbcf] dark:border-neutral-800 rounded-lg">
                                    Nenhum item de checklist configurado para esta etapa.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {checklistItems.map((item, index) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-[#e7dbcf] dark:border-neutral-800 group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-text-muted font-mono text-xs w-6">{index + 1}.</span>
                                                <span className="font-medium">{item.item_label}</span>
                                                {item.is_required && (
                                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Obrigatório</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openChecklistModal(item)} className="text-text-muted hover:text-primary"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="text-text-muted hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                            <span className="material-symbols-outlined text-6xl mb-2">rule</span>
                            <p>Selecione uma etapa para configurar o checklist</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stage Modal */}
            {isStageModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{editingStage ? 'Editar Etapa' : 'Nova Etapa'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome da Etapa</label>
                                <input
                                    type="text"
                                    value={stageName}
                                    onChange={e => setStageName(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark"
                                    placeholder="Ex: Montagem"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cor</label>
                                <select
                                    value={stageColor}
                                    onChange={e => setStageColor(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark"
                                >
                                    <option value="blue">Azul</option>
                                    <option value="green">Verde</option>
                                    <option value="red">Vermelho</option>
                                    <option value="yellow">Amarelo</option>
                                    <option value="purple">Roxo</option>
                                    <option value="orange">Laranja</option>
                                    <option value="gray">Cinza</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={closeStageModal} className="px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">Cancelar</button>
                            <button onClick={handleSaveStage} className="px-4 py-2 rounded-lg bg-primary text-white font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Checklist Item Modal */}
            {isChecklistModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{editingItem ? 'Editar Item' : 'Novo Item'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição do Item</label>
                                <input
                                    type="text"
                                    value={itemLabel}
                                    onChange={e => setItemLabel(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-[#e7dbcf] dark:border-neutral-700 bg-background-light dark:bg-background-dark"
                                    placeholder="Ex: Verificar parafusos"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="req"
                                    checked={itemRequired}
                                    onChange={e => setItemRequired(e.target.checked)}
                                    className="rounded border-[#e7dbcf] dark:border-neutral-700"
                                />
                                <label htmlFor="req" className="text-sm font-medium">Item Obrigatório?</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={closeChecklistModal} className="px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">Cancelar</button>
                            <button onClick={handleSaveItem} className="px-4 py-2 rounded-lg bg-primary text-white font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanChecklistSettings;
