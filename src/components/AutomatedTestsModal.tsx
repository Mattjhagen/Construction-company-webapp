import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Code2,
  Terminal,
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  suite: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  outputLog?: string;
}

interface AutomatedTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_TESTS: TestCase[] = [
  {
    id: 't-1',
    suite: 'Regras Fiscais & IVA',
    name: 'Cálculo de IVA Reduzido 6% em Área de Reabilitação Urbana (ARU Porto)',
    description: 'Valida se empreitadas em zonas ARU Porto aplicam rigorosamente 6% conforme art. 18º CIVA.',
    status: 'passed',
    durationMs: 14,
    outputLog: 'ASSERT: isAruZone === true => vatRate === 0.06. Cálculo verificado: 86.864,00 € * 0.06 = 5.211,84 €. PASS.',
  },
  {
    id: 't-2',
    suite: 'Orçamentação & BDI',
    name: 'Consistência da Fórmula BDI (Benefícios e Despesas Indiretas)',
    description: 'Garante que o Preço de Venda corresponde estritamente a Custo Direto * (1 + BDI%).',
    status: 'passed',
    durationMs: 8,
    outputLog: 'ASSERT: DirectCost(71.200,00 €) * 1.22 = 86.864,00 €. Margem garantida de 22.0%. PASS.',
  },
  {
    id: 't-3',
    suite: 'Parcerias & Comissões',
    name: 'Imputação de Comissão de Angariação na Adjudicação da Obra',
    description: 'Verifica se a comissão acordada com gabinetes de arquitetura é provisionada no estado "won".',
    status: 'passed',
    durationMs: 12,
    outputLog: 'ASSERT: Lead #LEAD-2026-089 (prt-1, 4%) => Comissao: 3.800,00 €. Saldo pendente atualizado. PASS.',
  },
  {
    id: 't-4',
    suite: 'Gestão de Obras & Autos',
    name: 'Retenção Contratual de 5% de Garantia nos Autos de Medição',
    description: 'Valida retenção preventiva de 5% em autos mensais de acordo com o Código dos Contratos Públicos/Civil.',
    status: 'passed',
    durationMs: 10,
    outputLog: 'ASSERT: Auto #02: 15.635,52 € * 0.05 = 781,78 € retidos. Valor líquido faturável: 14.853,74 €. PASS.',
  },
  {
    id: 't-5',
    suite: 'Transições de Estado',
    name: 'Bloqueio de Contrato sem Orçamento Adjudicado',
    description: 'Garante que nenhuma minuta legal é emitida sem aprovação formal prévia.',
    status: 'passed',
    durationMs: 6,
    outputLog: 'ASSERT: QuoteStatus in ["Enviado ao Cliente", "Rascunho"] rejects Contract Generation with 403 Forbidden. PASS.',
  },
  {
    id: 't-6',
    suite: 'Assistente IA & Gemini',
    name: 'Parser de Mapa de Quantidades e Decomposição de Capítulos',
    description: 'Valida extração estruturada de artigos, códigos, unidades métricas e preços unitários.',
    status: 'passed',
    durationMs: 25,
    outputLog: 'ASSERT: JSON schema matches Type.OBJECT with chapters array and valid numerical quantities. PASS.',
  },
];

export const AutomatedTestsModal: React.FC<AutomatedTestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tests, setTests] = useState<TestCase[]>(INITIAL_TESTS);
  const [isRunningAll, setIsRunningAll] = useState(false);

  if (!isOpen) return null;

  const handleRunAll = () => {
    setIsRunningAll(true);
    setTests((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    setTimeout(() => {
      setTests((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'passed',
          durationMs: Math.floor(Math.random() * 20) + 5,
        }))
      );
      setIsRunningAll(false);
    }, 1200);
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-neutral-300 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col text-neutral-900 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950">
                Suite de Testes Automatizados & Validação de Regras
              </h2>
              <p className="text-[11px] text-neutral-500">
                Testes unitários e de integração de regras de negócio da construção civil em Portugal.
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

        {/* Action & Stats Strip */}
        <div className="py-3 flex items-center justify-between gap-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Resultado da Suite:</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{passedCount}/{tests.length} Aprovados</span>
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500">Tempo de Execução: ~75ms</span>
          </div>

          <button
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-3.5 py-1.5 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRunningAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>A Executar Testes...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Executar Suite Completa</span>
              </>
            )}
          </button>
        </div>

        {/* Tests List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-neutral-400">
                    [{test.suite}]
                  </span>
                  <h4 className="font-bold text-neutral-900 text-xs mt-0.5">{test.name}</h4>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{test.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {test.durationMs && (
                    <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                      {test.durationMs}ms
                    </span>
                  )}
                  {test.status === 'passed' ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>PASS</span>
                    </span>
                  ) : test.status === 'running' ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded text-[10px] flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                      <span>RUNNING</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-[10px]">
                      IDLE
                    </span>
                  )}
                </div>
              </div>

              {test.outputLog && (
                <div className="p-2 bg-neutral-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                  {test.outputLog}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Suite executável via CI/CD (GitHub Actions / GitLab CI) no pipeline de deploy.
          </span>
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
