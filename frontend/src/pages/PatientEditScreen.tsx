import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Save, User } from 'lucide-react';

export default function PatientEditScreen() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cpf: '',
        birth_date: '',
        aliases: '' // Store as string for input
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            loadPatient(id);
        }
    }, [id, isNew]);

    const loadPatient = async (patientId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8000/api/patients/${patientId}`);
            // Transform aliases array to string for input
            const data = response.data;
            setFormData({
                ...data,
                // Ensure date is YYYY-MM-DD (remove time if present)
                birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
                aliases: Array.isArray(data.aliases) ? data.aliases.join(', ') : (data.aliases || '')
            });
        } catch (error) {
            console.error('Error loading patient:', error);
            // Mock data for demo
            if (patientId === '1') {
                setFormData({
                    name: 'João Silva',
                    phone: '(11) 99999-9999',
                    cpf: '123.456.789-00',
                    birth_date: '1985-05-15',
                    aliases: 'Joãozinho, Jota'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Prepare payload: convert aliases string -> array
        const payload = {
            ...formData,
            aliases: formData.aliases.split(',').map(s => s.trim()).filter(Boolean)
        };

        try {
            if (isNew) {
                await axios.post('http://localhost:8000/api/patients', payload);
            } else {
                await axios.put(`http://localhost:8000/api/patients/${id}`, payload);
            }
            alert('Paciente salvo com sucesso!');
            navigate('/patients');
        } catch (error) {
            console.error('Error saving patient:', error);
            alert('Erro ao salvar paciente. (Endpoints do Backend podem não existir ainda)');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-8 py-8">
            <button
                onClick={() => navigate('/patients')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar para lista
            </button>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {isNew ? 'Novo Paciente' : 'Editar Paciente'}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {isNew ? 'Cadastre as informações do novo paciente' : `ID: ${id}`}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Ex: João da Silva"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Apelidos / Como prefere ser chamado</label>
                            <input
                                type="text"
                                name="aliases"
                                value={formData.aliases}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Separe por vírgulas. Ex: Zezinho, Jota"
                            />
                            <p className="text-xs text-slate-400">Isso ajuda na identificação do paciente durante a transcrição.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">CPF</label>
                            <input
                                type="text"
                                name="cpf"
                                required
                                value={formData.cpf}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                placeholder="000.000.000-00"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Telefone / WhatsApp</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Data de Nascimento</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/patients')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="min-w-[120px]"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
