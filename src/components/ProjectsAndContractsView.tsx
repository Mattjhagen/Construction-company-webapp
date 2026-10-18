import React, { useState } from 'react';
import {
  ConstructionProject,
  LegalContract,
  Partner,
  DailySiteLog,
  MeasurementCertificate,
  PaymentMilestone,
} from '../types';
import {
  HardHat,
  FileCheck2,
  Calendar,
  DollarSign,
  TrendingUp,
  CloudSun,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface ProjectsAndContractsViewProps {
  projects: ConstructionProject[];
  contract: LegalContract;
  partners: Partner[];
  onUpdateProject: (proj: ConstructionProject) => void;
  onUpdateContract: (contract: LegalContract) => void;
  onAddAuditLog: (action: any, entity: any, id: string, details: string) => void;
}

export const ProjectsAndContractsView: React.FC<ProjectsAndContractsViewProps> = ({
  projects,
  contract,
  partners,
  onUpdateProject,
  onUpdateContract,
  onAddAuditLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'site_management' | 'measurement_certs' | 'contracts' | 'commissions'>(
    'site_management'
  );
  const [selectedProject, setSelectedProject] = useState<ConstructionProject>(projects[0]);
  const [showNewLogModal, setShowNewLogModal] = useState(false);

  // New Daily Log state
  const [logWeather, setLogWeather] = useState<DailySiteLog['weather']>('Ensolarado');
  const [logTemp, setLogTemp] = useState(19);
  const [logHeadcount, setLogHeadcount] = useState(8);
  const [logTasks, setLogTasks] = useState('');

  // Handle Approving a Measurement Certificate
  const handleApproveCertificate = (certId: string) => {
    const updatedCerts = selectedProject.measurementCertificates.map((cert) => {
      if (cert.id !== certId) return cert;
      return {
        ...cert,
        status: 'Aprovado pela Fiscalização' as const,
        approvedByDirector: true,
      };
    });

    const updatedProject = {
      ...selectedProject,
      measurementCertificates: updatedCerts,
    };
    setSelectedProject(updatedProject);
    onUpdateProject(updatedProject);
    onAddAuditLog(
      'APPROVAL',
      'Auto de Medição',
      certId,
      `Auto de medição aprovado pelo Diretor de Obra ${selectedProject.directorOfWorks}.`
    );
  };

  const handleAddDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailySiteLog = {
      id: `dl-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weather: logWeather,
      temperatureC: logTemp,
      headcountOnSite: logHeadcount,
      subcontractors: ['Equipa Geral EdificaPorto'],
      tasksCompleted: logTasks.split('\n').filter(Boolean),
      safetyCompliant: true,
      photos: [],
    };

    const updatedProject = {
      ...selectedProject,
      dailyLogs: [newLog, ...selectedProject.dailyLogs],
    };
    setSelectedProject(updatedProject);
    onUpdateProject(updatedProject);
    setShowNewLogModal(false);
    setLogTasks('');
    onAddAuditLog(
      'CREATE',
      'Obra',
      selectedProject.code,
      `Novo registo de Diário de Obra submetido para a data ${newLog.date}.`
    );
  };

  const handleSignContract = () => {
    const updated = {
      ...contract,
      status: 'Assinado e Válido' as const,
      signedByClient: true,
      signedByContractor: true,
    };
    onUpdateContract(updated);
    onAddAuditLog(
      'APPROVAL',
      'Contrato',
      contract.contractNumber,
      `Contrato de Empreitada ${contract.contractNumber} formalizado e assinado digitalmente.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
            <span>Direção de Obras & Jurídico</span>
            <span>·</span>
            <span>Alvará IMPIC nº 89412 - Classe 4</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Gestão de Empreitadas, Autos de Medição & Contratos
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Controlo de execução em estaleiro, livro de obra, aprovação de autos mensais com retenção de garantia e contratos legais.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-lg border border-neutral-200 text-xs">
          <button
            onClick={() => setActiveSubTab('site_management')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeSubTab === 'site_management'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Diário de Obra
          </button>
          <button
            onClick={() => setActiveSubTab('measurement_certs')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeSubTab === 'measurement_certs'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Autos de Medição
          </button>
          <button
            onClick={() => setActiveSubTab('contracts')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeSubTab === 'contracts'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Contratos de Empreitada
          </button>
          <button
            onClick={() => setActiveSubTab('commissions')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeSubTab === 'commissions'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Comissões de Parceiros
          </button>
        </div>
      </div>

      {/* Subtab 1: Site Management & Daily Logs */}
      {activeSubTab === 'site_management' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Project Summary Banner */}
          <div className="lg:col-span-12 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-neutral-400 font-mono">{selectedProject.code}</span>
                <h3 className="text-lg font-bold text-neutral-900">{selectedProject.title}</h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {selectedProject.address} · Diretor Técnico: <strong>{selectedProject.directorOfWorks}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-neutral-500 block">Progresso Físico</span>
                  <span className="font-bold text-neutral-900 tabular-nums text-base">
                    {selectedProject.progressPercent}%
                  </span>
                </div>
                <button
                  onClick={() => setShowNewLogModal(true)}
                  className="px-3 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Diário de Obra</span>
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all"
                style={{ width: `${selectedProject.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Daily Logs Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-600" />
                <span>Livro de Obra / Diário de Estaleiro Digital</span>
              </h4>

              <div className="space-y-4">
                {selectedProject.dailyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between font-bold text-neutral-900 pb-2 border-b border-neutral-200">
                      <div className="flex items-center gap-2">
                        <span>Data: {log.date}</span>
                        <span>·</span>
                        <span className="text-neutral-600 font-medium flex items-center gap-1">
                          <CloudSun className="w-3.5 h-3.5 text-amber-600" />
                          <span>{log.weather} ({log.temperatureC}ºC)</span>
                        </span>
                      </div>
                      <div className="text-neutral-600 font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{log.headcountOnSite} Oficiais em Obra</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-neutral-800 block mb-1">
                        Trabalhos Executados:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-neutral-700">
                        {log.tasksCompleted.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    {log.photos && log.photos.length > 0 && (
                      <div className="pt-2">
                        <img
                          src={log.photos[0]}
                          alt="Registo diário"
                          className="h-28 w-44 object-cover rounded-lg border border-neutral-300"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Metrics & Active Subcontractors */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-neutral-900 text-sm">Controlo Financeiro da Obra</h4>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Valor Contratual:</span>
                <span className="font-mono tabular-nums font-semibold text-neutral-900">
                  {selectedProject.contractValueExVat.toLocaleString('pt-PT')} €
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Total Executado e Aprovado:</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  {selectedProject.executedValue.toLocaleString('pt-PT')} €
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Desvio de Custos:</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  {selectedProject.costDeviationPercent}% (Sem Derrapagem)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-neutral-500">Retenção de Garantia (5%):</span>
                <span className="font-mono tabular-nums font-semibold text-amber-800">
                  {(selectedProject.contractValueExVat * 0.05).toLocaleString('pt-PT')} €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Measurement Certificates (Autos de Medição) */}
      {activeSubTab === 'measurement_certs' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Autos de Medição Mensais da Empreitada
              </h3>
              <p className="text-xs text-neutral-500">
                Regulados segundo o regime jurídico de empreitadas de obras particulares. Retenção de 5% de garantia contratual até ao Auto de Receção Definitiva.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Auto de Medição</th>
                  <th className="py-2.5 px-3">Período de Referência</th>
                  <th className="py-2.5 px-3 text-right">Trabalhos Concluídos</th>
                  <th className="py-2.5 px-3 text-right">% Acumulada</th>
                  <th className="py-2.5 px-3 text-right">Retenção Garantia (5%)</th>
                  <th className="py-2.5 px-3 text-right">Valor Líquido a Pagar</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {selectedProject.measurementCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-bold text-neutral-900">{cert.certificateNumber}</td>
                    <td className="py-3 px-3 text-neutral-600">{cert.period} ({cert.date})</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-neutral-800">
                      {cert.workCompletedAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900">
                      {cert.cumulativePercentage}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-800">
                      -{cert.retentionGuaranteeAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                      {cert.netPayableAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cert.status === 'Pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {cert.status !== 'Pago' && !cert.approvedByDirector && (
                        <button
                          onClick={() => handleApproveCertificate(cert.id)}
                          className="px-2.5 py-1 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-800 transition-colors text-[11px]"
                        >
                          Aprovar Auto
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Legal Contracts */}
      {activeSubTab === 'contracts' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6 text-xs max-w-4xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div>
              <span className="font-mono text-[10px] text-neutral-400">{contract.contractNumber}</span>
              <h3 className="text-base font-bold text-neutral-900">{contract.projectTitle}</h3>
              <p className="text-xs text-neutral-600">
                Minuta de Contrato de Empreitada de Obras Particulares elaborada conforme o Código Civil Português (Art. 1207º e seguintes).
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded text-xs">
                {contract.status}
              </span>
            </div>
          </div>

          {/* Legal Parties Accord */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div>
              <span className="font-bold text-neutral-900 block mb-1">PRIMEIRO OUTORGANTE (Dono da Obra):</span>
              <div className="space-y-0.5 text-neutral-700">
                <div><strong>{contract.clientName}</strong></div>
                <div>NIF: {contract.clientNif}</div>
                <div>Morada: {contract.clientAddress}</div>
              </div>
            </div>
            <div>
              <span className="font-bold text-neutral-900 block mb-1">SEGUNDO OUTORGANTE (Empreiteiro):</span>
              <div className="space-y-0.5 text-neutral-700">
                <div><strong>{contract.contractorName}</strong></div>
                <div>NIF: {contract.contractorNif}</div>
                <div>{contract.contractorAlvara}</div>
                <div>Sede: {contract.contractorAddress}</div>
              </div>
            </div>
          </div>

          {/* Contract Clauses */}
          <div className="space-y-3 text-neutral-700 leading-relaxed">
            <div>
              <h4 className="font-bold text-neutral-900">CLÁUSULA 1ª (Objeto e Preço da Empreitada):</h4>
              <p>
                O Segundo Outorgante obriga-se a executar a empreitada pelo preço global de{' '}
                <strong className="text-neutral-900">{contract.totalValueExVat.toLocaleString('pt-PT')} €</strong> (acrescido de IVA à taxa legal em vigor de {(contract.vatRate * 100).toFixed(0)}%, totalizando {contract.totalValueWithVat.toLocaleString('pt-PT')} €).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900">CLÁUSULA 2ª (Prazos de Execução):</h4>
              <p>
                O prazo de execução da obra é de <strong className="text-neutral-900">{contract.workDurationDays} dias úteis</strong>, com início na data de assinatura do Auto de Consignação dos Trabalhos.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900">CLÁUSULA 3ª (Garantia das Obras):</h4>
              <p>
                O prazo de garantia dos trabalhos de construção e reabilitação é de <strong>5 (cinco) anos</strong> para elementos gerais e defeitos de acabamento, e <strong>10 (dez) anos</strong> para defeitos em elementos estruturais da construção.
              </p>
            </div>
          </div>

          {/* Digital Signature Panel */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-neutral-500 text-[11px]">
              Assinatura com Chave Móvel Digital / Cartão de Cidadão ou Certificado Qualificado
            </div>
            <button
              onClick={handleSignContract}
              className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assinar Digitalmente Minuta</span>
            </button>
          </div>
        </div>
      )}

      {/* Subtab 4: Referral Partner Commissions */}
      {activeSubTab === 'commissions' && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Registo e Liquidação de Comissões de Angariação
              </h3>
              <p className="text-xs text-neutral-500">
                Comissões calculadas sobre o valor de adjudicação da obra (excluindo IVA), liquidadas após a cobrança das respetivas faturas ao cliente.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Parceiro Referenciador</th>
                  <th className="py-2.5 px-3">Tipo de Parceria</th>
                  <th className="py-2.5 px-3">Contacto / NIF</th>
                  <th className="py-2.5 px-3 text-right">Taxa Contratada</th>
                  <th className="py-2.5 px-3 text-right">Total Angariado (€)</th>
                  <th className="py-2.5 px-3 text-right">Comissão Liquidada (€)</th>
                  <th className="py-2.5 px-3 text-right">Comissão Pendente (€)</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-neutral-50/50">
                    <td className="py-3 px-3 font-bold text-neutral-900">{partner.name}</td>
                    <td className="py-3 px-3 text-neutral-600">{partner.type}</td>
                    <td className="py-3 px-3 text-neutral-500 text-[11px] font-mono">
                      {partner.nif} · {partner.phone}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-800">
                      {(partner.commissionRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-800 font-medium">
                      {partner.totalWonValue.toLocaleString('pt-PT')} €
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      {partner.paidCommission.toLocaleString('pt-PT')} €
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-amber-800">
                      {partner.pendingCommission.toLocaleString('pt-PT')} €
                    </td>
                    <td className="py-3 px-3 text-right">
                      {partner.pendingCommission > 0 && (
                        <button
                          onClick={() => {
                            partner.paidCommission += partner.pendingCommission;
                            partner.pendingCommission = 0;
                            onAddAuditLog(
                              'UPDATE',
                              'Comissão',
                              partner.id,
                              `Comissão liquidada a ${partner.name}.`
                            );
                          }}
                          className="px-2.5 py-1 bg-amber-900 text-white font-medium rounded hover:bg-amber-800 transition-colors text-[11px]"
                        >
                          Liquidar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Daily Log Modal */}
      {showNewLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-md w-full p-6 shadow-xl text-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Novo Registo de Diário de Obra (Estaleiro)
            </h3>
            <form onSubmit={handleAddDailyLog} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Clima</label>
                  <select
                    value={logWeather}
                    onChange={(e) => setLogWeather(e.target.value as any)}
                    className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                  >
                    <option value="Ensolarado">Ensolarado</option>
                    <option value="Nublado">Nublado</option>
                    <option value="Chuva Ligeira">Chuva Ligeira</option>
                    <option value="Chuva Intensa">Chuva Intensa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Temperatura (ºC)</label>
                  <input
                    type="number"
                    value={logTemp}
                    onChange={(e) => setLogTemp(parseInt(e.target.value, 10) || 18)}
                    className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Efetivo de Pessoal em Obra</label>
                <input
                  type="number"
                  value={logHeadcount}
                  onChange={(e) => setLogHeadcount(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Trabalhos Realizados (uma linha por tarefa)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ex: Conclusão da passagem da cablagem elétrica na suite.&#10;Aplicação de primário hidrófugo na casa de banho."
                  value={logTasks}
                  onChange={(e) => setLogTasks(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewLogModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Registar no Livro de Obra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
