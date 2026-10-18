import React from 'react';
import {
  Lead,
  Quote,
  ConstructionProject,
  Partner,
  SiteVisit,
} from '../types';
import {
  TrendingUp,
  Clock,
  Euro,
  Building2,
  Calendar,
  FileCheck2,
  ArrowRight,
  MapPin,
  Users,
  HardHat,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
  quotes: Quote[];
  projects: ConstructionProject[];
  partners: Partner[];
  siteVisits: SiteVisit[];
  onNavigate: (tab: string) => void;
  onOpenProposal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  quotes,
  projects,
  partners,
  siteVisits,
  onNavigate,
  onOpenProposal,
}) => {
  // Financial calculations
  const totalPipelineValue = leads.reduce((acc, curr) => acc + (curr.estimatedBudget || 0), 0);
  const activeProjectsCount = projects.length;
  const wonValueTotal = leads
    .filter((l) => l.status === 'won')
    .reduce((acc, curr) => acc + (curr.estimatedBudget || 0), 0);
  const pendingCommissionsTotal = partners.reduce((acc, p) => acc + p.pendingCommission, 0);

  const upcomingVisits = siteVisits.filter((v) => v.status === 'Agendada');
  const activeProject = projects[0];

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Notice */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-2">
            <span>Porto, Portugal</span>
            <span>·</span>
            <span>Alvará IMPIC nº 89412</span>
            <span>·</span>
            <span>Empresa Especializada em Reabilitação Urbana (ARU)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 text-balance">
            Painel Executivo de Gestão de Obras & Manutenção
          </h1>
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed max-w-2xl">
            Acompanhamento integral do ciclo comercial e produtivo: angariação de leads no Grande Porto, vistorias técnicas móveis, orçamentação automatizada com IA, contratos de empreitada e autos de medição.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('kanban')}
            className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Ver Quadro Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('quotes')}
            className="px-4 py-2 bg-white text-neutral-800 border border-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Leitor IA de Mapa de Quantidades</span>
          </button>
          <button
            onClick={onOpenProposal}
            className="px-4 py-2 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"
          >
            <span>Consultar Proposta Técnica e Orçamento</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Valor em Pipeline</span>
            <Euro className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {totalPipelineValue.toLocaleString('pt-PT')} €
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <span className="font-semibold text-emerald-600">6 oportunidades</span>
            <span>no Porto e Matosinhos</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Obras Adjudicadas (Mês)</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {wonValueTotal.toLocaleString('pt-PT')} €
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <span>Taxa de fecho de</span>
            <span className="font-semibold text-neutral-800">42%</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Empreitadas em Execução</span>
            <Building2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {activeProjectsCount} Ativa
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <span>Cedofeita (Progresso: 48%)</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>Comissões de Parceiros</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
            {pendingCommissionsTotal.toLocaleString('pt-PT')} €
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
            <span>A liquidar a 3 arquitetos/mediadores</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Site & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Featured Active Project in Porto */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div className="relative h-56 sm:h-64 w-full bg-neutral-900">
            <img
              src="/src/assets/images/porto_construction_site_1792342889355.jpg"
              alt="Obra de Reabilitação em Cedofeita, Porto"
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
                <HardHat className="w-3.5 h-3.5" />
                <span>Empreitada Principal em Curso</span>
                <span>·</span>
                <span>ARU Porto (IVA 6%)</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {activeProject.title}
              </h3>
              <p className="text-xs text-neutral-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span>{activeProject.address}</span>
              </p>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">Estado da Obra</span>
                <span className="font-semibold text-neutral-900">{activeProject.currentStage}</span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-500">Execução Global</span>
                  <span className="font-semibold tabular-nums text-neutral-800">{activeProject.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all"
                    style={{ width: `${activeProject.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-neutral-100">
                <div>
                  <span className="text-neutral-500 block">Valor Contratado</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {activeProject.contractValueExVat.toLocaleString('pt-PT')} € + IVA
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Diretor de Obra</span>
                  <span className="font-semibold text-neutral-900">{activeProject.directorOfWorks.split(' ')[0]} {activeProject.directorOfWorks.split(' ')[1]}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Desvio Orçamental</span>
                  <span className="font-semibold text-emerald-600 tabular-nums">
                    {activeProject.costDeviationPercent}% (Controlado)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Último Auto de Medição: nº 02 aprovado
              </span>
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs font-semibold text-neutral-900 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                <span>Gerir Diário de Obra e Autos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scheduled Visits & Measurement Certificates */}
        <div className="lg:col-span-5 space-y-6">
          {/* Site Visits Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Próximas Vistorias & Visitas Técnicas
                </h3>
              </div>
              <button
                onClick={() => onNavigate('visits')}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Ver Agenda
              </button>
            </div>

            <div className="mt-3 divide-y divide-neutral-100">
              {upcomingVisits.map((visit) => (
                <div key={visit.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{visit.clientName}</h4>
                      <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{visit.address}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-neutral-900 tabular-nums">
                        {visit.date}
                      </span>
                      <span className="text-[11px] text-neutral-500 block tabular-nums">
                        {visit.time} h
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Técnico: {visit.technician}</span>
                    <span className="text-amber-800 font-medium">
                      Sinc. {visit.syncService}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Referral Activity */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-700" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Rede de Parceiros & Comissões
                </h3>
              </div>
              <span className="text-xs text-neutral-500">3 Ativos</span>
            </div>

            <div className="mt-3 space-y-3">
              {partners.map((partner) => (
                <div key={partner.id} className="p-3 bg-neutral-50 rounded-lg text-xs">
                  <div className="flex items-center justify-between font-semibold text-neutral-900">
                    <span>{partner.name}</span>
                    <span className="tabular-nums font-bold">{(partner.commissionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-neutral-500 text-[11px]">
                    <span>{partner.type}</span>
                    <span className="text-amber-800 font-medium">
                      Pendente: {partner.pendingCommission.toLocaleString('pt-PT')} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
