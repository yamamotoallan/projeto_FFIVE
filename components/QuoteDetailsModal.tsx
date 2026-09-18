import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import { Quote, QuoteFile } from '../types';

interface QuoteDetailsModalProps {
    quote: Quote | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: (newStatus: Quote['status']) => void;
}

const QuoteDetailsModal: React.FC<QuoteDetailsModalProps> = ({ quote, isOpen, onClose, onStatusChange }) => {
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [activeAction, setActiveAction] = useState<'email' | null>(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [files, setFiles] = useState<QuoteFile[]>([]);
    const [selectedFilesForEmail, setSelectedFilesForEmail] = useState<string[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);

    useEffect(() => {
        if (isOpen && quote) {
            // Reset states on open
            setActiveAction(null);

            // Fetch files from API
            const fetchFiles = async () => {
                setIsLoadingFiles(true);
                try {
                    const filesData = await api.quotes.listFiles(Number(quote.id));

                    if (Array.isArray(filesData)) {
                        // Transform backend data to QuoteFile format
                        const transformedFiles: QuoteFile[] = filesData.map((f: any) => ({
                            name: f.original_name || f.filename,
                            size: f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
                            type: (f.mimetype?.includes('pdf') ? 'pdf' : 'image') as QuoteFile['type'],
                            id: f.id
                        }));
                        setFiles(transformedFiles);
                    } else {
                        console.error('Failed to fetch files:', filesData);
                        setFiles([]);
                    }
                } catch (error) {
                    console.error('Error fetching files:', error);
                    setFiles([]);
                } finally {
                    setIsLoadingFiles(false);
                }
            };

            fetchFiles();
        }
    }, [isOpen, quote]);

    useEffect(() => {
        // Select all files by default when email action is opened
        if (activeAction === 'email') {
            setSelectedFilesForEmail(files.map(f => f.name));
        }
    }, [activeAction, files]);

    if (!isOpen || !quote) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleEdit = () => {
        alert(`Redirecionando para edição do orçamento #${quote.id}...`);
    };

    const toggleEmailAction = () => {
        setActiveAction(activeAction === 'email' ? null : 'email');
    };

    const handleSendEmail = () => {
        if (selectedFilesForEmail.length === 0) {
            alert("Selecione pelo menos um arquivo para enviar.");
            return;
        }
        setIsEmailSending(true);
        // Simulation
        setTimeout(() => {
            setIsEmailSending(false);
            setActiveAction(null);
            alert(`Proposta #${quote.id} enviada com ${selectedFilesForEmail.length} anexo(s)!`);
        }, 1500);
    };

    const handleToggleFileSelection = (fileName: string) => {
        if (selectedFilesForEmail.includes(fileName)) {
            setSelectedFilesForEmail(selectedFilesForEmail.filter(f => f !== fileName));
        } else {
            setSelectedFilesForEmail([...selectedFilesForEmail, fileName]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && quote) {
            const filesArray = Array.from(e.target.files);

            try {
                // Show loading state
                alert("Fazendo upload...");

                // Call API to upload files using service wrapper if possible or direct fetch as before
                // Using API service wrapper is better but let's stick to working fetch for compatibility
                // with existing backend endpoint
                const formData = new FormData();
                filesArray.forEach(file => formData.append('files', file));

                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quotes/${quote.id}/files`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Erro ao fazer upload');
                }

                const data = await response.json();

                // Add uploaded files to state
                const newFiles = data.files.map((f: any) => ({
                    name: f.original_name || f.filename,
                    size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
                    type: f.mimetype?.includes('pdf') ? 'pdf' : 'image',
                    id: f.id
                }));

                setFiles([...files, ...newFiles]);
                alert("Arquivo(s) enviado(s) com sucesso!");

                // Reset input
                e.target.value = '';
            } catch (error) {
                console.error('Erro no upload:', error);
                alert("Erro ao enviar arquivo. Tente novamente.");
            }
        }
    };

    const handleFileAction = async (fileId: number | string, fileName: string, action: 'download' | 'view') => {
        if (!quote) return;

        try {
            const token = localStorage.getItem('token');
            // Endpoint retorna { url: string } (Signed URL)
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/quotes/${quote.id}/files/${fileId}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Erro ao obter arquivo');
            }

            const data = await response.json();

            if (!data.url) throw new Error('URL de download não encontrada');

            if (action === 'view') {
                const newWindow = window.open(data.url, '_blank');
                if (!newWindow) alert('Pop-up bloqueado. Permita pop-ups para visualizar arquivos.');
            } else {
                // Fetch the file content to force download (bypass browser inline display)
                const fileResponse = await fetch(data.url);
                const blob = await fileResponse.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                // Revoke URL after a delay to ensure download starts
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
            }
        } catch (error) {
            console.error('Erro no arquivo:', error);
            alert('Erro ao baixar/visualizar arquivo. Verifique se o arquivo ainda existe.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-surface-light dark:bg-surface-dark w-full max-w-3xl rounded-2xl shadow-2xl border border-[#e7dbcf] dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-[#e7dbcf] dark:border-neutral-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black">Orçamento #{quote.id}</h2>
                                {quote.projectId && (
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit mt-1">
                                        Projeto #{quote.projectId} Linked
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors
                        ${quote.status === 'Em Análise' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                            quote.status === 'Aprovado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                quote.status === 'Recusado' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500' :
                                                    quote.status === 'Enviado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                        }`}>
                                    {quote.status}
                                    <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                                </button>

                                {isStatusDropdownOpen && (
                                    <div
                                        className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-[#e7dbcf] dark:border-neutral-700 z-[70] overflow-hidden animate-fade-in"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {['Pendente', 'Em Análise', 'Enviado', 'Aprovado', 'Recusado', 'Rascunho'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    onStatusChange && onStatusChange(status as Quote['status']);
                                                    setIsStatusDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center gap-2 hover:text-primary transition-colors"
                                            >
                                                <span className={`w-2 h-2 rounded-full 
                                    ${status === 'Aprovado' ? 'bg-green-500' :
                                                        status === 'Recusado' ? 'bg-red-500' :
                                                            status === 'Em Análise' ? 'bg-yellow-500' :
                                                                status === 'Enviado' ? 'bg-blue-500' : 'bg-gray-400'
                                                    }`}></span>
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-text-muted mt-1">Criado em {quote.date}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto bg-background-light dark:bg-background-dark/50">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="p-4 bg-white dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm">
                            <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Dados do Cliente</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                    {quote.client.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{quote.client}</p>
                                    <p className="text-sm text-text-muted">Cliente Recorrente</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                    {(quote as any).phone || 'Não informado'}
                                </div>
                                <div className="flex items-center gap-2 text-text-muted">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                    {(quote as any).email || 'Não informado'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-surface-dark rounded-xl border border-[#e7dbcf] dark:border-neutral-800 shadow-sm">
                            <h3 className="text-xs font-bold text-text-muted uppercase mb-3">Resumo do Projeto</h3>
                            <p className="font-bold text-lg mb-1">{quote.project}</p>
                            <p className="text-sm text-text-muted mb-4">{(quote as any).notes || (quote as any).service_type || 'Móveis planejados sob medida'}.</p>
                            <div className="flex justify-between items-center border-t border-[#e7dbcf] dark:border-neutral-700 pt-3">
                                <span className="font-bold text-text-muted">Valor Total</span>
                                <span className="font-black text-xl text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.value)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-text-main mb-3">Arquivos do Projeto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {files.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-surface-dark border border-[#e7dbcf] dark:border-neutral-800 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="material-symbols-outlined text-red-500 text-2xl group-hover:scale-110 transition-transform">{file.type === 'image' ? 'image' : 'picture_as_pdf'}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{file.name}</p>
                                            <p className="text-xs text-text-muted">{file.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                file.id && handleFileAction(file.id, file.name, 'view');
                                            }}
                                            className="text-text-muted hover:text-primary p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                            title="Visualizar"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                file.id && handleFileAction(file.id, file.name, 'download');
                                            }}
                                            className="text-text-muted hover:text-primary p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
                                            title="Baixar arquivo"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <label className="flex items-center justify-center p-3 border-2 border-dashed border-[#e7dbcf] dark:border-neutral-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors gap-2 text-text-muted hover:text-primary">
                                <span className="material-symbols-outlined">cloud_upload</span>
                                <span className="text-sm font-bold">Adicionar Arquivo</span>
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>

                    {/* Email Section (Conditional) */}
                    {activeAction === 'email' && (
                        <div className="mb-6 p-4 bg-white dark:bg-surface-dark rounded-xl border border-primary/20 shadow-lg animate-fade-in">
                            <h5 className="font-bold text-sm mb-3">Enviar Proposta por Email</h5>
                            <div className="mb-4">
                                <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Selecionar Anexos</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {files.map((file, idx) => (
                                        <label key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedFilesForEmail.includes(file.name)}
                                                onChange={() => handleToggleFileSelection(file.name)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm flex-1">{file.name}</span>
                                            <span className="text-xs text-text-muted">{file.size}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setActiveAction(null)} className="px-4 py-2 text-sm font-bold text-text-muted hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg">Cancelar</button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={isEmailSending}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary-hover flex items-center gap-2"
                                >
                                    {isEmailSending ? 'Enviando...' : 'Confirmar Envio'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-[#e7dbcf] dark:border-neutral-700">
                        <button
                            onClick={toggleEmailAction}
                            className={`px-4 py-2 border rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors ${activeAction === 'email' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-neutral-800 border-[#e7dbcf] dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-text-main'} `}
                        >
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                            Enviar por Email
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-white dark:bg-neutral-800 border border-[#e7dbcf] dark:border-neutral-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">print</span> Imprimir
                            </button>
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary-hover flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span> Editar Proposta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetailsModal;