import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Project, ProjectHistory } from '../types';
import NewProjectModal from '../components/NewProjectModal';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import ReasonModal from '../components/ReasonModal';
import { STAGE_CHECKLISTS } from '../src/constants';
import { api } from '../src/services/api';




// COLUMNS replaced by dynamic fetching
// const COLUMNS = ...


// StrictMode Droppable Fix
export const StrictModeDroppable = ({ children, ...props }: any) => {
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);
    if (!enabled) {
        return null;
    }
    return <Droppable {...props}>{children}</Droppable>;
};

// Safe color map for Tailwind JIT
const SAFE_COLORS: Record<string, string> = {
    blue: 'border-t-blue-500',
    green: 'border-t-green-500',
    red: 'border-t-red-500',
    yellow: 'border-t-yellow-500',
    purple: 'border-t-purple-500',
    orange: 'border-t-orange-500',
    gray: 'border-t-gray-500'
};

const ProjectsKanban: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [columns, setColumns] = useState<any[]>([]); // Dynamic Columns
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);


    // Transition Modal State
    const [transitionModal, setTransitionModal] = useState<{
        isOpen: boolean;
        type: 'incomplete_checklist' | 'regression' | null;
        project: Project | null;
        fromStatus: string;
        toStatus: string;
        missingItems: string[];
    }>({
        isOpen: false,
        type: null,
        project: null,
        fromStatus: '',
        toStatus: '',
        missingItems: []
    });

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const [projectsData, stagesData] = await Promise.all([

                api.projects.list(),
                api.kanban.stages.list()
            ]);

            setProjects(projectsData);

            // Map stages to columns format
            const dynamicColumns = stagesData.map((stage: any) => ({
                id: stage.name, // Using name as ID for compatibility with existing string-based status
                title: stage.name,
                color: stage.color || 'gray',
                dbId: stage.id // Keep DB ID for future reference
            }));

            setColumns(dynamicColumns);
        } catch (error) {
            console.error("Erro ao buscar dados do kanban:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);


    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const project = projects.find(p => p.id === draggableId);
        if (!project) return;

        const newStatus = destination.droppableId as Project['status'];
        const oldStatus = source.droppableId;

        // Determine Direction
        const columnIds = columns.map(c => c.id);
        const oldIndex = columnIds.indexOf(oldStatus);
        const newIndex = columnIds.indexOf(newStatus);
        const isRegression = newIndex < oldIndex;

        // Validation Logic
        let missingItems: string[] = [];
        let type: 'incomplete_checklist' | 'regression' | null = null;

        if (isRegression) {
            type = 'regression';
        } else {
            // Forward movement: Check checklist
            try {
                // Fetch current checklist state
                const checklist = await api.projects.getChecklist(project.id);

                // Fetch required template items for the OLD status (stage completion check)
                // Find the stage object to get its ID
                const currentStage = columns.find(c => c.id === oldStatus);
                let requiredLabels: string[] = [];

                if (currentStage) {
                    // Fetch template items for this stage
                    // Optimization: Could cache these templates in state to avoid request on drop
                    const templateItems = await api.kanban.checklist.list(currentStage.dbId);
                    requiredLabels = templateItems
                        .filter((t: any) => t.is_required)
                        .map((t: any) => t.item_label);
                } else {
                    // Fallback to legacy constant or empty if migration not matching
                    const legacyRequired = STAGE_CHECKLISTS[oldStatus] || [];
                    requiredLabels = legacyRequired;
                }

                // Verify compliance
                requiredLabels.forEach(label => {
                    const item = checklist.find((i: any) => i.item_label === label && i.stage === oldStatus);
                    if (!item || !item.completed) {
                        missingItems.push(label);
                    }
                });

                if (missingItems.length > 0) {
                    type = 'incomplete_checklist';
                }
            } catch (error) {
                console.error("Error validating checklist:", error);
                // Fail safe: allow move or block? 
                // Currently continuing, but logging error.
            }
        }

        if (type) {
            setTransitionModal({
                isOpen: true,
                type,
                project,
                fromStatus: oldStatus,
                toStatus: newStatus,
                missingItems
            });
            return;
        }

        executeStatusUpdate(project, newStatus, oldStatus);
    };

    const executeStatusUpdate = async (project: Project, newStatus: string, oldStatus: string, reason?: string, missingItems?: string[]) => {
        // Construct History Event
        const historyEvent: ProjectHistory = {
            id: `evt-${Date.now()}`,
            project_id: project.id,
            type: reason ? (missingItems && missingItems.length > 0 ? 'stage_change' : 'regression') : 'stage_change',
            from: oldStatus,
            to: newStatus,
            timestamp: new Date().toISOString(),
            user_name: 'Usuário Local', // TODO: Get from auth context
            reason: reason,
            checklist_snapshot: missingItems ? missingItems.map(label => ({ label, completed: false, reason })) : []
        };

        try {
            // Optimistic Update
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: newStatus as any } : p));

            // Pass history event to updateStatus
            await api.projects.updateStatus(project.id, newStatus, historyEvent);
        } catch (error) {
            console.error("Erro ao atualizar status do projeto:", error);
            fetchProjects();
        }
    };

    const handleConfirmTransition = (reason: string) => {
        if (transitionModal.project) {
            executeStatusUpdate(
                transitionModal.project,
                transitionModal.toStatus,
                transitionModal.fromStatus,
                reason,
                transitionModal.type === 'incomplete_checklist' ? transitionModal.missingItems : undefined
            );
        }
        setTransitionModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleCreateProject = (projectData: any) => {
        const newProject: Project = {
            id: `PROJ-${Math.floor(Math.random() * 10000)}`,
            ...projectData
        };
        setProjects([...projects, newProject]);
    };

    const getProjectsByStatus = (status: string) => {
        return projects.filter(p => p.status === status && (
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.client.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onSave={fetchProjects}
            />

            <ProjectDetailsModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
            />

            <ReasonModal
                isOpen={transitionModal.isOpen}
                type={transitionModal.type}
                missingItems={transitionModal.missingItems}
                fromStage={transitionModal.fromStatus}
                toStage={transitionModal.toStatus}
                onConfirm={handleConfirmTransition}
                onClose={() => setTransitionModal(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Header */}
            <header className="shrink-0 px-8 py-5 border-b border-border-light dark:border-border-dark bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black leading-tight">Gestão de Projetos</h1>
                    <p className="text-text-muted text-sm mt-1">Acompanhe o fluxo de produção desde o refinamento até o pós-venda.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Buscar projeto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm focus:ring-primary focus:border-primary w-64"
                        />
                    </div>
                    <button
                        onClick={() => setIsNewProjectModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-primary-hover"
                    >
                        <span className="material-symbols-outlined">add</span> Novo Projeto
                    </button>
                </div>
            </header>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full gap-6 min-w-max pb-4">
                        {columns.map(col => (
                            <div key={col.id} className="w-80 flex flex-col h-full rounded-xl bg-[#f4f2f0] dark:bg-[#161616] border border-border-light dark:border-border-dark">
                                {/* Column Header */}
                                <div className={`p-4 border-b border-border-light dark:border-border-dark flex justify-between items-center border-t-4 ${SAFE_COLORS[col.color] || 'border-t-gray-500'} rounded-t-xl bg-surface-light dark:bg-surface-dark`}>
                                    <h3 className="font-bold text-sm uppercase tracking-wide">{col.title}</h3>
                                    <span className="bg-gray-200 dark:bg-neutral-800 text-xs font-bold px-2 py-0.5 rounded-full text-text-muted">
                                        {getProjectsByStatus(col.id).length}
                                    </span>
                                </div>

                                {/* Droppable Area */}
                                <StrictModeDroppable droppableId={col.id}>
                                    {(provided: any, snapshot: any) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                                        >
                                            {getProjectsByStatus(col.id).map((project, index) => (
                                                <Draggable key={project.id} draggableId={project.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedProject(project)}
                                                            className={`bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-border-light dark:border-neutral-700 group hover:shadow-md transition-all cursor-pointer ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-primary z-50' : ''}`}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[10px] font-bold text-text-muted bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{project.id}</span>
                                                                {project.priority === 'Alta' && <span className="w-2 h-2 rounded-full bg-red-500" title="Prioridade Alta"></span>}
                                                            </div>
                                                            <h4 className="font-bold text-sm mb-1 leading-snug text-gray-900 dark:text-white">{project.title}</h4>
                                                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{project.client}</p>

                                                            <div className="flex items-center justify-between text-xs text-text-muted border-t border-border-light dark:border-border-dark pt-3 mt-2">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                                                    {new Date(project.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                                </div>
                                                                <div className="font-bold text-gray-900 dark:text-white">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(project.value)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </StrictModeDroppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
};

export default ProjectsKanban;
