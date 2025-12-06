import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { PatientHeader } from '../components/PatientHeader';
import { RecordForm } from '../components/RecordForm';

interface MedicalRecord {
    id: number;
    record_type: 'anamnese' | 'evolucao';
    patient_name?: string;
    patient?: {
        id: number;
        name: string;
        phone: string;
        age?: number | null;
    };
    structured_content: any;
    full_transcription: string;
    created_at: string;
}

export default function RecordReviewScreen() {
    const { id } = useParams<{ id: string }>();
    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [patientName, setPatientName] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/api/medical-records/${id}`);
                const data = response.data;
                setRecord(data);

                if (data.patient_name) {
                    setPatientName(data.patient_name);
                } else if (data.patient && data.patient.name) {
                    setPatientName(data.patient.name);
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

    const handleUpdatePatientName = async (newName: string) => {
        try {
            setPatientName(newName);
            await axios.put(`http://localhost:8000/api/medical-records/${id}`, {
                patient: { name: newName }
            });
        } catch (err) {
            console.error('Error saving patient name:', err);
            alert('Erro ao salvar nome do paciente.');
        }
    };

    const handleSave = async (updatedContent: any) => {
        if (!record) return;

        try {
            setLoading(true);

            const payload = {
                structured_content: updatedContent,
                patient: { name: patientName }
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
        <div className="font-sans text-slate-900 h-[calc(100vh-4rem)] flex flex-col">
            <PatientHeader
                patientName={patientName}
                recordType={record.record_type}
                recordId={record.id}
                createdAt={record.created_at}
                onSavePatientName={handleUpdatePatientName}
            />

            <div className="flex-1 min-h-0">
                <div className="h-full container mx-auto">
                    <RecordForm
                        record={record}
                        onSave={handleSave}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
