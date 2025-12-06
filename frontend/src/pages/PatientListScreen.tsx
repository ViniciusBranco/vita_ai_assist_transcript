import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Search, Edit, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Patient {
    id: number;
    name: string;
    cpf: string | null;
    phone: string | null;
    birth_date: string | null;
}

export default function PatientListScreen() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Error loading patients:', error);
            // Fallback for demo if backend not ready
            // setPatients([
            //    { id: 1, name: 'João Silva', cpf: '123.456.789-00', phone: '(11) 99999-9999', birth_date: '1985-05-15' }
            // ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.cpf && patient.cpf.includes(searchTerm)) ||
        (patient.phone && patient.phone.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
                    <p className="text-slate-500">Gerencie os pacientes cadastrados</p>
                </div>
                <Button onClick={() => navigate('/patients/new')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Paciente
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome, CPF ou telefone..."
                    className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patients List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map(patient => (
                        <div key={patient.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                    {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <Link to={`/patients/${patient.id}`} className="p-2 -mr-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4" />
                                </Link>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{patient.name}</h3>
                            <div className="space-y-1 text-sm text-slate-500 mb-4">
                                <p>{patient.phone || 'Sem telefone'}</p>
                                <p>{patient.cpf ? `CPF: ${patient.cpf}` : 'Sem CPF'}</p>
                            </div>

                            <button
                                onClick={() => navigate(`/patients/${patient.id}/full-history`)}
                                className="w-full py-2 px-4 bg-slate-50 text-slate-600 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white hover:!bg-blue-700 hover:text-white cursor-pointer"
                            >
                                Ver Prontuário
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    {filteredPatients.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            Nenhum paciente encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
