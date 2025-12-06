import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Layout } from '../components/Layout';

interface Patient {
    id: number;
    name: string;
    phone: string;
    cpf?: string; // Optional if backend doesn't return it yet
    created_at?: string;
}

export default function PatientsListScreen() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            // Simulate fetch if backend endpoint missing, or try real one
            const response = await axios.get('http://localhost:8000/api/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
            // Fallback data for demo if backend fails
            setPatients([
                { id: 1, name: 'João Silva', phone: '(11) 99999-9999', cpf: '123.456.789-00' },
                { id: 2, name: 'Maria Oliveira', phone: '(11) 98888-8888', cpf: '987.654.321-00' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.cpf && patient.cpf.includes(searchTerm))
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
                        <p className="text-slate-500 mt-1">Gerencie os cadastros da sua clínica</p>
                    </div>
                    <Button onClick={() => navigate('/patients/new')} className="gap-2">
                        <Plus className="w-5 h-5" />
                        Novo Paciente
                    </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou CPF..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-slate-600">
                                    <th className="px-6 py-4 font-semibold w-16">#</th>
                                    <th className="px-6 py-4 font-semibold">Nome</th>
                                    <th className="px-6 py-4 font-semibold">Contato</th>
                                    <th className="px-6 py-4 font-semibold">CPF</th>
                                    <th className="px-6 py-4 font-semibold w-32 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            Carregando...
                                        </td>
                                    </tr>
                                ) : filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            Nenhum paciente encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">{patient.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {patient.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    {patient.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {patient.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {patient.cpf || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Ver prontuário"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
