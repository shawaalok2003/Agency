'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid, Briefcase, CheckSquare, Calendar, Target,
    FileText, Users, ExternalLink, Receipt, CreditCard,
    TrendingUp, UserCheck, Clock, BarChart3, Settings,
    Zap, Menu, X, LogOut, ChevronRight, ShieldCheck, Sparkles, ArrowLeft
} from 'lucide-react';
import { api } from '@/src/api/client';

interface SidebarProps {
    user?: any;
    onSignOut?: () => void;
    currentView?: string;
    onViewChange?: (view: string) => void;
    currentProjectName?: string;
    counts?: {
        projects?: number;
        leads?: number;
        tasks?: number;
        invoices?: number;
        approvals?: number;
        team?: number;
    };
}

export default function Sidebar({
    user,
    onSignOut,
    currentView = 'dashboard',
    onViewChange,
    currentProjectName,
    counts = {}
}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname, currentView]);

    const isPro = user?.plan === 'PRO';
    const isTrialActive = Boolean(user?.trialEndsAt && new Date(user.trialEndsAt) > new Date());
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 3600 * 24)))
        : 0;

    const navSections = [
        {
            title: 'WORKSPACE',
            items: [
                { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
                { id: 'projects', label: 'Projects', icon: Briefcase, badge: counts.projects },
                { id: 'tasks', label: 'Tasks & Priorities', icon: CheckSquare, badge: counts.tasks },
                { id: 'calendar', label: 'Deadlines & Calendar', icon: Calendar },
            ]
        },
        {
            title: 'SALES & CRM',
            items: [
                { id: 'leads', label: 'Leads Pipeline', icon: Target, badge: counts.leads },
                { id: 'proposals', label: 'Proposals', icon: FileText },
            ]
        },
        {
            title: 'CLIENTS',
            items: [
                { id: 'contacts', label: 'Clients Directory', icon: Users },
                { id: 'portal_preview', label: 'Client Portal', icon: ExternalLink, tag: 'Live' },
            ]
        },
        {
            title: 'FINANCE',
            items: [
                { id: 'finance', label: 'Invoices & Billing', icon: Receipt, badge: counts.invoices },
                { id: 'payments', label: 'Payments & Ledger', icon: CreditCard },
                { id: 'profitability', label: 'Project Margins', icon: TrendingUp },
            ]
        },
        {
            title: 'TEAM & OPERATIONS',
            items: [
                { id: 'team', label: 'Team & Sales Workspace', icon: UserCheck, badge: counts.team },
                { id: 'approvals', label: 'Client Approvals', icon: Clock, badge: counts.approvals },
            ]
        },
        {
            title: 'SYSTEM',
            items: [
                { id: 'settings', label: 'Settings', icon: Settings },
            ]
        }
    ];

    const handleSelectView = (id: string) => {
        if (id === 'portal_preview') {
            router.push('/portal/preview');
            return;
        }
        if (pathname !== '/') {
            router.push(`/?view=${id}`);
            return;
        }
        if (onViewChange) {
            onViewChange(id);
        } else {
            router.push(`/?view=${id}`);
        }
    };

    const NavItem = ({ id, icon: Icon, label, badge, tag }: any) => {
        const isActive = pathname === '/'
            ? currentView === id || (id === 'dashboard' && !currentView)
            : pathname.startsWith('/projects') && id === 'projects';

        return (
            <button
                type="button"
                onClick={() => handleSelectView(id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group mb-0.5 text-left ${
                    isActive
                        ? 'bg-gradient-to-r from-indigo-900/60 to-indigo-800/40 text-white shadow-md shadow-indigo-500/10 border border-indigo-500/30'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.04] border border-transparent'
                }`}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <Icon
                        size={17}
                        className={`shrink-0 transition-colors ${
                            isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'
                        }`}
                    />
                    <span className="truncate">{label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {tag && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {tag}
                        </span>
                    )}
                    {badge !== undefined && badge !== null && (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive
                                    ? 'bg-indigo-500/30 text-indigo-200'
                                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-gray-200'
                            }`}
                        >
                            {badge}
                        </span>
                    )}
                </div>
            </button>
        );
    };

    return (
        <>
            {/* Mobile Hamburger Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2.5 bg-[#0a0f1d]/90 backdrop-blur border border-white/10 rounded-xl text-white shadow-xl hover:bg-white/10 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Consistent Sidebar Container */}
            <aside
                className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 bg-[#030712] border-r border-white/[0.06] p-4 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}
            >
                {/* Header / Logo */}
                <div className="px-2 pt-2 pb-4 flex items-center justify-between border-b border-white/[0.06] mb-3">
                    <Link href="/?view=dashboard" className="flex items-center gap-2 group">
                        <img
                            src="/logo.png"
                            alt="agnecyos"
                            className="h-9 w-auto max-w-[175px] object-contain rounded-lg border border-white/10 group-hover:border-indigo-500/40 transition-all shadow-md shadow-indigo-500/10"
                        />
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest shrink-0">
                            v2.4
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white p-1"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Current Project Context Card (Shown when inside a project page) */}
                {currentProjectName && (
                    <div className="px-3 py-2.5 mx-1 mb-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 block">
                                Project Context
                            </span>
                            <div className="text-xs font-bold text-white truncate">{currentProjectName}</div>
                        </div>
                        <Link
                            href="/?view=projects"
                            className="text-[10px] text-gray-300 hover:text-white px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 shrink-0 font-medium transition-colors"
                        >
                            All Projects
                        </Link>
                    </div>
                )}

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1 custom-scrollbar">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-0.5">
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                                {section.title}
                            </div>
                            {section.items.map((item) => (
                                <NavItem
                                    key={item.id}
                                    id={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    badge={(item as any).badge}
                                    tag={(item as any).tag}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom Subscription & User Profile */}
                <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-3">
                    {/* Subscription Status Card */}
                    {isPro ? (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/20">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                                    <ShieldCheck size={14} /> Growth Plan
                                </span>
                                <span className="text-[10px] text-gray-400">Renews Oct 28, 2026</span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                                Unlimited projects & client portals
                            </div>
                        </div>
                    ) : isTrialActive ? (
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                                    <Sparkles size={13} className="text-indigo-400" /> Pro Trial
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                                    {trialDaysRemaining}d remaining
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-2.5">
                                Using all premium agency features
                            </p>
                            <button
                                onClick={async () => {
                                    if (confirm('Upgrade to Pro Growth Plan?')) {
                                        try {
                                            await api.post('/auth/upgrade');
                                            alert('Upgraded to Pro Plan!');
                                            window.location.reload();
                                        } catch (e) {
                                            alert('Upgrade failed.');
                                        }
                                    }
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 rounded-lg font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                                Upgrade Plan <ChevronRight size={13} />
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                            <div className="text-xs font-bold text-gray-300 mb-1">Free Plan</div>
                            <p className="text-[11px] text-gray-400 mb-2">
                                Unlock unlimited projects, GST & client portals.
                            </p>
                            <button
                                onClick={async () => {
                                    if (confirm('Upgrade to Pro Plan?')) {
                                        try {
                                            await api.post('/auth/upgrade');
                                            alert('Upgraded to Pro Plan!');
                                            window.location.reload();
                                        } catch (e) {
                                            alert('Upgrade failed.');
                                        }
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
                            >
                                Upgrade Plan
                            </button>
                        </div>
                    )}

                    {/* User Profile Bar */}
                    {user && (
                        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/10 shrink-0">
                                {(user.email || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-gray-200 truncate">
                                    {(user.email || 'agency@agnecyos.io').split('@')[0]}
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium capitalize">
                                    {user.role ? user.role.toLowerCase().replace('_', ' ') : 'Agency Owner'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSignOut && onSignOut();
                                }}
                                title="Sign out"
                                className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
