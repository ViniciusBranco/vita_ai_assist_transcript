import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Save, Stethoscope, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PatientHeader } from '../components/PatientHeader';

interface MedicalRecord {
    id: number;
    record_type: 'anamnese' | 'evolucao';
    patient_name?: string;
    structured_content: {
        observacoes?: string;
        procedimentos?: string[] | string;
        queixa_principal?: string;
        historico_medico?: string;
        alergias?: string;
        medicamentos?: string;
        [key: string]: any;
    };
    full_transcription: string;
    created_at: string;
}

export default function RecordReviewScreen() {
    const { id } = useParams<{ id: string }>();
    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Evolucao fields
    const [observacoes, setObservacoes] = useState('');
    const [procedimentos, setProcedimentos] = useState('');

    // Anamnese fields
    const [queixaPrincipal, setQueixaPrincipal] = useState('');
    const [historicoMedico, setHistoricoMedico] = useState('');
    const [alergias, setAlergias] = useState('');
    const [medicamentos, setMedicamentos] = useState('');

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/api/medical-records/${id}`);
                const data = response.data;
                setRecord(data);

                if (data.structured_content) {
                    // Common fields or specific mapping based on type
                    setObservacoes(data.structured_content.observacoes || '');

                    const proc = data.structured_content.procedimentos;
                    setProcedimentos(Array.isArray(proc) ? proc.join(', ') : proc || '');

                    // Anamnese fields
                    setQueixaPrincipal(data.structured_content.queixa_principal || '');
                    setHistoricoMedico(data.structured_content.historico_medico || '');
                    setAlergias(data.structured_content.alergias || '');
                    setMedicamentos(data.structured_content.medicamentos || '');
                }
            } catch (err) {
                console.error('Error fetching record:', err);
                setError('Não foi possível carregar o prontuário. Verifique se o ID está correto.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRecord();
        }
    }, [id]);

    const navigate = useNavigate();

    const handleSave = async () => {
        if (!record) return;

        try {
            setLoading(true);

            let payload = { ...record.structured_content };

            if (record.record_type === 'evolucao') {
                payload = {
                    ...payload,
                    observacoes,
                    procedimentos: procedimentos.split(',').map(p => p.trim()).filter(Boolean)
                };
            } else if (record.record_type === 'anamnese') {
                payload = {
                    ...payload,
                    queixa_principal: queixaPrincipal,
                    historico_medico: historicoMedico,
                    alergias,
                    medicamentos
                };
            }

            await axios.put(`http://localhost:8000/api/medical-records/${id}`, payload);

            alert('Prontuário confirmado com sucesso!');
            navigate('/');
        } catch (err) {
            console.error('Error saving record:', err);
            alert('Erro ao salvar prontuário. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Erro ao carregar</h2>
                <p className="text-slate-600 max-w-md">{error || 'Prontuário não encontrado.'}</p>
            </div>
        );
    }

    return (
        <div className="font-sans text-slate-900">
            <PatientHeader
                patientName={record.patient_name}
                recordType={record.record_type}
                recordId={record.id}
                createdAt={record.created_at}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full lg:h-[calc(100vh-16rem)]">

                {/* Left Column: Transcription (Read-only) */}
                <div className="flex flex-col gap-4 h-[500px] lg:h-full">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h2>Transcrição Original</h2>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                            {record.full_transcription || "Nenhuma transcrição disponível."}
                        </p>
                    </div>
                </div>

                {/* Right Column: Editable Form */}
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Stethoscope className="w-5 h-5 text-indigo-600" />
                        <h2>Dados Clínicos</h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 overflow-y-auto flex flex-col gap-6">

                        {record.record_type === 'evolucao' ? (
                            <>
                                {/* Procedures Field */}
                                <div className="space-y-2">
                                    <label htmlFor="procedimentos" className="block text-sm font-medium text-slate-700">
                                        Procedimentos Realizados
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="procedimentos"
                                            value={procedimentos}
                                            onChange={(e) => setProcedimentos(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Ex: Limpeza, Restauração, Extração..."
                                        />
                                        <div className="absolute right-3 top-3 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                            Separar por vírgula
                                        </div>
                                    </div>
                                </div>

                                {/* Observations Field */}
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
                        ) : (
                            <>
                                {/* Queixa Principal */}
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

                                {/* Histórico Médico */}
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

                                {/* Alergias e Medicamentos (Grid) */}
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

                        {/* Action Button */}
                        <div className="pt-4 border-t border-slate-100">
                            <Button
                                onClick={handleSave}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                            >
                                <Save className="w-5 h-5" />
                                Confirmar Prontuário
                            </Button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
