import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, UploadCloud, LogOut, Menu, Users } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/patients', label: 'Pacientes', icon: Users },
        { path: '/history', label: 'Histórico', icon: History },
        { path: '/upload', label: 'Novo Upload', icon: UploadCloud },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-20`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    {isSidebarOpen && (
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Vita.AI
                        </span>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive(item.path)
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            {isSidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-100">
                    <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group">
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                        {isSidebarOpen && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
