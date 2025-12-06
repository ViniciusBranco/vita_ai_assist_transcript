import { useState, useEffect } from 'react';
import { Save, Stethoscope, FileText } from 'lucide-react';
import { Button } from './ui/Button';

interface RecordFormProps {
    record: any;
    onSave: (data: any) => Promise<void>;
    loading?: boolean;
}

export function RecordForm({ record, onSave, loading = false }: RecordFormProps) {
    // Evolucao fields
    const [observacoes, setObservacoes] = useState('');
    const [procedimentos, setProcedimentos] = useState('');
    const [transcription, setTranscription] = useState('');

    // Anamnese fields
    const [queixaPrincipal, setQueixaPrincipal] = useState('');
    const [historicoMedico, setHistoricoMedico] = useState('');
    const [alergias, setAlergias] = useState('');
    const [medicamentos, setMedicamentos] = useState('');

    useEffect(() => {
        if (record && record.structured_content) {
            console.log('RecordForm received:', record);

            // Normalize content: handle potential 'data' wrapping or direct object
            const raw = record.structured_content;
            const content = raw.data || raw;

            // Helper to safe get property case-insensitive
            const get = (key: string, alias?: string) => {
                return content[key] || content[alias || ''] || content[key.toLowerCase()] ||
                    (content.data && content.data[key]) || '';
            };

            // Map fields with fallback
            setObservacoes(get('observacoes') || get('clinical_notes') || '');
            setTranscription(record.full_transcription || '');

            const proc = content.procedimentos || content.procedimentos_realizados || content.procedimentosRealizados;
            setProcedimentos(Array.isArray(proc) ? proc.join(', ') : proc || '');

            setQueixaPrincipal(get('queixa_principal', 'queixaPrincipal'));
            setHistoricoMedico(get('historico_medico', 'historicoMedico'));
            setAlergias(get('alergias'));
            setMedicamentos(get('medicamentos'));
        }
    }, [record]);

    const isAnamnese = record.record_type?.toLowerCase() === 'anamnese';
    const isEvolucao = record.record_type?.toLowerCase() === 'evolucao';
    const isAtendimento = record.record_type?.toLowerCase() === 'atendimento';

    const handleSubmit = () => {
        let payload = { ...record.structured_content };

        if (isEvolucao) {
            payload = {
                ...payload,
                observacoes,
                procedimentos: procedimentos.split(',').map(p => p.trim()).filter(Boolean)
            };
        } else if (isAnamnese) {
            payload = {
                ...payload,
                queixa_principal: queixaPrincipal,
                historico_medico: historicoMedico,
                alergias,
                medicamentos
            };
        } else if (isAtendimento) {
            payload = {
                ...payload,
                queixa_principal: queixaPrincipal,
                historico_medico: historicoMedico,
                alergias,
                medicamentos,
                observacoes,
                procedimentos: procedimentos.split(',').map(p => p.trim()).filter(Boolean)
            };
        }

        // Include full_transcription in payload
        payload = { ...payload, full_transcription: transcription };

        onSave(payload);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column: Transcription (Read-only) */}
            <div className="flex flex-col gap-4 h-[500px] lg:h-full">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2>Transcrição Original</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
                    <textarea
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        className="w-full flex-1 resize-none border-none outline-none text-slate-600 leading-relaxed text-sm sm:text-base custom-scrollbar placeholder:text-slate-300"
                        placeholder="Nenhuma transcrição disponível."
                    />
                </div>
            </div>

            {/* Right Column: Editable Form */}
            <div className="flex flex-col gap-4 h-full">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Stethoscope className={`w-5 h-5 ${isAnamnese ? 'text-emerald-600' : 'text-blue-600'}`} />
                    <h2>
                        {isAtendimento ? 'Atendimento Completo' : isAnamnese ? 'Anamnese detalhada' : 'Evolução Clínica'}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 overflow-y-auto flex flex-col gap-6">

                    {/* Anamnese Fields */}
                    {(isAnamnese || isAtendimento) && (
                        <>
                            <div className="space-y-2">
                                <label htmlFor="queixaPrincipal" className="block text-sm font-medium text-slate-700">
                                    Queixa Principal
                                </label>
                                <textarea
                                    id="queixaPrincipal"
                                    value={queixaPrincipal}
                                    onChange={(e) => setQueixaPrincipal(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none placeholder:text-slate-400 leading-relaxed min-h-[80px]"
                                    placeholder="Motivo da consulta..."
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <label htmlFor="historicoMedico" className="block text-sm font-medium text-slate-700">
                                    Histórico Médico
                                </label>
                                <textarea
                                    id="historicoMedico"
                                    value={historicoMedico}
                                    onChange={(e) => setHistoricoMedico(e.target.value)}
                                    className="w-full flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none placeholder:text-slate-400 leading-relaxed min-h-[120px]"
                                    placeholder="Histórico de doenças, cirurgias, etc..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="alergias" className="block text-sm font-medium text-slate-700">
                                        Alergias
                                    </label>
                                    <input
                                        type="text"
                                        id="alergias"
                                        value={alergias}
                                        onChange={(e) => setAlergias(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Nenhuma conhecida"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="medicamentos" className="block text-sm font-medium text-slate-700">
                                        Medicamentos em Uso
                                    </label>
                                    <input
                                        type="text"
                                        id="medicamentos"
                                        value={medicamentos}
                                        onChange={(e) => setMedicamentos(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Nenhum"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {isAtendimento && <div className="border-t border-slate-100 my-2 relative"><span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-2 text-xs text-slate-400 font-medium">EVOLUÇÃO</span></div>}

                    {/* Evolucao Fields */}
                    {(isEvolucao || isAtendimento) && (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="procedimentos" className="block text-sm font-medium text-slate-700">
                                        Procedimentos Realizados
                                    </label>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                        Separar por vírgula
                                    </span>
                                </div>
                                <textarea
                                    id="procedimentos"
                                    value={procedimentos}
                                    onChange={(e) => setProcedimentos(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 resize-y min-h-[50px] leading-relaxed"
                                    placeholder="Ex: Limpeza, Restauração, Extração..."
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2 flex-1 flex flex-col">
                                <label htmlFor="observacoes" className="block text-sm font-medium text-slate-700">
                                    Observações e Evolução
                                </label>
                                <textarea
                                    id="observacoes"
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    className="w-full flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none placeholder:text-slate-400 leading-relaxed min-h-[200px]"
                                    placeholder="Descreva a evolução clínica, queixas e detalhes do atendimento..."
                                />
                            </div>
                        </>
                    )}

                    {/* Action Button */}
                    <div className="pt-4 border-t border-slate-100">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Salvando...' : 'Confirmar Prontuário'}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
