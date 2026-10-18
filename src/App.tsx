import React, { useState } from 'react';
import {
  EnvironmentType,
  Lead,
  LeadStatus,
  Partner,
  SiteVisit,
  Survey,
  Quote,
  ConstructionProject,
  LegalContract,
  AuditLog,
} from './types';
import {
  INITIAL_LEADS,
  INITIAL_PARTNERS,
  INITIAL_SITE_VISITS,
  INITIAL_SURVEYS,
  INITIAL_QUOTES,
  INITIAL_PROJECTS,
  INITIAL_CONTRACT,
  INITIAL_AUDIT_LOGS,
} from './data/initialData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { SiteVisitsAndSurveyView } from './components/SiteVisitsAndSurveyView';
import { QuoteBuilderView } from './components/QuoteBuilderView';
import { ProjectsAndContractsView } from './components/ProjectsAndContractsView';
import { ClientPortalView } from './components/ClientPortalView';
import { AuditTrailModal } from './components/AuditTrailModal';
import { AutomatedTestsModal } from './components/AutomatedTestsModal';
import { RfpProposalModal } from './components/RfpProposalModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [environment, setEnvironment] = useState<EnvironmentType>('production');

  // Core business entities state
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(INITIAL_SITE_VISITS);
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [projects, setProjects] = useState<ConstructionProject[]>(INITIAL_PROJECTS);
  const [contract, setContract] = useState<LegalContract>(INITIAL_CONTRACT);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isTestsModalOpen, setIsTestsModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Audit Log helper
  const addAuditLog = (
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    entityIdentifier: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Eng. Tiago Silva',
      role: 'Diretor Técnico',
      action,
      entity,
      entityIdentifier,
      details,
      ipAddress: '194.65.22.18 (Porto)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Lead Handlers
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const oldStatus = lead.status;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    // If won, calculate partner commission if applicable
    if (newStatus === 'won' && lead.partnerId && lead.commissionRate) {
      const commAmount = lead.estimatedBudget * lead.commissionRate;
      setPartners((prev) =>
        prev.map((p) => {
          if (p.id !== lead.partnerId) return p;
          return {
            ...p,
            totalWonValue: p.totalWonValue + lead.estimatedBudget,
            pendingCommission: p.pendingCommission + commAmount,
          };
        })
      );
      addAuditLog(
        'STATUS_CHANGE',
        'Comissão',
        lead.partnerId,
        `Obra ganha! Provisionada comissão de ${commAmount.toLocaleString('pt-PT')} € para o parceiro ${lead.partnerName}.`
      );
    }

    addAuditLog(
      'STATUS_CHANGE',
      'Lead',
      lead.code,
      `Estado da lead alterado de "${oldStatus}" para "${newStatus}".`
    );
  };

  const handleAddLead = (newLeadData: Partial<Lead>) => {
    const newCode = `LEAD-2026-${String(leads.length + 104).padStart(3, '0')}`;
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      code: newCode,
      clientName: newLeadData.clientName || 'Novo Cliente',
      email: newLeadData.email || '',
      phone: newLeadData.phone || '',
      nif: newLeadData.nif || '',
      address: newLeadData.address || '',
      parish: newLeadData.parish || 'Cedofeita',
      city: newLeadData.city || 'Porto',
      isAruZone: newLeadData.isAruZone ?? true,
      propertyType: newLeadData.propertyType || 'Apartamento Histórico',
      interventionType: newLeadData.interventionType || 'Reabilitação Integral',
      estimatedBudget: newLeadData.estimatedBudget || 50000,
      source: newLeadData.source || 'Website',
      partnerId: newLeadData.partnerId,
      partnerName: newLeadData.partnerName,
      commissionRate: newLeadData.commissionRate,
      status: 'lead_inbound',
      urgency: newLeadData.urgency || 'Normal',
      assignedEngineer: 'Eng. Tiago Silva',
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0],
      notes: newLeadData.notes || '',
    };

    setLeads((prev) => [newLead, ...prev]);
    addAuditLog(
      'CREATE',
      'Lead',
      newCode,
      `Nova lead registada para ${newLead.clientName} em ${newLead.address}.`
    );
  };

  const handleAddSiteVisit = (visitData: Partial<SiteVisit>) => {
    const newVisit: SiteVisit = {
      id: `visit-${Date.now()}`,
      leadId: visitData.leadId || 'lead-101',
      clientName: visitData.clientName || 'Cliente',
      address: visitData.address || 'Porto',
      date: visitData.date || '2026-04-05',
      time: visitData.time || '10:00',
      technician: visitData.technician || 'Eng. Tiago Silva',
      technicianRole: visitData.technicianRole || 'Engenheiro Civil',
      status: 'Agendada',
      syncService: visitData.syncService || 'Ambos',
      synced: true,
      notes: visitData.notes || '',
    };

    setSiteVisits((prev) => [newVisit, ...prev]);
    addAuditLog(
      'CREATE',
      'Vistoria',
      newVisit.id,
      `Vistoria técnica agendada para ${newVisit.clientName} em ${newVisit.date} às ${newVisit.time}h (Sincronizada com ${newVisit.syncService}).`
    );
  };

  const handleUpdateSurvey = (updatedSurvey: Survey) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === updatedSurvey.id ? updatedSurvey : s))
    );
    addAuditLog(
      'UPDATE',
      'Vistoria',
      updatedSurvey.id,
      `Levantamento técnico no local atualizado com novas notas de voz e patologias.`
    );
  };

  const handleUpdateQuote = (updatedQuote: Quote) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
    );
  };

  const handleUpdateProject = (updatedProject: ConstructionProject) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const handleUpdateContract = (updatedContract: LegalContract) => {
    setContract(updatedContract);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/80">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        environment={environment}
        setEnvironment={(env) => {
          setEnvironment(env);
          addAuditLog('UPDATE', 'Obra', 'ENV_SWITCH', `Ambiente alterado para ${env.toUpperCase()}.`);
        }}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onOpenTests={() => setIsTestsModalOpen(true)}
        onOpenProposal={() => setIsProposalModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            leads={leads}
            quotes={quotes}
            projects={projects}
            partners={partners}
            siteVisits={siteVisits}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenProposal={() => setIsProposalModalOpen(true)}
          />
        )}

        {currentTab === 'kanban' && (
          <KanbanView
            leads={leads}
            partners={partners}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onAddLead={handleAddLead}
            onNavigateToQuote={(leadId) => {
              setCurrentTab('quotes');
            }}
            onNavigateToSurvey={(leadId) => {
              setCurrentTab('visits');
            }}
          />
        )}

        {currentTab === 'visits' && (
          <SiteVisitsAndSurveyView
            siteVisits={siteVisits}
            surveys={surveys}
            onAddSiteVisit={handleAddSiteVisit}
            onUpdateSurvey={handleUpdateSurvey}
            onNavigateToQuote={(leadId) => setCurrentTab('quotes')}
          />
        )}

        {currentTab === 'quotes' && (
          <QuoteBuilderView
            quotes={quotes}
            onUpdateQuote={handleUpdateQuote}
            onAddAuditLog={addAuditLog}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsAndContractsView
            projects={projects}
            contract={contract}
            partners={partners}
            onUpdateProject={handleUpdateProject}
            onUpdateContract={handleUpdateContract}
            onAddAuditLog={addAuditLog}
          />
        )}

        {currentTab === 'portal' && (
          <ClientPortalView
            project={projects[0]}
            onAddAuditLog={addAuditLog}
          />
        )}
      </main>

      {/* Modals */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditLogs={auditLogs}
        environment={environment}
        setEnvironment={setEnvironment}
      />

      <AutomatedTestsModal
        isOpen={isTestsModalOpen}
        onClose={() => setIsTestsModalOpen(false)}
      />

      <RfpProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>
            <span>EdificaPorto ERP & Gestão de Obras © 2026</span>
            <span className="mx-2">·</span>
            <span>Porto, Portugal</span>
            <span className="mx-2">·</span>
            <span>Alvará IMPIC nº 89412</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="text-neutral-700 hover:text-neutral-900 font-semibold underline"
            >
              Consultar Proposta Técnica RFP
            </button>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="hover:text-neutral-900"
            >
              Auditoria & Base de Dados
            </button>
            <button
              onClick={() => setIsTestsModalOpen(true)}
              className="hover:text-neutral-900"
            >
              Testes Automatizados
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
