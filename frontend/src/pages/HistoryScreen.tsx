import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Activity, Clock, ChevronRight, Search } from 'lucide-react';

interface MedicalRecordSummary {
    id: number;
    record_type: 'anamnese' | 'evolucao';
    created_at: string;
    patient_name?: string;
    patient_id?: number;
    structured_content: {
        paciente?: string;
        [key: string]: any;
    };
}

export default function HistoryScreen() {
    const [records, setRecords] = useState<MedicalRecordSummary[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/medical-records/');
                const sorted = response.data.sort((a: MedicalRecordSummary, b: MedicalRecordSummary) => b.id - a.id);
                setRecords(sorted);
            } catch (err) {
                console.error('Failed to fetch records:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const filteredRecords = records.filter(record => {
        const patientName = record.patient_name || record.structured_content?.paciente || '';
        return patientName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Histórico de Prontuários</h1>
                    <p className="text-slate-500">Gerencie e consulte todos os registros.</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por paciente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid gap-3">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Carregando...</div>
                ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                        {searchTerm ? 'Nenhum paciente encontrado com esse nome.' : 'Nenhum prontuário registrado.'}
                    </div>
                ) : (
                    filteredRecords.map((record) => (
                        <Link
                            key={record.id}
                            to={record.patient_id ? `/patient/${record.patient_id}/record/${record.id}` : `/record/${record.id}`}
                            className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${record.record_type === 'anamnese'
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {record.record_type === 'anamnese' ? (
                                        <FileText className="w-5 h-5" />
                                    ) : (
                                        <Activity className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                            #{record.id}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(record.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900">
                                        {record.patient_name || record.structured_content?.paciente || 'Paciente não identificado'}
                                    </h3>
                                </div>
                            </div>

                            <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
