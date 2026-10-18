import React, { useState } from 'react';
import { AuditLog, DatabaseSchemaTable, EnvironmentType } from '../types';
import { POSTGRES_SCHEMA_TABLES } from '../data/initialData';
import {
  ShieldAlert,
  Database,
  History,
  X,
  Server,
  Key,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  environment,
  setEnvironment,
}) => {
  const [activeTab, setActiveTab] = useState<'audit_trail' | 'schema_explorer' | 'environments'>('audit_trail');
  const [selectedTable, setSelectedTable] = useState<DatabaseSchemaTable>(POSTGRES_SCHEMA_TABLES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-neutral-300 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col text-neutral-900 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950">
                Fundação Técnica: Base Relacional, Auditoria & Ambientes
              </h2>
              <p className="text-[11px] text-neutral-500">
                Garantia de integridade de dados, regras no servidor e conformidade legal na construção civil.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 pt-4 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveTab('audit_trail')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit_trail'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Trilha de Auditoria Imutável ({auditLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('schema_explorer')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema_explorer'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Modelo Relacional PostgreSQL (Drizzle DDL)</span>
          </button>
          <button
            onClick={() => setActiveTab('environments')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'environments'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Ambientes Separados (Dev / Staging / Prod)</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* 1. Audit Trail View */}
          {activeTab === 'audit_trail' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600">
                A trilha de auditoria (Audit Trail) é gravada de forma append-only no PostgreSQL. Cada transação sensível (aprovações de orçamentos, alterações de taxas de IVA, emissão de autos e chamadas à IA) regista carimbo de data/hora, autor, IP e estado prévio.
              </div>

              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100/70 text-neutral-600 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Data / Hora</th>
                      <th className="py-2.5 px-3">Utilizador & Cargo</th>
                      <th className="py-2.5 px-3">Ação</th>
                      <th className="py-2.5 px-3">Entidade</th>
                      <th className="py-2.5 px-3">Detalhes da Transação</th>
                      <th className="py-2.5 px-3 font-mono">IP de Origem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <strong className="text-neutral-900 block">{log.user}</strong>
                          <span className="text-[10px] text-neutral-500">{log.role}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action === 'APPROVAL'
                                ? 'bg-emerald-100 text-emerald-900'
                                : log.action === 'AI_EXECUTION'
                                ? 'bg-purple-100 text-purple-900'
                                : log.action === 'CREATE'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-neutral-800 whitespace-nowrap">
                          {log.entity}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-700 leading-snug min-w-[260px]">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-neutral-400 whitespace-nowrap">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. PostgreSQL Schema Explorer */}
          {activeTab === 'schema_explorer' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Tables list */}
              <div className="md:col-span-4 space-y-2">
                <span className="font-bold text-neutral-900 block mb-2">Tabelas Relacionais (PostgreSQL):</span>
                {POSTGRES_SCHEMA_TABLES.map((tbl) => (
                  <button
                    key={tbl.tableName}
                    onClick={() => setSelectedTable(tbl)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                      selectedTable.tableName === tbl.tableName
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                        : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <div className="font-mono">{tbl.tableName}</div>
                    <div className="text-[10px] opacity-75 truncate">{tbl.description}</div>
                  </button>
                ))}
              </div>

              {/* Table details */}
              <div className="md:col-span-8 bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-4">
                <div>
                  <div className="font-mono text-xs font-bold text-neutral-900 flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tabela: {selectedTable.tableName}</span>
                  </div>
                  <p className="text-neutral-600 mt-1">{selectedTable.description}</p>
                </div>

                <div className="text-[11px] bg-white p-2.5 rounded border border-neutral-200 space-y-1">
                  <div><strong>Chave Primária:</strong> <code className="text-amber-800">{selectedTable.primaryKey}</code></div>
                  {selectedTable.foreignKeys.length > 0 && (
                    <div>
                      <strong>Chaves Estrangeiras:</strong>
                      <ul className="list-disc list-inside text-neutral-600 mt-0.5">
                        {selectedTable.foreignKeys.map((fk, idx) => (
                          <li key={idx}><code className="text-blue-800">{fk}</code></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Columns */}
                <div>
                  <span className="font-bold text-neutral-900 block mb-2">Colunas & Tipos de Dados:</span>
                  <div className="overflow-x-auto border border-neutral-200 rounded-lg bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200 text-[11px]">
                        <tr>
                          <th className="py-2 px-3">Coluna</th>
                          <th className="py-2 px-3">Tipo PostgreSQL</th>
                          <th className="py-2 px-3">Nulo?</th>
                          <th className="py-2 px-3">Descrição / Regra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-[11px]">
                        {selectedTable.columns.map((col) => (
                          <tr key={col.name}>
                            <td className="py-1.5 px-3 font-mono font-bold text-neutral-900">{col.name}</td>
                            <td className="py-1.5 px-3 font-mono text-purple-700">{col.type}</td>
                            <td className="py-1.5 px-3 text-neutral-500">{col.nullable ? 'Sim' : 'NOT NULL'}</td>
                            <td className="py-1.5 px-3 text-neutral-600">{col.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Environments Configuration */}
          {activeTab === 'environments' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm">
                  Configuração de Ambientes Segregados
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Para garantir total estabilidade e evitar que testes ou orçamentos em rascunho poluam a faturação real, o sistema está estruturado em 3 ambientes independentes com bases de dados isoladas:
                </p>

                <div className="space-y-3 pt-2">
                  <div
                    onClick={() => setEnvironment('development')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      environment === 'development'
                        ? 'bg-white border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs'
                        : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>Desenvolvimento (Dev)</span>
                      {environment === 'development' && (
                        <span className="text-emerald-600 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Base de dados local / branch isolada. Execução de testes de novos módulos e experimentação de prompts de IA sem impacto em dados reais.
                    </p>
                  </div>

                  <div
                    onClick={() => setEnvironment('staging')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      environment === 'staging'
                        ? 'bg-amber-50/60 border-amber-600 ring-2 ring-amber-600/10 shadow-xs'
                        : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-neutral-900">
                      <span>Homologação (Staging)</span>
                      {environment === 'staging' && (
                        <span className="text-amber-700 text-[11px] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Ambiente de validação do cliente pré-lançamento. Dados anonimizados do Porto e réplica fiel de infraestrutura.
                    </p>
                  </div>

                  <div
                    onClick={() => setEnvironment('production')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      environment === 'production'
                        ? 'bg-neutral-900 text-white border-neutral-900 ring-2 ring-neutral-900/10 shadow-xs'
                        : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Produção (Live / Real)</span>
                      {environment === 'production' && (
                        <span className="text-amber-400 text-[11px] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${environment === 'production' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Instância oficial de alta disponibilidade com backups diários automáticos encriptados em repouso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
