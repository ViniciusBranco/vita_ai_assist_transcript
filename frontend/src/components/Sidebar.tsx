import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, Settings } from 'lucide-react';

export function Sidebar() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    const navItems = [
        { icon: Home, label: 'Início', path: '/' },
        { icon: Users, label: 'Pacientes', path: '/patients' },
        { icon: FileText, label: 'Prontuários', path: '/records' }, // Placeholder
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    V
                </div>
                <span className="font-bold text-xl text-slate-800">Vita.AI</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm shadow-blue-100'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-slate-100">
                <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-medium">
                        DR
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">Dr. Exemplo</p>
                        <p className="text-xs text-slate-500 truncate">Dentista</p>
                    </div>
                    <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                </button>
            </div>
        </aside>
    );
}
