import { Link, useParams } from 'react-router-dom';
import { Activity, FileText, Calendar, ChevronRight } from 'lucide-react';
import { getRecordSummary } from '../utils/recordUtils';

interface TimelineEvent {
    id: number;
    record_type: 'anamnese' | 'evolucao' | 'atendimento';
    date: string;
    summary: string;
}

interface PatientTimelineProps {
    events: TimelineEvent[];
    patientId: string;
}

export function PatientTimeline({ events, patientId }: PatientTimelineProps) {
    const { recordId: currentRecordId } = useParams<{ recordId: string }>();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Histórico do Paciente</h3>
                <p className="text-xs text-slate-500 mt-1">Linha do tempo de atendimentos</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                {events.map((event, index) => {
                    const isCurrent = Number(currentRecordId) === event.id;

                    // Determine styling based on category or record_type legacy
                    const category = (event as any).structured_content?.categoria;
                    let badgeColor = 'bg-blue-100 text-blue-600'; // Default Blue
                    let Icon = Activity;
                    let label = 'Atendimento';

                    if (category === 'anamnese' || (!category && event.record_type === 'anamnese')) {
                        badgeColor = 'bg-emerald-100 text-emerald-600';
                        Icon = FileText;
                        label = 'Anamnese';
                    } else if (category === 'evolucao' || (!category && event.record_type === 'evolucao')) {
                        badgeColor = 'bg-blue-100 text-blue-600';
                        Icon = Activity;
                        label = 'Evolução';
                    } else if (category === 'completo') {
                        badgeColor = 'bg-purple-100 text-purple-600';
                        Icon = Activity; // Or Check
                        label = 'Completo';
                    }

                    return (
                        <div key={event.id} className="relative pl-4">
                            {/* Vertical Line */}
                            {index !== events.length - 1 && (
                                <div className="absolute left-[19px] top-8 bottom-[-16px] w-0.5 bg-slate-100"></div>
                            )}

                            <Link
                                to={`/patient/${patientId}/record/${event.id}`}
                                className={`block relative z-10 group ${isCurrent ? 'pointer-events-none' : ''}`}
                            >
                                <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isCurrent
                                    ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                                    }`}>
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${badgeColor}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-semibold uppercase tracking-wider ${badgeColor.split(' ')[1]}`}>
                                                {label}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(event.date).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className={`text-sm line-clamp-2 ${isCurrent ? 'text-slate-700 font-medium' : 'text-slate-600'}`}>
                                            {getRecordSummary(event)}
                                        </p>
                                    </div>

                                    {!isCurrent && (
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 self-center" />
                                    )}
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
