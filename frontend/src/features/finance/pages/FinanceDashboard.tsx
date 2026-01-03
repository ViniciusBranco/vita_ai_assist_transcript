import { useQuery } from '@tanstack/react-query';
import {
    FileText,
    CheckCircle2,
    Clock,
    TrendingUp,
    Plus,
    Filter,
    ChevronRight,
    Search
} from 'lucide-react';
import { financeApi } from '../api/financeApi';
import { DocumentUpload } from '../components/DocumentUpload';

export default function FinanceDashboard() {
    const { data: documents } = useQuery({
        queryKey: ['finance-documents'],
        queryFn: () => financeApi.getDocuments({}),
        // Mock data for initial skeleton
        initialData: [
            { id: '1', filename: 'Extrato_BB_03-2024.pdf', uploadDate: '2024-03-01', status: 'processed', type: 'statement', workspaceId: '1', competence: '2024-03' },
            { id: '2', filename: 'NF_001_Med_Servicos.pdf', uploadDate: '2024-03-05', status: 'processed', type: 'tax_document', workspaceId: '1', competence: '2024-03', amount: 1200.00 },
            { id: '3', filename: 'Extrato_Nubank_03-2024.csv', uploadDate: '2024-03-02', status: 'processed', type: 'statement', workspaceId: '1', competence: '2024-03' },
            { id: '4', filename: 'NF_992_Clinica_Sul.pdf', uploadDate: '2024-03-10', status: 'pending', type: 'tax_document', workspaceId: '1', competence: '2024-03', amount: 450.00 },
            { id: '5', filename: 'Recibo_Aluguel_Mar.pdf', uploadDate: '2024-03-12', status: 'pending', type: 'tax_document', workspaceId: '1', competence: '2024-03', amount: 2500.00 }
        ] as any
    });

    const stats = {
        totalDocs: documents?.length || 0,
        pending: documents?.filter((d: any) => d.status === 'pending').length || 0,
        projection: documents?.reduce((acc: number, d: any) => acc + (d.amount || 0), 0) || 0
    };

    return (
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Painel Financeiro</h1>
                    <p className="text-slate-500 font-medium">Reconciliação e gestão fiscal Vita.AI</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar doc..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95 font-semibold">
                        <Plus className="w-5 h-5" />
                        Novo Lote
                    </button>
                </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Documentos Processados"
                    value={stats.totalDocs}
                    icon={CheckCircle2}
                    color="blue"
                    trend="+5 este mês"
                />
                <StatCard
                    title="Reconciliações Pendentes"
                    value={stats.pending}
                    icon={Clock}
                    color="amber"
                    trend="Ação requerida"
                />
                <StatCard
                    title="Projeção Livro-Caixa"
                    value={`R$ ${stats.projection.toLocaleString('pt-BR')}`}
                    icon={TrendingUp}
                    color="emerald"
                    trend="Março 2024"
                />
            </div>

            {/* Main Content: Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Bank Statements */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-blue-500">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Extratos Bancários</h2>
                        </div>
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                            Configurar Contas
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {documents?.filter((d: any) => d.type === 'statement').map((doc: any) => (
                            <DocumentRow key={doc.id} doc={doc} />
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50/50">
                        <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-sm font-medium hover:bg-white hover:border-blue-300 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            Adicionar Extrato
                        </button>
                    </div>
                </div>

                {/* Right: Tax Documents Identified */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden border-t-4 border-t-purple-500">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Notas e Despesas</h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {documents?.filter((d: any) => d.type === 'tax_document').map((doc: any) => (
                            <DocumentRow key={doc.id} doc={doc} />
                        ))}
                    </div>
                    <div className="p-6">
                        <DocumentUpload onFilesSelect={(files) => console.log('Selected files:', files)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        blue: 'bg-blue-600 text-white shadow-blue-200',
        amber: 'bg-amber-500 text-white shadow-amber-100',
        emerald: 'bg-emerald-500 text-white shadow-emerald-100'
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colors[color]} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
            </div>
        </div>
    );
}

function DocumentRow({ doc }: { doc: any }) {
    return (
        <div className="p-4 flex items-center justify-between group hover:bg-slate-50/80 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.status === 'processed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-800">{doc.filename}</h4>
                    <p className="text-xs text-slate-400 font-medium">Upload em {doc.uploadDate}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {doc.amount && (
                    <span className="text-sm font-bold text-slate-700">R$ {doc.amount.toFixed(2)}</span>
                )}
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${doc.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {doc.status === 'processed' ? 'OK' : 'Pendente'}
                </div>
            </div>
        </div>
    );
}
