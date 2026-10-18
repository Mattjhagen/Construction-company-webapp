import React, { useState } from 'react';
import { Lead, LeadStatus, Partner } from '../types';
import {
  Plus,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Building,
  User,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface KanbanViewProps {
  leads: Lead[];
  partners: Partner[];
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onAddLead: (newLead: Partial<Lead>) => void;
  onNavigateToQuote: (leadId: string) => void;
  onNavigateToSurvey: (leadId: string) => void;
}

const STAGES: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'lead_inbound', title: 'Contacto Inicial', color: 'border-neutral-300' },
  { id: 'visit_scheduled', title: 'Visita Agendada', color: 'border-blue-400' },
  { id: 'survey_completed', title: 'Vistoria Realizada', color: 'border-purple-400' },
  { id: 'quoting', title: 'Em Orçamentação', color: 'border-amber-400' },
  { id: 'proposal_sent', title: 'Proposta Enviada', color: 'border-indigo-400' },
  { id: 'negotiation', title: 'Em Negociação', color: 'border-orange-400' },
  { id: 'won', title: 'Adjudicado (Ganho)', color: 'border-emerald-500' },
  { id: 'lost', title: 'Não Concretizado', color: 'border-neutral-400' },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  leads,
  partners,
  onUpdateLeadStatus,
  onAddLead,
  onNavigateToQuote,
  onNavigateToSurvey,
}) => {
  const [filterParish, setFilterParish] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Lead Form state
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+351 ');
  const [nif, setNif] = useState('');
  const [address, setAddress] = useState('');
  const [parish, setParish] = useState('Cedofeita');
  const [city, setCity] = useState('Porto');
  const [isAruZone, setIsAruZone] = useState(true);
  const [propertyType, setPropertyType] = useState<Lead['propertyType']>('Apartamento Histórico');
  const [interventionType, setInterventionType] = useState<Lead['interventionType']>('Reabilitação Integral');
  const [estimatedBudget, setEstimatedBudget] = useState('75000');
  const [source, setSource] = useState<Lead['source']>('Website');
  const [partnerId, setPartnerId] = useState('');
  const [urgency, setUrgency] = useState<Lead['urgency']>('Normal');
  const [notes, setNotes] = useState('');

  const filteredLeads = leads.filter((l) => {
    if (filterParish !== 'all' && l.parish !== filterParish) return false;
    if (filterSource !== 'all' && l.source !== filterSource) return false;
    return true;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !address) return;

    const selectedPartner = partners.find((p) => p.id === partnerId);

    onAddLead({
      clientName,
      email,
      phone,
      nif,
      address,
      parish,
      city,
      isAruZone,
      propertyType,
      interventionType,
      estimatedBudget: parseFloat(estimatedBudget) || 50000,
      source,
      partnerId: selectedPartner?.id,
      partnerName: selectedPartner?.name,
      commissionRate: selectedPartner?.commissionRate,
      status: 'lead_inbound',
      urgency,
      assignedEngineer: 'Eng. Tiago Silva',
      notes,
    });

    setIsModalOpen(false);
    // Reset form
    setClientName('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    const idx = STAGES.findIndex((s) => s.id === current);
    if (idx !== -1 && idx < STAGES.length - 2) {
      return STAGES[idx + 1].id;
    }
    return null;
  };

  const getPrevStage = (current: LeadStatus): LeadStatus | null => {
    const idx = STAGES.findIndex((s) => s.id === current);
    if (idx > 0 && current !== 'won' && current !== 'lost') {
      return STAGES[idx - 1].id;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
            <span>Gestão Comercial & CRM</span>
            <span>·</span>
            <span>Funil de Obras no Grande Porto</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Quadro Kanban de Pedidos de Orçamento
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Avance os pedidos através das fases de vistoria técnica, orçamentação, envio e adjudicação de empreitada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Parish Filter */}
          <select
            value={filterParish}
            onChange={(e) => setFilterParish(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 font-medium"
          >
            <option value="all">Todas as Freguesias (Porto)</option>
            <option value="Cedofeita">Cedofeita / Baixa</option>
            <option value="Foz do Douro">Foz do Douro</option>
            <option value="Bonfim">Bonfim</option>
            <option value="São Nicolau">Ribeira / Centro</option>
          </select>

          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 font-medium"
          >
            <option value="all">Todas as Origens</option>
            <option value="Website">Website</option>
            <option value="Parceiro">Parceiros de Arquitetura</option>
            <option value="Recomendação Direta">Recomendação Direta</option>
          </select>

          {/* New Lead Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Lead / Pedido</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container (Scrollable Horizontal) */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-[1500px]">
          {STAGES.map((stage) => {
            const columnLeads = filteredLeads.filter((l) => l.status === stage.id);
            const columnValue = columnLeads.reduce((acc, l) => acc + (l.estimatedBudget || 0), 0);

            return (
              <div
                key={stage.id}
                className="w-72 bg-neutral-100/70 border border-neutral-200/80 rounded-xl p-3 flex flex-col max-h-[750px]"
              >
                {/* Column Header */}
                <div className="pb-3 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
                      <span>{stage.title}</span>
                      <span className="text-[10px] bg-neutral-200 px-1.5 py-0.2 rounded-full font-semibold text-neutral-700">
                        {columnLeads.length}
                      </span>
                    </h3>
                    <div className="text-[11px] font-semibold text-neutral-600 tabular-nums mt-0.5">
                      {columnValue.toLocaleString('pt-PT')} €
                    </div>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="mt-3 space-y-3 overflow-y-auto flex-1 pr-1">
                  {columnLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400 italic">
                      Nenhum registo nesta fase
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const next = getNextStage(lead.status);
                      const prev = getPrevStage(lead.status);
                      const partnerCommission =
                        lead.partnerName && lead.commissionRate
                          ? lead.estimatedBudget * lead.commissionRate
                          : 0;

                      return (
                        <div
                          key={lead.id}
                          className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs hover:border-neutral-300 transition-all text-xs space-y-2.5"
                        >
                          {/* Top Tag & Code */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-500">
                            <span className="font-mono text-[10px] text-neutral-400">{lead.code}</span>
                            {lead.isAruZone && (
                              <span className="text-amber-800 text-[10px] font-semibold">
                                ARU (IVA 6%)
                              </span>
                            )}
                          </div>

                          {/* Client Name & Type */}
                          <div>
                            <h4 className="font-bold text-neutral-900 leading-snug">{lead.clientName}</h4>
                            <p className="text-[11px] text-neutral-600 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span className="truncate">{lead.address}</span>
                            </p>
                          </div>

                          {/* Property Details */}
                          <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-100 space-y-0.5">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Tipologia:</span>
                              <span className="font-medium text-neutral-800">{lead.propertyType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Intervenção:</span>
                              <span className="font-medium text-neutral-800 truncate max-w-[120px]">{lead.interventionType}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-neutral-200/60 font-semibold text-neutral-900">
                              <span>Valor Previsto:</span>
                              <span className="tabular-nums">{lead.estimatedBudget.toLocaleString('pt-PT')} €</span>
                            </div>
                          </div>

                          {/* Partner Attribution if exists */}
                          {lead.partnerName && (
                            <div className="text-[10px] text-neutral-600 bg-amber-50/70 border border-amber-200/50 p-1.5 rounded">
                              <div className="font-semibold text-amber-900 truncate">
                                Ref: {lead.partnerName}
                              </div>
                              <div className="flex justify-between text-amber-800 mt-0.5">
                                <span>Comissão ({(lead.commissionRate! * 100).toFixed(1)}%):</span>
                                <span className="tabular-nums font-bold">
                                  {partnerCommission.toLocaleString('pt-PT')} €
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Direct Actions & Progression Controls */}
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
                            {/* Prev Stage Button */}
                            {prev ? (
                              <button
                                onClick={() => onUpdateLeadStatus(lead.id, prev)}
                                title="Mover para fase anterior"
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span />
                            )}

                            {/* Specific Phase CTA buttons */}
                            {lead.status === 'visit_scheduled' && (
                              <button
                                onClick={() => onNavigateToSurvey(lead.id)}
                                className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[10px] font-semibold transition-colors"
                              >
                                Vistoria Móvel
                              </button>
                            )}

                            {lead.status === 'quoting' && (
                              <button
                                onClick={() => onNavigateToQuote(lead.id)}
                                className="px-2 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                <span>Orçamento IA</span>
                              </button>
                            )}

                            {lead.status === 'negotiation' && (
                              <button
                                onClick={() => onUpdateLeadStatus(lead.id, 'won')}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Adjudicar</span>
                              </button>
                            )}

                            {/* Next Stage Button */}
                            {next && (
                              <button
                                onClick={() => onUpdateLeadStatus(lead.id, next)}
                                title="Avançar para próxima fase"
                                className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 text-[10px] font-medium"
                              >
                                <span>Avançar</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                Registar Novo Pedido de Orçamento / Lead
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Nome do Cliente / Entidade *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Vasconcelos"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="cliente@email.pt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">NIF (Contribuinte)</label>
                  <input
                    type="text"
                    placeholder="219 443 891"
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Freguesia (Porto)</label>
                  <select
                    value={parish}
                    onChange={(e) => setParish(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    <option value="Cedofeita">Cedofeita / Santo Ildefonso</option>
                    <option value="Foz do Douro">Foz do Douro / Nevogilde</option>
                    <option value="Bonfim">Bonfim</option>
                    <option value="Lordelo do Ouro">Lordelo do Ouro / Massarelos</option>
                    <option value="São Nicolau">São Nicolau / Miragaia (Ribeira)</option>
                    <option value="Matosinhos">Matosinhos Sul</option>
                    <option value="Vila Nova de Gaia">Vila Nova de Gaia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Morada do Imóvel / Obra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua de Santa Catarina, 412, Porto"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                <input
                  type="checkbox"
                  id="modalAruCheck"
                  checked={isAruZone}
                  onChange={(e) => setIsAruZone(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="modalAruCheck" className="text-[11px] text-amber-900 font-medium cursor-pointer">
                  Área de Reabilitação Urbana (ARU Porto) — Aplica taxa reduzida de IVA a 6%
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Tipologia</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    <option value="Apartamento Histórico">Apartamento Histórico</option>
                    <option value="Moradia Unifamiliar">Moradia Unifamiliar</option>
                    <option value="Edifício em Propriedade Total">Edifício em Propriedade Total</option>
                    <option value="Loja / Comercial">Loja / Comercial</option>
                    <option value="Manutenção de Condomínio">Manutenção de Condomínio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Tipo de Intervenção</label>
                  <select
                    value={interventionType}
                    onChange={(e) => setInterventionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    <option value="Reabilitação Integral">Reabilitação Integral</option>
                    <option value="Manutenção e Conservação">Manutenção e Conservação</option>
                    <option value="Remodelação de Interiores">Remodelação de Interiores</option>
                    <option value="Impermeabilização de Cobertura">Impermeabilização de Cobertura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Orçamento Estimado (€)
                  </label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Origem da Lead</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    <option value="Website">Website Próprio</option>
                    <option value="Parceiro">Parceiro Referenciador</option>
                    <option value="Recomendação Direta">Recomendação Direta</option>
                    <option value="Google Search">Google Search / Orgânico</option>
                  </select>
                </div>
              </div>

              {source === 'Parceiro' && (
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">
                    Selecionar Gabinete / Parceiro Referenciador
                  </label>
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    <option value="">-- Escolher Parceiro --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Comissão: {(p.commissionRate * 100).toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Notas Preliminares</label>
                <textarea
                  rows={2}
                  placeholder="Observações recolhidas pelo atendimento..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Registar no Kanban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
