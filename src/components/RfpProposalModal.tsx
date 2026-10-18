import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Euro,
  Calendar,
  Layers,
  Server,
  ShieldCheck,
  Printer,
  Download,
  X,
  Building2,
  HardHat,
  Cpu,
} from 'lucide-react';

interface RfpProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RfpProposalModal: React.FC<RfpProposalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'summary' | 'stack' | 'phases' | 'costs' | 'sla'>('summary');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-neutral-300 rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col text-neutral-900 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-bold text-base">
              RFP
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-mono">RESPOSTA FORMAL AO PEDIDO DE PROPOSTA</span>
              <h2 className="text-base font-bold text-neutral-950">
                Proposta Técnica e Comercial — Sistema de Gestão EdificaPorto
              </h2>
              <p className="text-[11px] text-neutral-500">
                Apresentada para a Direção da Empresa de Construção e Manutenção de Edifícios (Porto, Portugal)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex items-center gap-1 text-[11px] border border-neutral-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 pt-3 border-b border-neutral-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('summary')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'summary' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            1. Experiência Relevante
          </button>
          <button
            onClick={() => setActiveSection('stack')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'stack' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            2. Arquitetura & Stack Proposta
          </button>
          <button
            onClick={() => setActiveSection('phases')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'phases' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            3. Fases, Prazos & Preço Fixo
          </button>
          <button
            onClick={() => setActiveSection('costs')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'costs' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            4. Custos Operacionais (Running Costs)
          </button>
          <button
            onClick={() => setActiveSection('sla')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'sla' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            5. Modelo de Manutenção & SLA
          </button>
        </div>

        {/* Section Contents */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs leading-relaxed">
          {/* Section 1: Relevant Experience */}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-700" />
                  <span>Enquadramento e Experiência Relevante</span>
                </h3>
                <p className="text-neutral-700">
                  Compreendemos perfeitamente o vosso desafio: a vossa versão em plataforma no-code provou o modelo de negócio e os fluxos de trabalho diários, mas atingiu limites em escalabilidade, integridade relacional, consistência de versões e auditoria legal. A nossa equipa possui vasta experiência na conceção e entrega de sistemas empresariais de gestão de obras em Portugal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-neutral-900">
                    Domínio do Setor da Construção Civil Portuguesa:
                  </h4>
                  <ul className="space-y-1.5 text-neutral-600 list-disc list-inside">
                    <li>Conformidade com Alvarás IMPIC e Código dos Contratos / Código Civil.</li>
                    <li>Aplicação rigorosa de IVA 6% para Reabilitação Urbana em ARU Porto (art. 18º CIVA) vs 23% geral.</li>
                    <li>Estruturação de Capítulos padronizados (Demolições, Alvenarias, Especiais, Pinturas).</li>
                    <li>Autos de Medição com retenção legal de 5% de garantia contratual.</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-neutral-900">
                    Histórico de Migração & Engenharia de Software:
                  </h4>
                  <ul className="space-y-1.5 text-neutral-600 list-disc list-inside">
                    <li>Transição fluida de no-code para bases relacionais sem interrupção operacional.</li>
                    <li>Modelos de IA generativa (Gemini) em ambiente servidor com telemetria e custo previsível.</li>
                    <li>Interface 100% em Português Europeu formal (pt-PT) sem termos em pt-BR.</li>
                    <li>Sistemas de auditoria para inspeções tributárias e garantias jurídicas.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Proposed Stack & Architecture */}
          {activeSection === 'stack' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <span className="font-bold text-neutral-900 block text-xs">Base de Dados & Persistência</span>
                  <div className="text-base font-bold text-neutral-900">PostgreSQL Relacional</div>
                  <p className="text-[11px] text-neutral-600">
                    PostgreSQL 16 com Drizzle ORM, restrições de integridade referencial (FKs), tipos numéricos exatos para valores monetários (DECIMAL) e JSONB para apontamentos flexíveis de vistoria.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <span className="font-bold text-neutral-900 block text-xs">Backend & Regras de Negócio</span>
                  <div className="text-base font-bold text-neutral-900">Node.js + TypeScript (Express)</div>
                  <p className="text-[11px] text-neutral-600">
                    Serviços transacionais com cálculo determinístico de IVA, BDI, comissões de parceiros e trilha de auditoria append-only imutável gravada no servidor.
                  </p>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <span className="font-bold text-neutral-900 block text-xs">Motor de IA & Multimodal</span>
                  <div className="text-base font-bold text-neutral-900">Google Gemini 3.8 Flash</div>
                  <p className="text-[11px] text-neutral-600">
                    Processamento de Mapas de Quantidades / Cadernos de Encargos em texto/PDF e transcrição de notas de voz de estaleiro com diagnóstico patológico em Português.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <h4 className="font-bold text-neutral-900">Garantias de Arquitetura & Boas Práticas:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-neutral-700">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ambientes separados (Desenvolvimento, Staging e Produção) com isolamento total.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Sincronização com Google Calendar e Microsoft 365 Exchange via APIs oficiais.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automação de testes de regressão para fórmulas financeiras e transições de estado.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Design responsivo otimizado para tablets e telemóveis dos encarregados em obra.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Phases, Timeline & Fixed Pricing */}
          {activeSection === 'phases' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Fase de Entrega</th>
                      <th className="py-2.5 px-3">Âmbito Principal & Entregáveis</th>
                      <th className="py-2.5 px-3 text-center">Prazo</th>
                      <th className="py-2.5 px-3 text-right">Preço Fixo (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    <tr>
                      <td className="py-3 px-3 font-bold text-neutral-900">
                        Fase 1: Fundação & CRM
                      </td>
                      <td className="py-3 px-3 text-neutral-700">
                        Modelação PostgreSQL, migração de dados do no-code, CRM com Quadro Kanban de oportunidades, gestão de parceiros com comissões automáticas, agendamento de visitas com sincronização de calendários (Google / Microsoft 365) e auditoria de logs.
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-neutral-600">
                        4 Semanas
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                        8.500 € + IVA
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-neutral-900">
                        Fase 2: Vistorias & Orçamentação IA
                      </td>
                      <td className="py-3 px-3 text-neutral-700">
                        Módulo móvel de vistoria no local (recolha de fotos, patologias e gravador de notas de voz com transcrição), motor de orçamentação analítica com capítulos e versionamento (v1.0, v1.1...), assistente Gemini para leitura de mapas de quantidades e exportação PDF/Excel.
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-neutral-600">
                        4 Semanas
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                        9.800 € + IVA
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-neutral-900">
                        Fase 3: Obras, Contratos & Portal
                      </td>
                      <td className="py-3 px-3 text-neutral-700">
                        Gestão de empreitadas e diário de estaleiro, geração e assinatura digital de minutas contratuais (Código Civil), emissão e aprovação de Autos de Medição com 5% de retenção, controlo de comissões de parceiros e Portal do Cliente/Dono de Obra.
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-neutral-600">
                        4 Semanas
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                        8.200 € + IVA
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-neutral-50 font-bold text-neutral-950 border-t border-neutral-200">
                    <tr>
                      <td colSpan={2} className="py-3 px-3">
                        Total do Projeto Chave-na-Mão (Garantia de 12 Meses):
                      </td>
                      <td className="py-3 px-3 text-center font-mono">12 Semanas (3 Meses)</td>
                      <td className="py-3 px-3 text-right font-mono text-sm text-amber-900">
                        26.500 € + IVA
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-3 bg-neutral-50 rounded-lg text-neutral-600 text-[11px]">
                <strong>Plano de Pagamentos por Marcos:</strong> 25% Adjudicação | 25% Conclusão Fase 1 | 25% Conclusão Fase 2 | 25% Entrada em Produção da Fase 3 e Formação da Equipa.
              </div>
            </div>
          )}

          {/* Section 4: Running Costs */}
          {activeSection === 'costs' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <h3 className="font-bold text-neutral-900 text-sm">
                  Estimativa Realista de Custos Operacionais Mensais (Cloud & Serviços)
                </h3>
                <p className="text-neutral-600">
                  Ao migrar de plataformas no-code (onde os custos escalam rapidamente por utilizador ou por ação), uma infraestrutura própria em Cloud moderna proporciona custos fixos, previsíveis e substancialmente inferiores:
                </p>

                <div className="overflow-x-auto border border-neutral-200 rounded-lg bg-white mt-2">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b border-neutral-200">
                      <tr>
                        <th className="py-2 px-3">Componente de Infraestrutura</th>
                        <th className="py-2 px-3">Especificação Técnica</th>
                        <th className="py-2 px-3 text-right">Custo Mensal Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      <tr>
                        <td className="py-2 px-3 font-bold text-neutral-900">Base de Dados PostgreSQL</td>
                        <td className="py-2 px-3 text-neutral-600">Cloud SQL (2 vCPU, 4GB RAM, Backups automáticos diários)</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">~45 € / mês</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-neutral-900">Servidores de Aplicação & Web</td>
                        <td className="py-2 px-3 text-neutral-600">Cloud Run / Container com escala automática e auto-cura</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">~30 € / mês</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-neutral-900">Armazenamento de Ficheiros & Fotos</td>
                        <td className="py-2 px-3 text-neutral-600">Google Cloud Storage (fotos de vistorias, áudios e contratos)</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">~15 € / mês</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-neutral-900">Consumo de IA (Gemini Flash)</td>
                        <td className="py-2 px-3 text-neutral-600">~250 processamentos mensais de mapas e vistorias</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">~20 € / mês</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-neutral-50 font-bold border-t border-neutral-200">
                      <tr>
                        <td colSpan={2} className="py-2 px-3 text-neutral-900">
                          Total Estimado de Infraestrutura Cloud:
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-700">
                          ~110 € / mês
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Maintenance Model & SLA */}
          {activeSection === 'sla' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-neutral-900 text-sm">
                    Suporte Corretivo & Garantia de Nível de Serviço (SLA):
                  </h4>
                  <ul className="space-y-1.5 text-neutral-600 text-[11px]">
                    <li><strong>Incidente Crítico (P1 - Sistema Inoperacional):</strong> Resposta em até 2 horas úteis e resolução com prioridade máxima.</li>
                    <li><strong>Incidente Médio (P2 - Degradação de funcionalidade):</strong> Resposta em até 8 horas úteis.</li>
                    <li><strong>Pedidos de Suporte Geral (P3):</strong> Resposta em até 24 horas úteis.</li>
                    <li>Monitorização 24/7 com alertas automáticos de disponibilidade.</li>
                  </ul>
                </div>

                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-neutral-900 text-sm">
                    Manutenção Preventiva & Evolutiva:
                  </h4>
                  <ul className="space-y-1.5 text-neutral-600 text-[11px]">
                    <li>Backups diários automatizados com retenção de 30 dias e teste mensal de restauro.</li>
                    <li>Atualizações periódicas de patches de segurança e dependências do Node.js/PostgreSQL.</li>
                    <li>Pacote opcional de suporte contínuo: <strong>450 € / mês</strong> (inclui 8 horas de desenvolvimento evolutivo e suporte prioritário).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            Proposta válida por 30 dias · Elaborada com base no caderno de encargos da empresa.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Fechar Proposta
          </button>
        </div>
      </div>
    </div>
  );
};
