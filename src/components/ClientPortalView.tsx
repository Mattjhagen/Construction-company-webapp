import React, { useState } from 'react';
import { ConstructionProject } from '../types';
import {
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  HardHat,
  MessageSquare,
  ShieldCheck,
  Send,
  Eye,
  Camera,
} from 'lucide-react';

interface ClientPortalViewProps {
  project: ConstructionProject;
  onAddAuditLog: (action: any, entity: any, id: string, details: string) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  project,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'approvals' | 'finance' | 'messages'>('progress');
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string; isClient: boolean }[]>([
    {
      sender: 'Eng. Tiago Silva (Diretor de Obra)',
      text: 'Boa tarde, Dra. Helena. A passagem das condutas elétricas e rede de multicamada foi concluída e testada sob pressão hoje com sucesso.',
      time: 'Ontem às 17:30',
      isClient: false,
    },
    {
      sender: 'Dra. Helena Vasconcelos',
      text: 'Excelente notícia! Conseguimos manter os tetos trabalhados na sala sem abrir roços visíveis?',
      time: 'Ontem às 18:15',
      isClient: true,
    },
    {
      sender: 'Eng. Tiago Silva (Diretor de Obra)',
      text: 'Sim, passámos toda a cablagem através do espaço livre do soalho do piso superior conforme planeado.',
      time: 'Hoje às 09:20',
      isClient: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Additional Change Order awaiting approval
  const [pendingChangeOrder, setPendingChangeOrder] = useState<{
    id: string;
    title: string;
    description: string;
    amountExVat: number;
    vatRate: number;
    status: 'Pendente de Aprovação' | 'Aprovado pelo Cliente';
  }>({
    id: 'TA-01',
    title: 'Adicional nº 01: Instalação de Isolamento Térmico Adicional em Placas de Cortiça na Parede Norte',
    description:
      'Melhoria recomendada pela equipa técnica para prevenir condensações no quarto norte virado à rua, aproveitando a abertura das paredes de tabique.',
    amountExVat: 1450,
    vatRate: 0.06,
    status: 'Pendente de Aprovação',
  });

  const handleApproveChangeOrder = () => {
    setPendingChangeOrder((prev) => ({
      ...prev,
      status: 'Aprovado pelo Cliente',
    }));
    onAddAuditLog(
      'APPROVAL',
      'Obra',
      project.code,
      `Trabalho Adicional TA-01 aprovado pelo Dono de Obra via Portal do Cliente.`
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: 'Dra. Helena Vasconcelos (Cliente)',
        text: newMessage,
        time: 'Agora',
        isClient: true,
      },
    ]);
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Dedicated to Client */}
      <div className="bg-neutral-900 text-white rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Portal Exclusivo do Dono de Obra</span>
            <span>·</span>
            <span>Ambiente Seguro</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Reabilitação do Imóvel — {project.address}
          </h2>
          <p className="mt-1 text-xs text-neutral-300">
            Acompanhe o diário fotográfico, evolução dos trabalhos e aprovação de alterações sem burocracias.
          </p>
        </div>

        {/* Tab switcher inside portal */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'progress' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Evolução da Obra & Fotos
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'approvals' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <span>Aprovações Pendentes</span>
            {pendingChangeOrder.status === 'Pendente de Aprovação' && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'finance' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Plano de Pagamentos
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'messages' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            Mensagens com Diretor de Obra
          </button>
        </div>
      </div>

      {/* Tab 1: Progress & Site Photos */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-500">Fase Atual da Empreitada:</span>
                <strong className="text-sm font-bold text-neutral-900 block mt-0.5">
                  {project.currentStage}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-neutral-500">Conclusão Prevista:</span>
                <strong className="text-sm font-bold text-neutral-900 block mt-0.5 tabular-nums">
                  30 de Maio de 2026
                </strong>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-600 font-medium">Progresso Global dos Trabalhos</span>
                <span className="font-bold tabular-nums text-neutral-900">{project.progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Site Progress Photos */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-neutral-600" />
              <span>Registo Fotográfico Semanal do Estaleiro</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {project.recentPhotos.map((photo, i) => (
                <div key={i} className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 text-xs">
                  <div className="h-56 w-full bg-neutral-900 relative">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-neutral-950/80 text-white text-[10px] rounded font-medium">
                      Fase: {photo.stage}
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-[11px] text-neutral-400 tabular-nums">Data: {photo.date}</div>
                    <p className="font-medium text-neutral-800 leading-snug">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Change Orders Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs max-w-2xl mx-auto space-y-4 text-xs">
          <h3 className="text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            Aprovação de Trabalhos Adicionais & Alterações
          </h3>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-neutral-400">{pendingChangeOrder.id}</span>
                <h4 className="font-bold text-sm text-neutral-900">{pendingChangeOrder.title}</h4>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  pendingChangeOrder.status === 'Aprovado pelo Cliente'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {pendingChangeOrder.status}
              </span>
            </div>

            <p className="text-neutral-600 leading-relaxed">{pendingChangeOrder.description}</p>

            <div className="p-3 bg-white rounded-lg border border-neutral-200 flex justify-between items-center">
              <div>
                <span className="text-neutral-500 block">Impacto Orçamental:</span>
                <strong className="text-neutral-900 text-sm tabular-nums">
                  {pendingChangeOrder.amountExVat.toLocaleString('pt-PT')} € + IVA (6% ARU) ={' '}
                  {(pendingChangeOrder.amountExVat * (1 + pendingChangeOrder.vatRate)).toLocaleString('pt-PT')} €
                </strong>
              </div>

              {pendingChangeOrder.status === 'Pendente de Aprovação' ? (
                <button
                  onClick={handleApproveChangeOrder}
                  className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aprovar Trabalho Adicional</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Adicional Aprovado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Finance and Payment Schedule */}
      {activeTab === 'finance' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <h3 className="text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
            Plano de Pagamentos por Marcos da Empreitada
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Fase Contratual</th>
                  <th className="py-2.5 px-3">Condição de Vencimento</th>
                  <th className="py-2.5 px-3 text-right">Percentagem</th>
                  <th className="py-2.5 px-3 text-right">Valor sem IVA</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {project.paymentMilestones.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-bold text-neutral-900">{m.phase}</td>
                    <td className="py-3 px-3 text-neutral-600">{m.triggerEvent}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                      {m.percentage}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-800">
                      {m.amount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.status === 'Liquidado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status === 'A Vencer'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs max-w-2xl mx-auto space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                Canal Direto com o Diretor de Obra
              </h3>
              <p className="text-[11px] text-neutral-500">
                {project.directorOfWorks} (Ordem dos Engenheiros)
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto p-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] space-y-1 ${
                  msg.isClient
                    ? 'ml-auto bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span className="font-semibold">{msg.sender}</span>
                  <span className="tabular-nums">{msg.time}</span>
                </div>
                <p className="text-xs leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="pt-2 border-t border-neutral-100 flex gap-2">
            <input
              type="text"
              placeholder="Escreva uma mensagem para a equipa técnica..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
