import { User, Calendar, Activity, FileText } from 'lucide-react';

interface PatientHeaderProps {
    patientName?: string;
    recordType: 'anamnese' | 'evolucao';
    recordId: number;
    createdAt: string;
}

export function PatientHeader({ patientName, recordType, recordId, createdAt }: PatientHeaderProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-full">
                    <User className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {patientName || 'Paciente não identificado'}
                    </h1>
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

            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium ${recordType === 'anamnese'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                {recordType === 'anamnese' ? (
                    <>
                        <FileText className="w-5 h-5" />
                        Anamnese
                    </>
                ) : (
                    <>
                        <Activity className="w-5 h-5" />
                        Evolução
                    </>
                )}
            </div>
        </div>
    );
}
