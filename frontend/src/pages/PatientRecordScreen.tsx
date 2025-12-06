import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { PatientHeader } from '../components/PatientHeader';
import { PatientTimeline } from '../components/PatientTimeline';
import { RecordForm } from '../components/RecordForm';

interface MedicalRecord {
    id: number;
    record_type: 'anamnese' | 'evolucao' | 'atendimento';
    patient_name?: string;
    structured_content: any;
    full_transcription: string;
    created_at: string;
}

interface PatientHistory {
    patient: {
        id: number;
        name: string;
        phone: string;
        age?: number;
    };
    history: {
        id: number;
        record_type: 'anamnese' | 'evolucao' | 'atendimento';
        date: string;
        summary: string;
    }[];
}

export default function PatientRecordScreen() {
    const { patientId, recordId } = useParams<{ patientId: string; recordId: string }>();
    const navigate = useNavigate();

    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [history, setHistory] = useState<PatientHistory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Helper to normalize data structure (Handles both legacy and unified/nested formats)
    const normalizeRecordData = (data: any): MedicalRecord => {
        if (!data || !data.structured_content) return data;

        let content = data.structured_content;

        // Flatten if nested under 'data' (Legacy wrapper)
        if (content.data) {
            content = content.data;
        }

        const normalizedContent: any = {};

        // --- 1. UNIFIED FORMAT STRATEGY ---
        // New records come as { anamnese: {...}, evolucao: {...}, paciente: {...} }
        // We must flatten this to top-level keys for RecordForm.
        const hasAnamnese = content.anamnese && typeof content.anamnese === 'object';
        const hasEvolucao = content.evolucao && typeof content.evolucao === 'object';

        if (hasAnamnese || hasEvolucao) {
            console.log("Detected Unified Nested Structure");

            // Extract Anamnese Fields
            if (hasAnamnese) {
                normalizedContent.queixa_principal = content.anamnese.queixa_principal || content.anamnese.queixaPrincipal;
                normalizedContent.historico_medico = content.anamnese.historico_medico || content.anamnese.historicoMedico;

                // Merge arrays, default to empty
                normalizedContent.alergias = content.anamnese.alergias || [];
                normalizedContent.medicamentos = content.anamnese.medicamentos || [];
            }

            // Extract Evolucao Fields
            if (hasEvolucao) {
                normalizedContent.observacoes = content.evolucao.observacoes || content.evolucao.clinical_notes;

                let procs = content.evolucao.procedimentos || content.evolucao.procedimentos_realizados;
                // Fix: Join array to string for Display/Form
                if (Array.isArray(procs)) {
                    procs = procs.join(', ');
                }
                normalizedContent.procedimentos = procs;
            }

            // Allow other top-level keys if present (e.g. legacy props mixed in)
            Object.keys(content).forEach(k => {
                if (k !== 'anamnese' && k !== 'evolucao' && k !== 'paciente') {
                    if (normalizedContent[k] === undefined) {
                        normalizedContent[k] = content[k];
                    }
                }
            });

        } else {
            // --- 2. LEGACY FLAT FORMAT STRATEGY ---
            console.log("Detected Legacy Flat Structure");

            // Copy all original keys first
            Object.keys(content).forEach(k => {
                normalizedContent[k] = content[k];
            });

            // Map old keys to new standard keys
            const keyMap: Record<string, string> = {
                'queixaPrincipal': 'queixa_principal',
                'historicoMedico': 'historico_medico',
                'procedimentosRealizados': 'procedimentos',
                'procedimentos_realizados': 'procedimentos',
                'clinicalValues': 'observacoes',
                'clinical_notes': 'observacoes'
            };

            Object.keys(content).forEach(k => {
                const mapped = keyMap[k];
                if (mapped) {
                    normalizedContent[mapped] = content[k];
                }
            });

            // Handle legacy array procedures
            if (Array.isArray(normalizedContent.procedimentos)) {
                normalizedContent.procedimentos = normalizedContent.procedimentos.join(', ');
            }
        }

        // Ensure critical arrays exist (if not populated by unified logic)
        if (!normalizedContent.alergias) normalizedContent.alergias = [];
        if (!normalizedContent.medicamentos) normalizedContent.medicamentos = [];

        return {
            ...data,
            structured_content: normalizedContent,
            full_transcription: data.full_transcription || ''
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch specific record
                const recordRes = await axios.get(`http://localhost:8000/api/medical-records/${recordId}`);
                console.log('Raw Record Data:', recordRes.data);

                const cleanRecord = normalizeRecordData(recordRes.data);
                console.log('Normalized Record Data:', cleanRecord);

                setRecord(cleanRecord);

                // Fetch patient history
                const historyRes = await axios.get(`http://localhost:8000/api/patients/${patientId}/full-history`);

                // Enhance history summaries (Client-Side Logic)
                const rawHistory = historyRes.data;
                const enhancedHistoryItems = rawHistory.history.map((item: any) => {
                    if (item.record_type === 'atendimento' && item.structured_content) {
                        let content = item.structured_content;
                        // Handle flattened vs nested check again just in case
                        // Normally structured content here is raw
                        const hasAnamnese = content.anamnese;
                        const hasEvolucao = content.evolucao;

                        let summary = 'Atendimento Geral';

                        if (hasAnamnese || hasEvolucao) {
                            const queixa = content.anamnese?.queixa_principal || content.anamnese?.queixaPrincipal;
                            const procs = content.evolucao?.procedimentos || content.evolucao?.procedimentos_realizados;

                            if (queixa) {
                                summary = `Queixa: ${queixa}`;
                            } else if (procs) {
                                let pStr = procs;
                                if (Array.isArray(procs)) pStr = procs.join(', ');
                                if (pStr) summary = `Proc: ${pStr}`;
                            }
                        }

                        // Truncate
                        if (summary.length > 50) summary = summary.substring(0, 50) + '...';

                        return { ...item, summary };
                    }
                    return item;
                });

                setHistory({ ...rawHistory, history: enhancedHistoryItems });

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Erro ao carregar dados do paciente ou prontuário.');
            } finally {
                setLoading(false);
            }
        };

        if (patientId && recordId) {
            fetchData();
        }
    }, [patientId, recordId]);

    const handleSave = async (updatedContent: any) => {
        try {
            await axios.put(`http://localhost:8000/api/medical-records/${recordId}`, updatedContent);
            alert('Prontuário salvo com sucesso!');
            // Refresh data to show updates
            const recordRes = await axios.get(`http://localhost:8000/api/medical-records/${recordId}`);
            // Re-normalize on save refresh is technically good practice but simplistic here is ok
            // Ideally we should use the same normalize function
            setRecord(normalizeRecordData(recordRes.data));
        } catch (err) {
            console.error('Error saving record:', err);
            alert('Erro ao salvar prontuário.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !record || !history) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Erro ao carregar</h2>
                <p className="text-slate-600 max-w-md">{error || 'Dados não encontrados.'}</p>
            </div>
        );
    }

    const handleSavePatientName = async (newName: string) => {
        try {
            await axios.put(`http://localhost:8000/api/medical-records/${recordId}`, {
                patient: { name: newName }
            });
            // Refresh history to update name
            const historyRes = await axios.get(`http://localhost:8000/api/patients/${patientId}/full-history`);
            setHistory(historyRes.data);
        } catch (err) {
            console.error('Error saving patient name:', err);
            throw err;
        }
    };

    return (
        <div className="font-sans text-slate-900 h-[calc(100vh-4rem)] flex flex-col">
            <PatientHeader
                patientId={history.patient.id}
                patientName={history.patient.name}
                recordType={record.record_type}
                recordId={record.id}
                createdAt={record.created_at}
                onSavePatientName={handleSavePatientName}
                category={record.structured_content?.categoria}
            />

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Timeline */}
                <div className="lg:col-span-1 h-full min-h-0">
                    <PatientTimeline
                        events={history.history}
                        patientId={patientId!}
                    />
                </div>

                {/* Main Content: Record Form */}
                <div className="lg:col-span-3 h-full min-h-0">
                    <RecordForm
                        record={record}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </div>
    );
}

