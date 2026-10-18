export type EnvironmentType = 'development' | 'staging' | 'production';

export type LeadStatus =
  | 'lead_inbound'
  | 'visit_scheduled'
  | 'survey_completed'
  | 'quoting'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Partner {
  id: string;
  name: string;
  type: 'Atelier de Arquitetura' | 'Mediadora Imobiliária' | 'Gabinete de Engenharia' | 'Consultor Imobiliário';
  contactPerson: string;
  email: string;
  phone: string;
  nif: string;
  commissionRate: number; // e.g. 0.04 (4%)
  totalLeads: number;
  totalWonValue: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface Lead {
  id: string;
  code: string;
  clientName: string;
  email: string;
  phone: string;
  nif: string;
  address: string;
  parish: string; // Freguesia (ex: Cedofeita, Foz, Bonfim, Lordelo)
  city: string;
  isAruZone: boolean; // Área de Reabilitação Urbana
  propertyType: 'Apartamento Histórico' | 'Moradia Unifamiliar' | 'Edifício em Propriedade Total' | 'Loja / Comercial' | 'Manutenção de Condomínio';
  interventionType: 'Reabilitação Integral' | 'Manutenção e Conservação' | 'Remodelação de Interiores' | 'Impermeabilização de Cobertura';
  estimatedBudget: number;
  source: 'Website' | 'Parceiro' | 'Google Search' | 'Recomendação Direta';
  partnerId?: string;
  partnerName?: string;
  commissionRate?: number;
  status: LeadStatus;
  urgency: 'Normal' | 'Urgente' | 'Planeamento';
  assignedEngineer: string;
  createdAt: string;
  lastContact: string;
  notes: string;
}

export interface SiteVisit {
  id: string;
  leadId: string;
  clientName: string;
  address: string;
  date: string;
  time: string;
  technician: string;
  technicianRole: string;
  status: 'Agendada' | 'Em Curso' | 'Concluída' | 'Reagendada';
  syncService: 'Google Calendar' | 'Microsoft 365 Outlook' | 'Ambos';
  synced: boolean;
  notes: string;
}

export interface PathologyItem {
  id: string;
  photoUrl: string;
  title: string;
  locationInHouse: string;
  severity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  description: string;
  recommendedIntervention: string;
  suggestedUnit: string;
  suggestedQuantity: number;
}

export interface VoiceNote {
  id: string;
  timestamp: string;
  durationSeconds: number;
  audioName: string;
  transcription: string;
  extractedPathologies: string[];
}

export interface Survey {
  id: string;
  leadId: string;
  visitDate: string;
  surveyor: string;
  grossAreaM2: number;
  ceilingHeightM: number;
  buildingAgeYears: number;
  structuralType: 'Alvenaria de Granito Tradicional' | 'Betão Armado' | 'Estrutura Mista (Madeira/Alvenaria)' | 'Tabique';
  hasElevator: boolean;
  roofCondition: 'Bom' | 'Desgaste Normal' | 'Infiltrações Ativas' | 'Risco de Ruína';
  pathologies: PathologyItem[];
  voiceNotes: VoiceNote[];
  dimensionalChecklist: {
    room: string;
    area: number;
    flooring: string;
    walls: string;
    observations: string;
  }[];
  aiDiagnosticSummary?: string;
  completed: boolean;
}

export interface QuoteItem {
  id: string;
  code: string;
  description: string;
  unit: 'm²' | 'm³' | 'ml' | 'un' | 'kg' | 'vg' | 'dia' | 'hora';
  quantity: number;
  unitCost: number; // Direct cost
  markupPercent: number; // e.g. 25%
  unitPrice: number; // unitCost * (1 + markupPercent/100)
  totalPrice: number; // quantity * unitPrice
}

export interface QuoteChapter {
  id: string;
  number: string;
  title: string;
  items: QuoteItem[];
}

export interface QuoteVersion {
  version: string; // '1.0', '1.1', '2.0'
  createdAt: string;
  author: string;
  notes: string;
  chapters: QuoteChapter[];
  subtotalDirectCost: number;
  bdiPercent: number; // BDI (Benefícios e Despesas Indiretas)
  subtotalSellingPrice: number;
  vatRate: number; // 0.06 (6% ARU) or 0.23 (23%)
  vatAmount: number;
  grandTotal: number;
}

export interface Quote {
  id: string;
  code: string; // ORC-2026-042
  leadId: string;
  title: string;
  clientName: string;
  clientNif: string;
  address: string;
  isAruZone: boolean;
  status: 'Rascunho' | 'Enviado ao Cliente' | 'Em Revisão' | 'Aprovado' | 'Rejeitado';
  currentVersion: string;
  versions: QuoteVersion[];
  validUntil: string;
  paymentTerms: string;
  leadTimeWeeks: number;
}

export interface DailySiteLog {
  id: string;
  date: string;
  weather: 'Ensolarado' | 'Chuva Ligeira' | 'Chuva Intensa' | 'Nublado';
  temperatureC: number;
  headcountOnSite: number;
  subcontractors: string[];
  tasksCompleted: string[];
  incidentsOrDelays?: string;
  safetyCompliant: boolean;
  photos: string[];
}

export interface MeasurementCertificate {
  id: string;
  certificateNumber: string; // Auto nº 01
  date: string;
  period: string; // Ex: Março 2026
  workCompletedAmount: number;
  cumulativePercentage: number;
  retentionGuaranteeAmount: number; // 5%
  netPayableAmount: number;
  status: 'Submetido' | 'Aprovado pela Fiscalização' | 'Faturado' | 'Pago';
  approvedByDirector: boolean;
  paymentDueDate: string;
}

export interface PaymentMilestone {
  id: string;
  phase: string;
  description: string;
  percentage: number;
  amount: number;
  triggerEvent: string;
  status: 'Pendente' | 'A Vencer' | 'Faturado' | 'Liquidado';
  paidDate?: string;
}

export interface ConstructionProject {
  id: string;
  code: string; // OBR-2026-018
  quoteId: string;
  contractCode: string;
  title: string;
  clientName: string;
  clientNif: string;
  clientEmail: string;
  address: string;
  alvaraImpic: string;
  directorOfWorks: string; // Engenheiro Diretor de Obra
  startDate: string;
  plannedEndDate: string;
  currentStage: 'Instalação de Estaleiro' | 'Demolições e Estrutura' | 'Instalações Técnicas' | 'Acabamentos e Revestimentos' | 'Vistoria Final e Telas Finais';
  progressPercent: number;
  contractValueExVat: number;
  vatRate: number;
  totalWithVat: number;
  executedValue: number;
  costDeviationPercent: number;
  dailyLogs: DailySiteLog[];
  measurementCertificates: MeasurementCertificate[];
  paymentMilestones: PaymentMilestone[];
  recentPhotos: {
    url: string;
    caption: string;
    date: string;
    stage: string;
  }[];
}

export interface LegalContract {
  id: string;
  contractNumber: string;
  projectTitle: string;
  clientName: string;
  clientNif: string;
  clientAddress: string;
  contractorName: string;
  contractorNif: string;
  contractorAddress: string;
  contractorAlvara: string;
  dateSigned: string;
  workDurationDays: number;
  totalValueExVat: number;
  vatRate: number;
  totalValueWithVat: number;
  paymentMilestones: PaymentMilestone[];
  guaranteePeriodYears: number; // 5 anos civil, 10 anos estrutural
  status: 'Minuta Gerada' | 'Assinatura Pendente' | 'Assinado e Válido';
  signedByClient: boolean;
  signedByContractor: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'AI_EXECUTION' | 'APPROVAL';
  entity: 'Lead' | 'Orçamento' | 'Vistoria' | 'Obra' | 'Auto de Medição' | 'Contrato' | 'Comissão';
  entityIdentifier: string;
  details: string;
  ipAddress: string;
}

export interface DatabaseSchemaTable {
  tableName: string;
  description: string;
  primaryKey: string;
  foreignKeys: string[];
  columns: { name: string; type: string; nullable: boolean; notes: string }[];
}
