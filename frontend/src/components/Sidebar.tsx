import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    History,
    Users,
    UploadCloud,
    Calendar,
    DollarSign,
    Package,
    BarChart3,
    Settings,
    LogOut,
    Menu
} from 'lucide-react';

interface NavItem {
    icon: any;
    label: string;
    path: string;
    isMock?: boolean;
    isHighlight?: boolean;
    badge?: string;
}

interface AppSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    const navItems: NavItem[] = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: History, label: 'Histórico', path: '/history' },
        { icon: DollarSign, label: 'Finanças', path: '/finance', badge: 'New' },
        { icon: Users, label: 'Pacientes', path: '/patients' },
        { icon: UploadCloud, label: 'Novo Upload', path: '/upload', isHighlight: true },
    ];

    const mockItems: NavItem[] = [
        { icon: Calendar, label: 'Agenda', path: '#agenda', isMock: true },
        // Moved to core: { icon: DollarSign, label: 'Financeiro', path: '#finance', isMock: true },
        { icon: Package, label: 'Estoque', path: '#stock', isMock: true },
        { icon: BarChart3, label: 'Relatórios', path: '#reports', isMock: true },
        { icon: Settings, label: 'Configurações', path: '#settings', isMock: true },
    ];

    const handleMockClick = (e: React.MouseEvent, label: string) => {
        e.preventDefault();
        alert(`O módulo "${label}" estará disponível em breve na versão 2.0! \nEstamos trabalhando nisso. 🚀`);
    };

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-white z-50 flex flex-col shadow-xl transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
            {/* Header: Logo & Toggle */}
            <div className={`p-6 border-b border-slate-800 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} transition-all`}>
                {isOpen && (
                    <div className="flex items-center gap-3 animate-fade-in">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
                            V
                        </div>
                        <span className="font-bold text-xl tracking-tight">Vita.AI</span>
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ${!isOpen && 'w-full flex justify-center'}`}
                    title={isOpen ? "Recolher menu" : "Expandir menu"}
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-6 flex flex-col gap-6 px-3">

                {/* Core Modules */}
                <div>
                    {isOpen && (
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 animate-fade-in">
                            Principal
                        </p>
                    )}
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!isOpen ? item.label : ''}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 border group ${isActive(item.path)
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border-blue-500/50' // Highlighted
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border-transparent'
                                    } ${!isOpen ? 'justify-center' : 'justify-between'} font-medium`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-white'
                                        }`} />
                                    {isOpen && <span className="truncate">{item.label}</span>}
                                </div>
                                {isOpen && item.badge && (
                                    <span className="text-[10px] font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Future Modules */}
                <div>
                    {isOpen && (
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 animate-fade-in">
                            Gestão (Em Breve)
                        </p>
                    )}
                    <nav className="space-y-1">
                        {mockItems.map((item) => (
                            <a
                                key={item.path}
                                href={item.path}
                                onClick={(e) => handleMockClick(e, item.label)}
                                title={!isOpen ? `${item.label} (Em breve)` : ''}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-all cursor-pointer group ${!isOpen ? 'justify-center' : 'justify-between'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5 text-slate-600 group-hover:text-slate-500 flex-shrink-0" />
                                    {isOpen && <span>{item.label}</span>}
                                </div>
                                {isOpen && (
                                    <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-600">
                                        V2
                                    </span>
                                )}
                            </a>
                        ))}
                    </nav>
                </div>

            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button
                    className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-800 transition-colors text-left group ${!isOpen ? 'justify-center' : ''}`}
                >
                    <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 shadow-sm flex items-center justify-center text-slate-400 font-medium flex-shrink-0">
                        DA
                    </div>
                    {isOpen && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">Dra. Ana</p>
                                <p className="text-xs text-slate-500 truncate">Sair da conta</p>
                            </div>
                            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
