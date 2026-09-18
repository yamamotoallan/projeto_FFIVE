export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'diretoria' | 'user';
  token?: string;
  avatar?: string;
  two_factor_enabled?: boolean;
}

export interface KitchenItem {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  color: string;
  type: 'cabinet' | 'appliance' | 'window' | 'door';
}

export interface Project {
  id: string;
  title: string;
  client: string;
  value: number;
  status: 'Refinamento' | 'Recorte' | 'Montagem' | 'Logística' | 'Instalação' | 'Entregue' | 'Pós-vendas';
  deadline: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  responsible?: string;
  description?: string;
  startDate?: string;
  leadId?: string;
  quoteId?: string;
  files?: QuoteFile[];
  history?: ProjectHistory[];
}

export interface ProjectHistory {
  id?: string;
  project_id: string;
  type: 'stage_change' | 'regression';
  from: string;
  to: string;
  timestamp: string;
  user_name: string;
  reason?: string; // For regression or incomplete items
  checklist_snapshot?: {
    label: string;
    completed: boolean;
    reason?: string;
  }[];
}

export interface BusinessRule {
  stage: Project['status'];
  deadlineDays: number;
  alertBeforeDays: number;
}

export interface Lead {
  id: string;
  name: string;
  project: string;
  phone: string;
  email: string;
  source: string;
  status: 'Novo' | 'Em Contato' | 'Qualificado' | 'Fechado' | 'Perdido';
  createdAt: string;
  lastAction: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface QuoteFile {
  id?: number;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'cad' | 'other';
  url?: string;
  original_name?: string;
}

export interface Quote {
  id: string;
  leadId?: string;
  client: string;
  project: string;
  status: 'Pendente' | 'Em Análise' | 'Enviado' | 'Aprovado' | 'Recusado' | 'Rascunho';
  value: number;
  date: string;
  validity?: string;
  files?: QuoteFile[];
  projectId?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'Medição' | 'Instalação' | 'Reunião';
  confirmed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  actions: ('view' | 'create' | 'edit' | 'delete')[];
}

export interface Profile {
  id: string;
  name: 'admin' | 'diretoria' | 'user';
  displayName: string;
  permissions: Permission[];
}