import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Calendar, FileText, User, ChevronRight } from 'lucide-react';
import { getRecordSummary } from '../utils/recordUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryRecord {
    id: number;
    record_type: string;
    date: string;
    summary: string;
    structured_content: any;
}

interface Patient {
    id: number;
    name: string;
    phone: string | null;
    cpf: string | null;
}

export default function PatientHistoryScreen() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadHistory(id);
        }
    }, [id]);

    const loadHistory = async (patientId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/patients/${patientId}/full-history`);
            setPatient(response.data.patient);
            setHistory(response.data.history);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <User className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-medium">Paciente não encontrado</p>
                <Button variant="secondary" onClick={() => navigate('/patients')} className="mt-4">
                    Voltar para lista
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/patients')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Pacientes
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                            {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                <span>CPF: {patient.cpf || 'N/A'}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>Tel: {patient.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => navigate(`/patients/${patient.id}`)}>
                        Editar Dados
                    </Button>
                </div>
            </div>

            {/* Timeline / History */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Histórico Clínico
                </h2>

                {history.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
                        Nenhum registro encontrado para este paciente.
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-8">
                        {history.map((record) => {
                            // Logic to unify category display
                            const category = record.structured_content?.categoria;
                            let badgeClass = 'bg-blue-50 text-blue-600'; // Default Blue (Evolução/Atendimento)
                            let dotClass = 'bg-blue-500';
                            let label = 'Atendimento';

                            if (category === 'anamnese' || (!category && record.record_type === 'anamnese')) {
                                badgeClass = 'bg-emerald-50 text-emerald-600'; // Green
                                dotClass = 'bg-emerald-500';
                                label = 'Anamnese';
                            } else if (category === 'evolucao' || (!category && record.record_type === 'evolucao')) {
                                badgeClass = 'bg-blue-50 text-blue-600'; // Blue
                                dotClass = 'bg-blue-500';
                                label = 'Evolução';
                            } else if (category === 'completo') {
                                badgeClass = 'bg-purple-50 text-purple-600'; // Purple
                                dotClass = 'bg-purple-500';
                                label = 'Completo';
                            }

                            // Logic to extract summary content
                            const contentSummary = getRecordSummary(record);

                            return (
                                <div key={record.id} className="relative pl-8 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${dotClass}`} />

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => navigate(`/patient/${patient.id}/record/${record.id}`)}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badgeClass}`}>
                                                {label}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(record.date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                            </div>
                                        </div>

                                        {/* Main Summary Content - Replaces empty area */}
                                        <div className="mb-2 min-h-[40px]">
                                            <p className="text-slate-700 font-medium leading-relaxed">
                                                {contentSummary}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-end">
                                            <div className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all group/btn">
                                                Ver Detalhes
                                                <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
