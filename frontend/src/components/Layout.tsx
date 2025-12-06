import { useState, type ReactNode } from 'react';
import { AppSidebar } from './Sidebar';

interface LayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {showSidebar && <AppSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />}

            <div className={`${showSidebar ? (isSidebarOpen ? 'pl-64' : 'pl-20') : ''} min-h-screen transition-all duration-300`}>
                {children}
            </div>
        </div>
    );
}
