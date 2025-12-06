import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, FileText, Users, TrendingUp } from 'lucide-react';

interface MedicalRecordSummary {
    id: number;
    record_type: 'anamnese' | 'evolucao';
    created_at: string;
}

export default function DashboardHome() {
    const [stats, setStats] = useState({
        totalToday: 0,
        totalAnamneses: 0,
        totalEvolucoes: 0,
        totalRecords: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/medical-records/');
                const records: MedicalRecordSummary[] = response.data;

                const today = new Date().toISOString().split('T')[0];

                const totalToday = records.filter(r => r.created_at.startsWith(today)).length;

                // Logic based on dynamic 'category' (structured_content.categoria)
                // Fallback to record_type if category is missing (legacy records)
                const totalAnamneses = records.filter(r => {
                    const sc = (r as any).structured_content;
                    const cat = sc?.categoria || sc?.data?.categoria;

                    if (cat) return cat === 'anamnese' || cat === 'completo';
                    return r.record_type === 'anamnese';
                }).length;

                const totalEvolucoes = records.filter(r => {
                    const sc = (r as any).structured_content;
                    const cat = sc?.categoria || sc?.data?.categoria;

                    if (cat) return cat === 'evolucao' || cat === 'completo';
                    return r.record_type === 'evolucao';
                }).length;

                setStats({
                    totalToday,
                    totalAnamneses,
                    totalEvolucoes,
                    totalRecords: records.length
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            label: 'Atendimentos Hoje',
            value: stats.totalToday,
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Total de Registros',
            value: stats.totalRecords,
            icon: FileText,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Anamneses',
            value: stats.totalAnamneses,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            label: 'Evoluções',
            value: stats.totalEvolucoes,
            icon: TrendingUp,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Visão geral da sua clínica hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${card.bg}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{card.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-400 border-dashed">
                Gráficos e métricas detalhadas em breve...
            </div>
        </div>
    );
}
