import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, FileText, Pencil, Check, X } from 'lucide-react';

interface PatientHeaderProps {
    patientId?: number;
    patientName?: string;
    recordType: 'anamnese' | 'evolucao' | 'atendimento';
    recordId: number;
    createdAt: string;
    onSavePatientName?: (newName: string) => Promise<void>;
    category?: string; // anamnese, evolucao, completo
}

export function PatientHeader({ patientId, patientName, recordType, recordId, createdAt, onSavePatientName, category }: PatientHeaderProps) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(patientName || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedName(patientName || '');
    }, [patientName]);

    const handleSave = async () => {
        if (!onSavePatientName || !editedName.trim()) return;

        try {
            setIsSaving(true);
            await onSavePatientName(editedName);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save patient name:', error);
            alert('Erro ao salvar nome do paciente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedName(patientName || '');
        setIsEditing(false);
    };

    const handleNavigateToPatient = () => {
        if (!isEditing) {
            navigate(`/patients/${patientId}/full-history`);
        }
    };

    // Determine badge style
    const getBadgeStyle = () => {
        if (category === 'anamnese' || (!category && recordType === 'anamnese')) {
            return 'bg-green-100 text-green-700';
        }
        if (category === 'evolucao' || (!category && recordType === 'evolucao')) {
            return 'bg-blue-100 text-blue-700';
        }
        if (category === 'completo') {
            return 'bg-purple-100 text-purple-700';
        }
        return 'bg-gray-100 text-gray-700';
    };

    // Determine badge label and icon
    const renderBadgeContent = () => {
        if (category === 'anamnese' || (!category && recordType === 'anamnese')) {
            return (
                <>
                    <FileText className="w-5 h-5" />
                    Anamnese
                </>
            );
        }
        if (category === 'evolucao' || (!category && recordType === 'evolucao')) {
            return (
                <>
                    <Activity className="w-5 h-5" />
                    Evolução
                </>
            );
        }
        if (category === 'completo') {
            return (
                <>
                    <Check className="w-5 h-5" />
                    Atendimento Completo
                </>
            );
        }
        return (
            <>
                <Activity className="w-5 h-5" />
                Prontuário
            </>
        );
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
                <div
                    onClick={handleNavigateToPatient}
                    className="bg-slate-100 p-3 rounded-full flex-shrink-0 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                    <User className="w-8 h-8 text-slate-500" />
                </div>
                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="text-2xl font-bold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent w-full max-w-md"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1
                                onClick={handleNavigateToPatient}
                                className="text-2xl font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                            >
                                {patientName || 'Paciente não identificado'}
                            </h1>
                            {onSavePatientName && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-all"
                                    title="Editar nome"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span>•</span>
                        <span>ID: #{recordId}</span>
                    </div>
                </div>
            </div>

            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium flex-shrink-0 ${getBadgeStyle()}`}>
                {renderBadgeContent()}
            </div>
        </div>
    );
}

