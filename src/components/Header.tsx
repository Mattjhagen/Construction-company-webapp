import React from 'react';
import { EnvironmentType } from '../types';
import { Database, ShieldCheck, PlayCircle, HardHat } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
  onOpenAudit: () => void;
  onOpenTests: () => void;
  onOpenProposal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  environment,
  setEnvironment,
  onOpenAudit,
  onOpenTests,
  onOpenProposal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel Geral' },
    { id: 'kanban', label: 'CRM & Kanban' },
    { id: 'visits', label: 'Vistorias & Visitas' },
    { id: 'quotes', label: 'Orçamentos & IA' },
    { id: 'projects', label: 'Obras & Contratos' },
    { id: 'portal', label: 'Portal do Cliente' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-amber-400 flex items-center justify-center font-bold text-sm tracking-tighter">
                EP
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 block leading-tight group-hover:text-amber-700 transition-colors">
                  EdificaPorto
                </span>
                <span className="text-[10px] text-neutral-500 font-medium tracking-wide block">
                  Construção & Reabilitação
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-6 clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors relative ${
                    isActive
                      ? 'text-neutral-950 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action or system controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Environment Indicator */}
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-md p-0.5 border border-neutral-200 text-xs">
              {(['development', 'staging', 'production'] as EnvironmentType[]).map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={`px-2 py-1 rounded font-medium transition-all text-[11px] ${
                    environment === env
                      ? env === 'production'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : env === 'staging'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {env === 'development' ? 'Dev' : env === 'staging' ? 'Staging' : 'Prod'}
                </button>
              ))}
            </div>

            {/* Test Suite Runner Button */}
            <button
              onClick={onOpenTests}
              title="Executar Testes Automatizados de Regras de Negócio"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Audit Trail & DB Schema Button */}
            <button
              onClick={onOpenAudit}
              title="Consultar Auditoria & Esquema PostgreSQL"
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <Database className="w-4 h-4 text-neutral-700" />
            </button>

            {/* RFP Proposal Button */}
            <button
              onClick={onOpenProposal}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Proposta RFP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sub-navigation */}
      <div className="lg:hidden flex items-center gap-4 px-4 py-2 bg-neutral-50 border-t border-neutral-200 overflow-x-auto text-xs font-medium text-neutral-600">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`whitespace-nowrap shrink-0 px-2 py-1 rounded ${
              currentTab === item.id ? 'bg-neutral-900 text-white font-semibold' : 'hover:text-neutral-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
