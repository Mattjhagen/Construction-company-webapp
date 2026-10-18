import React, { useState } from 'react';
import {
  Quote,
  QuoteVersion,
  QuoteChapter,
  QuoteItem,
} from '../types';
import {
  FileSpreadsheet,
  FileText,
  Sparkles,
  Download,
  Copy,
  Printer,
  History,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Building,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface QuoteBuilderViewProps {
  quotes: Quote[];
  onUpdateQuote: (quote: Quote) => void;
  onAddAuditLog: (action: any, entity: any, id: string, details: string) => void;
}

export const QuoteBuilderView: React.FC<QuoteBuilderViewProps> = ({
  quotes,
  onUpdateQuote,
  onAddAuditLog,
}) => {
  const [selectedQuote, setSelectedQuote] = useState<Quote>(quotes[0]);
  const [activeVersionNumber, setActiveVersionNumber] = useState<string>(
    selectedQuote.currentVersion
  );
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // AI BoQ Parser state
  const [rawBoqText, setRawBoqText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [parsedBoqResult, setParsedBoqResult] = useState<any>(null);

  // Current active version
  const currentVersion =
    selectedQuote.versions.find((v) => v.version === activeVersionNumber) ||
    selectedQuote.versions[0];

  // Recalculate totals for active version
  const recalculateVersion = (chapters: QuoteChapter[], bdiPercent: number, vatRate: number): QuoteVersion => {
    let directCost = 0;
    chapters.forEach((ch) => {
      ch.items.forEach((it) => {
        directCost += it.quantity * it.unitCost;
      });
    });

    const sellingPrice = directCost * (1 + bdiPercent / 100);
    const vatAmount = sellingPrice * vatRate;
    const grandTotal = sellingPrice + vatAmount;

    return {
      ...currentVersion,
      chapters,
      subtotalDirectCost: Math.round(directCost * 100) / 100,
      bdiPercent,
      subtotalSellingPrice: Math.round(sellingPrice * 100) / 100,
      vatRate,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  };

  const handleItemChange = (chapterId: string, itemId: string, field: keyof QuoteItem, value: any) => {
    const updatedChapters = currentVersion.chapters.map((ch) => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        items: ch.items.map((it) => {
          if (it.id !== itemId) return it;
          const updatedItem = { ...it, [field]: value };
          if (field === 'quantity' || field === 'unitCost' || field === 'markupPercent') {
            const markup = field === 'markupPercent' ? value : it.markupPercent;
            const cost = field === 'unitCost' ? value : it.unitCost;
            const qty = field === 'quantity' ? value : it.quantity;
            updatedItem.unitPrice = Math.round(cost * (1 + markup / 100) * 100) / 100;
            updatedItem.totalPrice = Math.round(qty * updatedItem.unitPrice * 100) / 100;
          }
          return updatedItem;
        }),
      };
    });

    const updatedVer = recalculateVersion(updatedChapters, currentVersion.bdiPercent, currentVersion.vatRate);
    const updatedQuote: Quote = {
      ...selectedQuote,
      versions: selectedQuote.versions.map((v) => (v.version === currentVersion.version ? updatedVer : v)),
    };
    setSelectedQuote(updatedQuote);
    onUpdateQuote(updatedQuote);
  };

  const handleToggleVat = (rate: number) => {
    const updatedVer = recalculateVersion(currentVersion.chapters, currentVersion.bdiPercent, rate);
    const updatedQuote: Quote = {
      ...selectedQuote,
      versions: selectedQuote.versions.map((v) => (v.version === currentVersion.version ? updatedVer : v)),
    };
    setSelectedQuote(updatedQuote);
    onUpdateQuote(updatedQuote);
    onAddAuditLog(
      'UPDATE',
      'Orçamento',
      selectedQuote.code,
      `Alteração da taxa de IVA para ${(rate * 100).toFixed(0)}% na versão ${currentVersion.version}.`
    );
  };

  const handleCreateNewVersion = () => {
    const newVersionNumber = (parseFloat(currentVersion.version) + 0.1).toFixed(1);
    const newVer: QuoteVersion = {
      ...currentVersion,
      version: newVersionNumber,
      createdAt: new Date().toISOString().split('T')[0],
      author: 'Eng. Tiago Silva',
      notes: `Nova revisão criada a partir da versão ${currentVersion.version}`,
    };

    const updatedQuote: Quote = {
      ...selectedQuote,
      currentVersion: newVersionNumber,
      versions: [...selectedQuote.versions, newVer],
    };

    setSelectedQuote(updatedQuote);
    setActiveVersionNumber(newVersionNumber);
    onUpdateQuote(updatedQuote);
    onAddAuditLog(
      'CREATE',
      'Orçamento',
      selectedQuote.code,
      `Criada nova versão ${newVersionNumber} do orçamento ${selectedQuote.code}.`
    );
  };

  const handleRunAiBoq = async () => {
    if (!rawBoqText) return;
    setIsAiProcessing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/parse-quantities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawBoqText,
          documentTitle: selectedQuote.title,
          contextNotes: 'Edifício no Porto, com pedra de granito e vigamento de castanho.',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao processar mapa de quantidades');
      setParsedBoqResult(data);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleApplyAiChapters = () => {
    if (!parsedBoqResult?.chapters) return;

    const newChapters: QuoteChapter[] = parsedBoqResult.chapters.map((ch: any, idx: number) => ({
      id: `c-ai-${idx}-${Date.now()}`,
      number: `0${idx + 1}`,
      title: ch.chapterName,
      items: ch.items.map((it: any, itemIdx: number) => ({
        id: `it-ai-${idx}-${itemIdx}-${Date.now()}`,
        code: it.code || `0${idx + 1}.0${itemIdx + 1}`,
        description: it.description,
        unit: it.unit || 'm²',
        quantity: it.quantity || 1,
        unitCost: it.unitPrice ? Math.round(it.unitPrice * 0.78 * 100) / 100 : 20,
        markupPercent: 22,
        unitPrice: it.unitPrice || 25,
        totalPrice: it.totalPrice || it.quantity * (it.unitPrice || 25),
      })),
    }));

    const updatedVer = recalculateVersion(newChapters, currentVersion.bdiPercent, currentVersion.vatRate);
    const updatedQuote: Quote = {
      ...selectedQuote,
      versions: selectedQuote.versions.map((v) => (v.version === currentVersion.version ? updatedVer : v)),
    };
    setSelectedQuote(updatedQuote);
    onUpdateQuote(updatedQuote);
    setShowAiModal(false);
    onAddAuditLog(
      'AI_EXECUTION',
      'Orçamento',
      selectedQuote.code,
      `Importadas ${newChapters.length} secções do Mapa de Quantidades via assistente Gemini 3.8 Flash.`
    );
  };

  const handleExportCsv = () => {
    let csv = 'Capitulo;Codigo;Descricao;Unidade;Quantidade;Custo_Unitario;Margem_Percent;Preco_Venda_Unitario;Total_EUR\n';
    currentVersion.chapters.forEach((ch) => {
      ch.items.forEach((it) => {
        csv += `"${ch.title}";"${it.code}";"${it.description.replace(/"/g, '""')}";"${it.unit}";${it.quantity};${it.unitCost};${it.markupPercent};${it.unitPrice};${it.totalPrice}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orcamento_${selectedQuote.code}_v${currentVersion.version}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
            <span>Orçamentação Analítica</span>
            <span>·</span>
            <span>Versões & Caderno de Encargos</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              {selectedQuote.code} — {selectedQuote.title}
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-0.5">
            Cliente: <strong className="text-neutral-800">{selectedQuote.clientName}</strong> (NIF: {selectedQuote.clientNif}) · {selectedQuote.address}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version Switcher Buttons */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-lg border border-neutral-200">
            {selectedQuote.versions.map((ver) => (
              <button
                key={ver.version}
                onClick={() => setActiveVersionNumber(ver.version)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeVersionNumber === ver.version
                    ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                v{ver.version}
              </button>
            ))}
            <button
              onClick={handleCreateNewVersion}
              title="Clonar e criar nova versão (revisão de proposta)"
              className="p-1 hover:bg-white rounded text-neutral-600 hover:text-neutral-900 transition-colors ml-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Reader Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Assistente IA Mapa de Quantidades</span>
          </button>

          {/* Export to CSV */}
          <button
            onClick={handleExportCsv}
            title="Exportar Mapa de Quantidades em formato Excel/CSV"
            className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Print Proposal PDF */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Imprimir Proposta PDF</span>
          </button>
        </div>
      </div>

      {/* Version Notes & VAT / ARU Control Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="font-semibold text-amber-950 flex items-center gap-2">
            <span>Registo da Versão {currentVersion.version}</span>
            <span>·</span>
            <span className="font-normal text-amber-900">Autor: {currentVersion.author} ({currentVersion.createdAt})</span>
          </div>
          <p className="text-amber-800 mt-0.5">{currentVersion.notes}</p>
        </div>

        {/* VAT Rate Selection (ARU 6% vs Normal 23%) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-amber-950 font-medium">Regime de IVA:</span>
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-amber-300">
            <button
              onClick={() => handleToggleVat(0.06)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currentVersion.vatRate === 0.06
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              6% (ARU Porto)
            </button>
            <button
              onClick={() => handleToggleVat(0.23)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currentVersion.vatRate === 0.23
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              23% (Taxa Normal)
            </button>
          </div>
        </div>
      </div>

      {/* Chapters & Items Table */}
      <div className="space-y-4">
        {currentVersion.chapters.map((chapter) => {
          const chapterTotal = chapter.items.reduce((acc, it) => acc + it.totalPrice, 0);

          return (
            <div
              key={chapter.id}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs"
            >
              {/* Chapter Header */}
              <div className="px-5 py-3.5 bg-neutral-50/90 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-neutral-900 text-white text-xs font-mono font-bold flex items-center justify-center">
                    {chapter.number}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900">{chapter.title}</h3>
                </div>
                <div className="text-xs font-bold text-neutral-900 tabular-nums">
                  Subtotal: {chapterTotal.toLocaleString('pt-PT')} €
                </div>
              </div>

              {/* Items List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100/60 text-neutral-500 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-4 w-16">Artigo</th>
                      <th className="py-2.5 px-4">Descrição dos Trabalhos</th>
                      <th className="py-2.5 px-3 text-center w-20">Unidade</th>
                      <th className="py-2.5 px-3 text-right w-24">Quant.</th>
                      <th className="py-2.5 px-3 text-right w-28">Custo (€)</th>
                      <th className="py-2.5 px-3 text-right w-24">BDI %</th>
                      <th className="py-2.5 px-3 text-right w-28">P. Unit (€)</th>
                      <th className="py-2.5 px-4 text-right w-32">Total s/ IVA (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {chapter.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-neutral-400 font-medium">
                          {item.code}
                        </td>
                        <td className="py-3 px-4 text-neutral-800 font-medium max-w-md">
                          {item.description}
                        </td>
                        <td className="py-3 px-3 text-center text-neutral-500 font-mono text-[11px]">
                          {item.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-900 font-medium">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(chapter.id, item.id, 'quantity', parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-right tabular-nums focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) =>
                              handleItemChange(chapter.id, item.id, 'unitCost', parseFloat(e.target.value) || 0)
                            }
                            className="w-20 px-1.5 py-0.5 border border-neutral-200 rounded text-right tabular-nums focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-500">
                          {item.markupPercent}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-800">
                          {item.unitPrice.toFixed(2)} €
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                          {item.totalPrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary Box */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs max-w-lg ml-auto space-y-3 text-xs">
        <h4 className="font-bold text-neutral-900 text-sm pb-2 border-b border-neutral-100">
          Quadro Resumo Financeiro da Proposta
        </h4>

        <div className="flex justify-between text-neutral-600">
          <span>Custo Direto de Produção (Mão de Obra + Materiais):</span>
          <span className="font-mono tabular-nums font-medium text-neutral-900">
            {currentVersion.subtotalDirectCost.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
          </span>
        </div>

        <div className="flex justify-between text-neutral-600">
          <span>Margem BDI Aplicada ({currentVersion.bdiPercent}%):</span>
          <span className="font-mono tabular-nums font-medium text-neutral-900">
            {(currentVersion.subtotalSellingPrice - currentVersion.subtotalDirectCost).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
          </span>
        </div>

        <div className="flex justify-between font-semibold text-neutral-900 pt-2 border-t border-neutral-100">
          <span>Total de Venda (sem IVA):</span>
          <span className="font-mono tabular-nums text-sm">
            {currentVersion.subtotalSellingPrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
          </span>
        </div>

        <div className="flex justify-between text-neutral-600">
          <span>
            IVA ({currentVersion.vatRate === 0.06 ? 'Taxa Reduzida ARU Porto 6%' : 'Taxa Normal 23%'}):
          </span>
          <span className="font-mono tabular-nums text-neutral-900">
            {currentVersion.vatAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
          </span>
        </div>

        <div className="flex justify-between font-bold text-neutral-950 text-base pt-3 border-t-2 border-neutral-900">
          <span>Valor Global da Empreitada:</span>
          <span className="font-mono tabular-nums text-lg text-amber-900">
            {currentVersion.grandTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
          </span>
        </div>
      </div>

      {/* AI Assistant Modal for Reading Bills of Quantities */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-neutral-900">
                  Assistente de IA para Leitura de Mapa de Quantidades
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Cole o texto do caderno de encargos, medições do arquiteto ou tabela de quantidades. O modelo Gemini 3.8 Flash analisa a descrição, decompõe em capítulos, deduz unidades e calcula estimativas de preços de referência para o mercado do Porto.
              </p>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-neutral-700">Texto / Lista de Medições</label>
                  <button
                    onClick={() =>
                      setRawBoqText(`Capítulo 1 - Demolições
1.1 Demolição de paredes interiores em tabique com 15cm de espessura e carga a vazadouro: 75 m2
1.2 Levantamento cuidadoso de soalho antigo em pinho bravo: 110 m2
1.3 Remoção de canalizações de ferro galvanizado e esgotos de chumbo: 1 verba

Capítulo 2 - Alvenarias e Isolamentos
2.1 Execução de alvenaria em placa dupla de gesso cartonado com isolamento térmico em lã de rocha: 140 m2
2.2 Tratamento impermeabilizante contra humidade ascensional por injeção em cantarias: 25 ml

Capítulo 3 - Instalações Especiais
3.1 Pré-instalação de sistema multisplit de climatização em conduta: 4 unidades
3.2 Execução de nova rede de águas em multicamada e esgotos em PVC insonorizado: 1 verba`)
                    }
                    className="text-neutral-500 hover:text-neutral-800 underline text-[11px]"
                  >
                    Preencher Exemplo de Obra no Porto
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={rawBoqText}
                  onChange={(e) => setRawBoqText(e.target.value)}
                  placeholder="Cole aqui o texto do Mapa de Quantidades ou Caderno de Encargos..."
                  className="w-full p-3 font-mono text-xs border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                  {aiError}
                </div>
              )}

              {parsedBoqResult && (
                <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                  <div className="font-bold text-neutral-900">
                    Resultado da Estruturação pelo Gemini:
                  </div>
                  <p className="text-[11px] text-neutral-600">{parsedBoqResult.summary}</p>
                  <div className="text-[11px] font-semibold text-emerald-700">
                    ✓ {parsedBoqResult.chapters?.length} Capítulos identificados com artigos orçamentados
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Fechar
                </button>

                {!parsedBoqResult ? (
                  <button
                    onClick={handleRunAiBoq}
                    disabled={!rawBoqText || isAiProcessing}
                    className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAiProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>A Analisar com Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Estruturar Mapa de Quantidades</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleApplyAiChapters}
                    className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aplicar ao Orçamento Ativo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable PDF Commercial Proposal Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-300 rounded-xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8 text-neutral-900">
            {/* Header Document */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-neutral-900">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-950">
                  EdificaPorto — Construção e Reabilitação, Lda.
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Avenida da Boavista, 1200 · 4100-112 Porto · NIF 514 892 103 · Alvará IMPIC nº 89412
                </p>
                <div className="mt-3 text-xs">
                  <span className="font-semibold text-neutral-800">PROPOSTA COMERCIAL & ORÇAMENTO DE EMPREITADA</span>
                  <div className="font-mono text-neutral-600 font-bold">{selectedQuote.code} (v{currentVersion.version})</div>
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="text-neutral-500">Data de Emissão:</div>
                <div className="font-bold text-neutral-900 tabular-nums">{currentVersion.createdAt}</div>
                <div className="text-neutral-500 mt-1">Validade da Proposta:</div>
                <div className="font-semibold text-neutral-900 tabular-nums">{selectedQuote.validUntil}</div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-neutral-500 block">Dono de Obra / Cliente:</span>
                <strong className="text-neutral-900 text-sm block">{selectedQuote.clientName}</strong>
                <span className="text-neutral-600">NIF: {selectedQuote.clientNif}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Localização dos Trabalhos:</span>
                <strong className="text-neutral-900 block">{selectedQuote.address}</strong>
                <span className="text-amber-800 font-medium">
                  {selectedQuote.isAruZone ? 'Localizado em Área de Reabilitação Urbana (ARU)' : 'Zona Geral'}
                </span>
              </div>
            </div>

            {/* Chapters Brief Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Resumo por Capítulos da Empreitada
              </h3>
              <table className="w-full text-left text-xs border border-neutral-200">
                <thead className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="p-2 w-16">Cap.</th>
                    <th className="p-2">Designação dos Trabalhos</th>
                    <th className="p-2 text-right">Valor Líquido (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {currentVersion.chapters.map((ch) => {
                    const total = ch.items.reduce((acc, it) => acc + it.totalPrice, 0);
                    return (
                      <tr key={ch.id}>
                        <td className="p-2 font-mono text-neutral-500">{ch.number}</td>
                        <td className="p-2 font-medium text-neutral-800">{ch.title}</td>
                        <td className="p-2 text-right font-mono tabular-nums font-semibold text-neutral-900">
                          {total.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Final Totals Table */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-xs space-y-1.5 ml-auto max-w-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal Empreitada (sem IVA):</span>
                <span className="font-mono tabular-nums font-semibold text-neutral-900">
                  {currentVersion.subtotalSellingPrice.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>IVA ({(currentVersion.vatRate * 100).toFixed(0)}%):</span>
                <span className="font-mono tabular-nums text-neutral-900">
                  {currentVersion.vatAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="flex justify-between font-bold text-neutral-950 text-sm pt-2 border-t border-neutral-300">
                <span>Total com IVA:</span>
                <span className="font-mono tabular-nums text-base text-amber-950">
                  {currentVersion.grandTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="pt-4 border-t border-neutral-200 text-[11px] text-neutral-600 space-y-2">
              <div className="font-semibold text-neutral-800">Condições Contratuais & Garantia:</div>
              <p>
                1. Condições de Pagamento: {selectedQuote.paymentTerms}.<br />
                2. Prazo Previsto de Execução: {selectedQuote.leadTimeWeeks} semanas a contar da data de consignação da obra.<br />
                3. Garantia legal da empreitada: 5 anos para trabalhos de acabamentos e 10 anos para elementos estruturais conforme Código Civil Português.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg text-xs"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg text-xs hover:bg-neutral-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Gravar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
