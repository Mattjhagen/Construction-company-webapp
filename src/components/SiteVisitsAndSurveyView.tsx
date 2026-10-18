import React, { useState } from 'react';
import { SiteVisit, Survey, PathologyItem, VoiceNote } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Mic,
  Camera,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  Play,
  Square,
  FileText,
  AlertTriangle,
  Download,
  Share2,
} from 'lucide-react';

interface SiteVisitsAndSurveyViewProps {
  siteVisits: SiteVisit[];
  surveys: Survey[];
  onAddSiteVisit: (visit: Partial<SiteVisit>) => void;
  onUpdateSurvey: (survey: Survey) => void;
  onNavigateToQuote: (leadId: string) => void;
}

export const SiteVisitsAndSurveyView: React.FC<SiteVisitsAndSurveyViewProps> = ({
  siteVisits,
  surveys,
  onAddSiteVisit,
  onUpdateSurvey,
  onNavigateToQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'mobile_survey'>('schedule');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey>(surveys[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceTextDraft, setVoiceTextDraft] = useState('');
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // New Visit modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDate, setNewDate] = useState('2026-04-02');
  const [newTime, setNewTime] = useState('11:00');
  const [newTechnician, setNewTechnician] = useState('Eng. Tiago Silva');
  const [newSync, setNewSync] = useState<'Google Calendar' | 'Microsoft 365 Outlook' | 'Ambos'>('Ambos');

  // Handle Voice Recording Simulation & Web Speech
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Web Speech API if supported in browser
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-PT';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setVoiceTextDraft((prev) => prev + ' ' + transcript);
        };
        try {
          recognition.start();
          (window as any)._rec = recognition;
        } catch (e) {
          console.warn('Speech recognition fallback', e);
        }
      }

      (window as any)._recInterval = interval;
    } else {
      setIsRecording(false);
      clearInterval((window as any)._recInterval);
      if ((window as any)._rec) {
        try {
          (window as any)._rec.stop();
        } catch (e) {}
      }
      if (!voiceTextDraft) {
        setVoiceTextDraft(
          'Vistoria na fachada virada à rua: verificámos fissuração no reboco de cal e sinais claros de humidade ascensional por capilaridade na base da alvenaria de granito, com cerca de 18 metros lineares. É necessária picagem do reboco degradado e injeção de silanos.'
        );
      }
    }
  };

  const handleSaveVoiceNote = async () => {
    if (!voiceTextDraft) return;

    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: recordingSeconds || 42,
      audioName: `Apontamento_Campo_${Date.now().toString().slice(-4)}.m4a`,
      transcription: voiceTextDraft,
      extractedPathologies: ['Humidade Ascensional', 'Fissuração em Granito'],
    };

    const updated = {
      ...selectedSurvey,
      voiceNotes: [newNote, ...selectedSurvey.voiceNotes],
    };
    setSelectedSurvey(updated);
    onUpdateSurvey(updated);
    setVoiceTextDraft('');
    setRecordingSeconds(0);

    // Call server AI to analyze
    setIsAnalyzingAi(true);
    try {
      const res = await fetch('/api/ai/analyze-survey-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText: newNote.transcription,
          location: 'Porto - Cedofeita',
          propertyType: selectedSurvey.structuralType,
        }),
      });
      const data = await res.json();
      setAiAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleAddVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newAddress) return;

    onAddSiteVisit({
      clientName: newClientName,
      address: newAddress,
      date: newDate,
      time: newTime,
      technician: newTechnician,
      technicianRole: newTechnician.includes('Tiago') ? 'Engenheiro Civil' : 'Arquiteta Perita',
      status: 'Agendada',
      syncService: newSync,
      synced: true,
      notes: 'Visita agendada via sistema EdificaPorto com sincronização automática.',
    });

    setIsScheduleModalOpen(false);
    setNewClientName('');
    setNewAddress('');
  };

  const downloadIcs = (visit: SiteVisit) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EdificaPorto//Vistorias Tecnicas//PT
BEGIN:VEVENT
SUMMARY:Vistoria Técnica EdificaPorto - ${visit.clientName}
DESCRIPTION:Vistoria técnica para elaboração de orçamento. Técnico: ${visit.technician}
LOCATION:${visit.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vistoria_${visit.clientName.replace(/\s+/g, '_')}.ics`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1">
            <span>Operações de Campo</span>
            <span>·</span>
            <span>Peritagens & Vistorias em Obras</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Agendamento de Vistorias & Levantamento Móvel
          </h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Sincronização bidirecional com Google Calendar e Microsoft 365, recolha fotográfica georreferenciada e notas de voz com IA.
          </p>
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-neutral-100 rounded-lg border border-neutral-200">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Agenda & Calendários
            </button>
            <button
              onClick={() => setActiveTab('mobile_survey')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'mobile_survey'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>Vistoria Técnica Móvel</span>
            </button>
          </div>

          {activeTab === 'schedule' && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Marcar Vistoria</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Calendar & Visits List */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Visits Schedule Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-600" />
                  <span>Vistorias Técnicas Agendadas no Grande Porto</span>
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  {siteVisits.length} Registadas
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {siteVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{visit.clientName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            visit.status === 'Concluída'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {visit.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{visit.address}</span>
                      </p>
                      <div className="text-[11px] text-neutral-500 pt-1 flex items-center gap-3">
                        <span>Técnico: <strong className="text-neutral-700">{visit.technician}</strong></span>
                        <span>·</span>
                        <span className="text-neutral-600">{visit.technicianRole}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-neutral-900 tabular-nums">
                          {visit.date}
                        </div>
                        <div className="text-[11px] text-neutral-500 tabular-nums flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{visit.time} h</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadIcs(visit)}
                          title="Descarregar ficheiro de calendário .ICS"
                          className="p-1.5 bg-white border border-neutral-200 rounded text-neutral-600 hover:text-neutral-900 text-xs flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span className="text-[10px]">.ICS</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('mobile_survey')}
                          className="px-2.5 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          Abrir Vistoria
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sync Status & Connected Integrations */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Sincronização de Calendários</span>
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                As marcações de vistorias são sincronizadas em tempo real com as agendas dos engenheiros e arquitetos da empresa.
              </p>

              <div className="space-y-3 pt-2">
                {/* Google Calendar Status */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Google Calendar</div>
                    <div className="text-[10px] text-neutral-500">eng.tiago.silva@edificaporto.pt</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Conectado</span>
                  </div>
                </div>

                {/* Microsoft 365 Outlook Status */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">Microsoft 365 / Outlook</div>
                    <div className="text-[10px] text-neutral-500">vistorias@edificaporto.pt</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Conectado</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-neutral-100 rounded-lg text-[11px] text-neutral-600 space-y-1">
                <div className="font-semibold text-neutral-900">Regra de Conflito de Agendas:</div>
                <div>Intervalo mínimo obrigatório de 45 minutos entre vistorias para deslocação dentro do perímetro do Porto.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mobile Survey Simulator */}
      {activeTab === 'mobile_survey' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Property & Diagnostic Details */}
          <div className="lg:col-span-7 space-y-5">
            {/* General Property Info Card */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono">CADERNO DE VISTORIA TÉCNICA</span>
                  <h3 className="text-base font-bold text-neutral-900">
                    Apartamento Histórico - Rua de Cedofeita, 382
                  </h3>
                  <p className="text-xs text-neutral-600">Perito Responsável: {selectedSurvey.surveyor}</p>
                </div>
                <div className="px-2.5 py-1 bg-purple-50 text-purple-800 text-xs font-semibold rounded-md border border-purple-200">
                  {selectedSurvey.structuralType}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-neutral-100">
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 text-[11px] block">Área Bruta</span>
                  <span className="font-bold text-neutral-900 tabular-nums text-sm">
                    {selectedSurvey.grossAreaM2} m²
                  </span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 text-[11px] block">Pé-Direito</span>
                  <span className="font-bold text-neutral-900 tabular-nums text-sm">
                    {selectedSurvey.ceilingHeightM} m
                  </span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 text-[11px] block">Idade do Prédio</span>
                  <span className="font-bold text-neutral-900 tabular-nums text-sm">
                    ~{selectedSurvey.buildingAgeYears} anos
                  </span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                  <span className="text-neutral-500 text-[11px] block">Estado Cobertura</span>
                  <span className="font-bold text-amber-700 text-sm">
                    {selectedSurvey.roofCondition}
                  </span>
                </div>
              </div>

              {/* Photographic Survey Gallery */}
              <div className="pt-3">
                <h4 className="text-xs font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Levantamento Fotográfico de Patologias</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedSurvey.pathologies.map((pat) => (
                    <div
                      key={pat.id}
                      className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 text-xs flex flex-col justify-between"
                    >
                      <div className="h-40 w-full bg-neutral-900 relative">
                        <img
                          src={pat.photoUrl}
                          alt={pat.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-neutral-900/80 text-white text-[10px] font-semibold rounded">
                          Gravidade: {pat.severity}
                        </div>
                      </div>
                      <div className="p-3 space-y-1.5">
                        <h5 className="font-bold text-neutral-900">{pat.title}</h5>
                        <p className="text-[11px] text-neutral-500">{pat.locationInHouse}</p>
                        <p className="text-[11px] text-neutral-700 leading-snug">{pat.description}</p>
                        <div className="pt-2 border-t border-neutral-200/60 text-[11px] text-amber-900 font-medium">
                          Ação: {pat.recommendedIntervention} ({pat.suggestedQuantity} {pat.suggestedUnit})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Voice Notes & AI Analysis Engine */}
          <div className="lg:col-span-5 space-y-5">
            {/* Voice Recorder & Transcription Simulator */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span>Notas de Voz do Estaleiro</span>
                </h3>
                <span className="text-[11px] text-neutral-500">Gravação & Transcrição</span>
              </div>

              {/* Voice recording controls */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                <button
                  onClick={toggleRecording}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-6 h-6" />}
                </button>

                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {isRecording ? 'A Gravar Áudio da Vistoria...' : 'Toque para Gravar Apontamento de Voz'}
                  </div>
                  {isRecording && (
                    <div className="text-xs font-mono text-rose-600 tabular-nums mt-0.5">
                      00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                    </div>
                  )}
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    Utiliza o microfone do telemóvel para ditar medições e anomalias
                  </div>
                </div>
              </div>

              {/* Voice Draft / Text editor */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Texto Transcrito do Áudio
                </label>
                <textarea
                  rows={3}
                  value={voiceTextDraft}
                  onChange={(e) => setVoiceTextDraft(e.target.value)}
                  placeholder="O texto ditado surgirá aqui. Pode também escrever notas manuais de campo..."
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />

                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setVoiceTextDraft(
                        'Inspeção da estrutura de piso em vigas de castanho: detetámos flexão excessiva junto à prumada de água. É necessário prever colocação de 2 perfis metálicos IPE 140 de reforço com 4 metros cada, apoiados nas paredes de cantaria.'
                      )
                    }
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 underline"
                  >
                    Carregar exemplo típico do Porto
                  </button>

                  <button
                    onClick={handleSaveVoiceNote}
                    disabled={!voiceTextDraft || isAnalyzingAi}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isAnalyzingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>A Analisar com IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Analisar e Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Existing Recorded Notes List */}
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <span className="text-[11px] font-semibold text-neutral-600 block">
                  Registo de Áudios Anteriores ({selectedSurvey.voiceNotes.length}):
                </span>
                {selectedSurvey.voiceNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-medium text-neutral-800 text-[11px]">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-neutral-500" />
                        <span>{note.audioName}</span>
                      </span>
                      <span className="text-neutral-400 tabular-nums">{note.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-neutral-600 leading-snug">{note.transcription}</p>
                  </div>
                ))}
              </div>

              {/* AI Diagnostic Output */}
              {aiAnalysisResult && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Parecer do Assistente de Engenharia Civil</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-snug">
                    {aiAnalysisResult.executiveSummary}
                  </p>

                  <div className="pt-2 border-t border-amber-200/60">
                    <button
                      onClick={() => onNavigateToQuote(selectedSurvey.leadId)}
                      className="w-full py-1.5 bg-amber-900 text-white font-semibold rounded text-center text-xs hover:bg-amber-800 transition-colors"
                    >
                      Exportar Patologias Diretamente para Orçamento →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Scheduling a Visit */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-neutral-200 rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 mb-3">
              Marcar Nova Visita / Vistoria Técnica
            </h3>
            <form onSubmit={handleAddVisitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Dra. Helena Vasconcelos"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Morada da Obra *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua de Cedofeita, Porto"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Técnico Alocado</label>
                <select
                  value={newTechnician}
                  onChange={(e) => setNewTechnician(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                >
                  <option value="Eng. Tiago Silva">Eng. Tiago Silva (Engenharia Civil)</option>
                  <option value="Arq. Inês Rocha">Arq. Inês Rocha (Arquitetura e Património)</option>
                  <option value="Eng. Carlos Pinho">Eng. Carlos Pinho (Direção de Obras)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">Sincronização de Agenda</label>
                <select
                  value={newSync}
                  onChange={(e) => setNewSync(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900"
                >
                  <option value="Ambos">Google Calendar & Microsoft 365 Outlook</option>
                  <option value="Google Calendar">Apenas Google Calendar</option>
                  <option value="Microsoft 365 Outlook">Apenas Microsoft 365 Outlook</option>
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Confirmar e Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
