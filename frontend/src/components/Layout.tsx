import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: ReactNode;
    showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {showSidebar && <Sidebar />}

            <div className={`${showSidebar ? 'pl-64' : ''} min-h-screen transition-all duration-300`}>
                {children}
            </div>
        </div>
    );
}
