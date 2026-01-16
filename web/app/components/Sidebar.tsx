'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Users, Briefcase, Settings, FileText, Zap, Menu, X, LogOut, Target } from 'lucide-react';
import { api } from '@/src/api/client';

interface SidebarProps {
    user?: any;
    onSignOut?: () => void;
    currentView?: string;
    onViewChange?: (view: string) => void;
}

export default function Sidebar({ user, onSignOut, currentView, onViewChange }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname, currentView]);

    const NavItem = ({ id, icon: Icon, label }: any) => {
        // active state logic
        const isActive = currentView === id || (id === 'dashboard' && !currentView && pathname === '/');

        const handleClick = () => {
            if (onViewChange) {
                onViewChange(id);
            } else {
                if (id === 'dashboard') router.push('/');
                else router.push('/');
            }
        };

        return (
            <div
                onClick={handleClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium cursor-pointer transition-all group mb-1 ${isActive
                    ? 'bg-[#1e1b4b] text-white shadow-lg shadow-indigo-500/10 border border-indigo-500/20' // Darker active state
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
            >
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'} />
                <span>{label}</span>
            </div>
        );
    };

    return (
        <>
            {/* Mobile Hamburger Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 bg-gray-900/90 backdrop-blur border border-white/10 rounded-lg text-white shadow-xl"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 bg-[#020617] border-r border-white/5 p-6 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Header / Logo */}
                <div className="mb-10 px-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 transform -rotate-6">
                            <Zap fill="currentColor" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Agency OS</h1>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Management Suite</span>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto space-y-1">
                    <NavItem id="dashboard" icon={LayoutGrid} label="Dashboard" />
                    <NavItem id="projects" icon={Briefcase} label="Projects" />
                    <NavItem id="leads" icon={Target} label="Leads" />
                    <NavItem id="contacts" icon={Users} label="Clients" />
                    <NavItem id="finance" icon={FileText} label="Invoices" />
                    <NavItem id="team" icon={Users} label="Team" />
                    <NavItem id="settings" icon={Settings} label="Settings" />
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto pt-6">
                    <button
                        onClick={async () => {
                            if (confirm("Confirm upgrade to PRO plan? This will unlock unlimited projects.")) {
                                try {
                                    await api.post('/auth/upgrade');
                                    alert("Successfully upgraded to PRO!");
                                    window.location.reload();
                                } catch (e) {
                                    alert("Upgrade failed. Please try again.");
                                }
                            }
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 mb-4"
                    >
                        Upgrade Plan
                    </button>

                    {user && (
                        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                {(user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors truncate flex-1">
                                {user.email}
                            </div>
                            <LogOut size={16} className="text-gray-500 hover:text-red-400 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                onSignOut && onSignOut();
                            }} />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
