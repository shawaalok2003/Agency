'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Briefcase, Plus, CheckSquare, Clock, Code2, Terminal,
    ExternalLink, AlertCircle, ArrowUpRight, MessageSquare,
    ClipboardList, CheckCircle2, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import CheckInWidget from './CheckInWidget';

interface TechDashboardViewProps {
    user: any;
    projects: any[];
    tasks: any[];
    onOpenNewProject: () => void;
    onViewChange: (view: string) => void;
}

export default function TechDashboardView({
    user,
    projects,
    tasks,
    onOpenNewProject,
    onViewChange
}: TechDashboardViewProps) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED');

    return (
        <div className="space-y-6">
            {/* Header with Title and Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Code2 size={18} />
                        </span>
                        <h1 className="text-xl font-bold text-white tracking-tight">
                            Tech & Engineering Workspace
                        </h1>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Welcome back, <span className="text-cyan-300 font-semibold">{user?.name || user?.email}</span> • {user?.companyName || user?.email?.split('@')[0]?.toUpperCase()} Engineering Core
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenNewProject}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/30 border border-cyan-400/30 transition-all active:scale-95"
                    >
                        <Plus size={15} />
                        <span>+ New Project</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewChange('daily_tracker')}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                    >
                        <ClipboardList size={14} className="text-cyan-400" />
                        <span>Log Daily Tasks</span>
                    </button>
                </div>
            </div>

            {/* Check-In Attendance Tracker Card */}
            <CheckInWidget user={user} />

            {/* Tech KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Total Dev Projects</span>
                        <Briefcase size={16} className="text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-white mt-2 font-mono">
                        {totalProjects}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                        {activeProjects.length} actively in development
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Pending Tasks / Bugs</span>
                        <Clock size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
                        {pendingTasks.length}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">In sprint queue</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Completed Tasks</span>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300 mt-2 font-mono">
                        {completedTasks}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Shipped deliverables</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Sprint Completion</span>
                        <Terminal size={16} className="text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-indigo-300 mt-2 font-mono">
                        {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '100%'}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Velocity rate</div>
                </div>
            </div>

            {/* Engineering Projects Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                        <Layers size={15} className="text-cyan-400" />
                        Active Engineering Projects ({projects.length})
                    </h2>
                    <button
                        type="button"
                        onClick={() => onViewChange('projects')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                        <span>View All Projects</span>
                        <ChevronRight size={13} />
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#050814] border border-white/10 text-center space-y-3">
                        <Code2 size={36} className="mx-auto text-gray-500" />
                        <div className="text-sm font-bold text-white">No Projects in Development Yet</div>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                            As a tech team member, you can start a new development project now.
                        </p>
                        <button
                            type="button"
                            onClick={onOpenNewProject}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all"
                        >
                            <Plus size={14} />
                            <span>Create Your First Project</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="group p-5 rounded-2xl bg-[#060a17] hover:bg-[#090f24] border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                            {project.status || 'ACTIVE'}
                                        </span>
                                        <ArrowUpRight size={15} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                        Client: {project.clientEmail || 'Internal / Direct'}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <CheckSquare size={13} className="text-indigo-400" />
                                        {project._count?.tasks ?? project.tasks?.length ?? 0} Tasks
                                    </span>
                                    <span className="text-gray-500">
                                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Action Footer Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() => onViewChange('team_chat')}
                    className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-[#070b18] border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-md group flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                Tech & Dev Channel (#tech-dev)
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                                Coordinate architecture, PR reviews, and releases
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-cyan-400" />
                </div>

                <div
                    onClick={() => onViewChange('daily_tracker')}
                    className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-[#070b18] border border-indigo-500/20 hover:border-indigo-500/40 transition-all shadow-md group flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                            <ClipboardList size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                Submit Daily Tech Report
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                                Log your tickets completed, PRs merged & blockers for admin
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:text-indigo-400" />
                </div>
            </div>
        </div>
    );
}
