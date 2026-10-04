'use client';

import React from 'react';
import Link from 'next/link';
import {
    Briefcase, Target, Users, Clock, CheckCircle2, ChevronRight,
    ArrowUpRight, ShieldCheck, MessageSquare, ClipboardList, Activity,
    Calendar, AlertCircle
} from 'lucide-react';
import CheckInWidget from './CheckInWidget';
import { formatINR } from '../page';

interface LeadershipDashboardViewProps {
    user: any;
    projects: any[];
    leads: any[];
    tasks: any[];
    team: any[];
    onViewChange: (view: string) => void;
}

export default function LeadershipDashboardView({
    user,
    projects,
    leads,
    tasks,
    team,
    onViewChange
}: LeadershipDashboardViewProps) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE');
    const totalLeads = leads.length;
    const pipelineValue = leads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);
    const wonLeads = leads.filter(l => l.status === 'WON');
    const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <ShieldCheck size={18} />
                        </span>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Executive Operations Dashboard
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Operations leadership for <span className="text-indigo-300 font-semibold">{user?.companyName || 'dhandaeasy'}</span> • Cross-department oversight
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onViewChange('attendance')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 transition-colors shadow-sm"
                    >
                        <Clock size={14} className="text-emerald-400" />
                        <span>View Live Attendance</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewChange('daily_reports_feed')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                    >
                        <ClipboardList size={14} className="text-indigo-400" />
                        <span>Review Staff Reports</span>
                    </button>
                </div>
            </div>

            {/* Check-In Status */}
            <CheckInWidget user={user} />

            {/* Executive Operations KPIs (NO Financial Invoices - Private to Company Admin) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Active Projects</span>
                        <Briefcase size={16} className="text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-white mt-2 font-mono">
                        {activeProjects.length} / {totalProjects}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Delivery operations</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Shared Pipeline</span>
                        <Target size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
                        {formatINR(pipelineValue)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">{totalLeads} active leads</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Deals Won</span>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300 mt-2 font-mono">
                        {wonLeads.length}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Conversions closed</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Operational Tasks</span>
                        <Activity size={16} className="text-purple-400" />
                    </div>
                    <div className="text-2xl font-black text-purple-300 mt-2 font-mono">
                        {completedTasks} / {tasks.length}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Execution progress</div>
                </div>
            </div>

            {/* Two Column Layout: Projects & Leads Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Projects */}
                <div className="p-5 rounded-2xl bg-[#050814] border border-white/10 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                            <Briefcase size={15} className="text-indigo-400" />
                            Client Projects Overview
                        </h2>
                        <button
                            type="button"
                            onClick={() => onViewChange('projects')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                            <span>Manage All</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {projects.slice(0, 5).map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="block p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors truncate">
                                        {project.name}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                        {project.status || 'ACTIVE'}
                                    </span>
                                </div>
                                <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
                                    <span>Client: {project.clientEmail || 'Internal'}</span>
                                    <span>{project._count?.tasks ?? project.tasks?.length ?? 0} Tasks</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Shared Organization Leads Pipeline */}
                <div className="p-5 rounded-2xl bg-[#050814] border border-white/10 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                            <Target size={15} className="text-amber-400" />
                            Shared Organization Leads
                        </h2>
                        <button
                            type="button"
                            onClick={() => onViewChange('leads')}
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                        >
                            <span>Open Pipeline</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {leads.slice(0, 5).map((lead) => (
                            <div
                                key={lead.id}
                                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-bold text-xs text-white truncate">
                                        {lead.name} {lead.company ? `(${lead.company})` : ''}
                                    </div>
                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                        Assigned to: <span className="text-indigo-300">{lead.assignedToName || 'Sales Pool'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-emerald-400 font-mono">
                                        {formatINR(lead.value)}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                                        {lead.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
