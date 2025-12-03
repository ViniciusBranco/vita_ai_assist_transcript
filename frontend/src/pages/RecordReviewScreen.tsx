import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Save, Activity, Calendar, User, Stethoscope, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface MedicalRecord {
    id: number;
    structured_content: {
        observacoes?: string;
        procedimentos?: string[] | string;
        queixa_principal?: string;
        historico_medico?: string;
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
    const [observacoes, setObservacoes] = useState('');
    const [procedimentos, setProcedimentos] = useState('');

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                setLoading(true);
                // Using localhost:8000 as requested, though in production this should be an env var
                const response = await axios.get(`http://localhost:8000/api/medical-records/${id}`);
                const data = response.data;
                setRecord(data);

                if (data.structured_content) {
                    setObservacoes(data.structured_content.observacoes || '');
                    const proc = data.structured_content.procedimentos;
                    setProcedimentos(Array.isArray(proc) ? proc.join(', ') : proc || '');
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
            const payload = {
                ...record.structured_content,
                observacoes,
                procedimentos: procedimentos.split(',').map(p => p.trim()).filter(Boolean)
            };

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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Revisão de Prontuário #{record.id}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="hidden sm:flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            ID: {record.id}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full lg:h-[calc(100vh-8rem)]">

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
            </main>
        </div>
    );
}
