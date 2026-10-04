'use client';

import React, { useState } from 'react';
import {
    Target, TrendingUp, CheckSquare, Phone, Calendar, Plus,
    DollarSign, Flame, Clock, ArrowRight, MessageSquare,
    ExternalLink, AlertCircle, CheckCircle, ChevronRight, Filter
} from 'lucide-react';
import { api } from '@/src/api/client';
import { formatINR, formatCompactINR } from '@/app/page';
import CheckInWidget from './CheckInWidget';

interface SalesDashboardProps {
    user: any;
    leads: any[];
    onRefresh: () => Promise<void>;
    onViewChange: (view: string) => void;
    onCreateLead: () => void;
}

export default function SalesDashboardView({
    user,
    leads,
    onRefresh,
    onViewChange,
    onCreateLead
}: SalesDashboardProps) {
    const [selectedStage, setSelectedStage] = useState<string>('ALL');
    const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

    // Shared organization-wide leads pool (All leads within the company reflect to sales & admin)
    const myLeads = leads;

    const filteredLeads = selectedStage === 'ALL'
        ? myLeads
        : myLeads.filter(l => l.status === selectedStage);

    // Compute metrics
    const totalPipelineValue = myLeads.reduce((acc, l) => acc + (parseFloat(l.value?.toString()) || 0), 0);
    const wonLeads = myLeads.filter(l => l.status === 'WON');
    const wonRevenue = wonLeads.reduce((acc, l) => acc + (parseFloat(l.value?.toString()) || 0), 0);
    const openLeads = myLeads.filter(l => l.status !== 'WON' && l.status !== 'LOST');

    // 1-Click Update Stage
    const handleUpdateStage = async (leadId: string, newStage: string) => {
        setUpdatingLeadId(leadId);
        try {
            await api.patch(`/leads/${leadId}/status`, { status: newStage });
            await onRefresh();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update lead status');
        } finally {
            setUpdatingLeadId(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 uppercase tracking-wide">
                            {user?.department || 'SALES'} DEPARTMENT • {user?.companyName || user?.email?.split('@')[0]?.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-xs text-gray-400 font-medium">Logged in as {user?.name || user?.email}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" /> Sales Workspace &amp; Pipeline
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                        Manage your assigned leads, update deal stages, log daily work, and communicate with departments.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onViewChange('daily_tracker')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-white transition-all shadow-sm"
                    >
                        <CheckSquare size={15} className="text-emerald-400" />
                        <span>Daily Work Tracker</span>
                    </button>
                    <button
                        onClick={onCreateLead}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
                    >
                        <Plus size={16} />
                        <span>Capture New Lead</span>
                    </button>
                </div>
            </div>

            {/* Live Shift & Attendance Widget */}
            <CheckInWidget user={user} />

            {/* Quick Daily Tracker Callout Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0a1426] to-[#0a0f1d] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <Flame size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Keep Company Admin Updated</h3>
                        <p className="text-xs text-gray-300 mt-0.5 max-w-xl">
                            All your daily calls, meetings, leads contacted, and deal milestones are automatically synced in real-time to the Company Admin dashboard (<span className="text-emerald-300 font-mono">{user?.companyName || 'your company'}</span>).
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => onViewChange('team_chat')}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1.5"
                    >
                        <MessageSquare size={14} className="text-indigo-400" /> Inter-Team Chat
                    </button>
                    <button
                        onClick={() => onViewChange('daily_tracker')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                    >
                        Log Today&apos;s Work <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Sales Performance Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">ACTIVE LEADS</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Target size={18} />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                        {openLeads.length}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        {myLeads.length} total leads assigned in CRM
                    </div>
                </div>

                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">PIPELINE VALUE</span>
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                        {formatCompactINR(totalPipelineValue)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        Expected deal volume across active stages
                    </div>
                </div>

                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">DEALS WON</span>
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                            <CheckCircle size={18} />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-purple-400 font-mono tracking-tight mb-2">
                        {wonLeads.length}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        Successfully closed &amp; converted contracts
                    </div>
                </div>

                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">WON REVENUE</span>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                            <Flame size={18} />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-emerald-400 font-mono tracking-tight mb-2">
                        {formatINR(wonRevenue)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        Realized sales cashflow generated
                    </div>
                </div>
            </div>

            {/* Pipeline Leads Table & Management */}
            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Target size={18} className="text-emerald-400" />
                            <span>My Assigned Leads &amp; Stage Updates</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Update deal progress directly. Every status change alerts and updates the Company Admin.
                        </p>
                    </div>

                    {/* Stage Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                        {['ALL', 'NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST'].map(stage => (
                            <button
                                key={stage}
                                onClick={() => setSelectedStage(stage)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedStage === stage
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                }`}
                            >
                                {stage}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredLeads.length === 0 ? (
                    <div className="p-12 rounded-xl bg-black/20 border border-dashed border-white/[0.08] text-center">
                        <Target size={36} className="text-gray-600 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-white mb-1">No leads in this category</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                            You have no leads under stage &quot;{selectedStage}&quot;. Add a prospective client or adjust your filter.
                        </p>
                        <button
                            onClick={onCreateLead}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                        >
                            <Plus size={14} /> Add Lead
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/[0.02] text-gray-400 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                                <tr>
                                    <th className="p-3 pl-4">Lead / Company</th>
                                    <th className="p-3">Deal Value</th>
                                    <th className="p-3">Current Stage</th>
                                    <th className="p-3">Quick Stage Transition</th>
                                    <th className="p-3">Priority</th>
                                    <th className="p-3 text-right pr-4">Admin Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {filteredLeads.map(lead => {
                                    const stageColors: Record<string, string> = {
                                        NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                                        DISCUSSION: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                        PROPOSAL: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                                        WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                        LOST: 'bg-red-500/10 text-red-400 border-red-500/20'
                                    };

                                    return (
                                        <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-3 pl-4">
                                                <div className="font-bold text-white text-sm">{lead.name}</div>
                                                <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                                    <span>{lead.company || 'Direct Client'}</span>
                                                    {lead.email && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-mono text-gray-500">{lead.email}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3 font-mono font-bold text-white text-sm">
                                                {formatINR(lead.value || 0)}
                                            </td>

                                            <td className="p-3">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${stageColors[lead.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                    {lead.status}
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                <div className="flex items-center gap-1.5">
                                                    {['DISCUSSION', 'PROPOSAL', 'WON'].map(targetStage => {
                                                        const isCurrent = lead.status === targetStage;
                                                        return (
                                                            <button
                                                                key={targetStage}
                                                                disabled={isCurrent || updatingLeadId === lead.id}
                                                                onClick={() => handleUpdateStage(lead.id, targetStage)}
                                                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                                                    isCurrent
                                                                        ? 'bg-white/10 text-white border-white/20 opacity-50 cursor-default'
                                                                        : 'bg-white/[0.03] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-gray-400 border-white/[0.08]'
                                                                }`}
                                                            >
                                                                {targetStage}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.04] text-gray-300 border border-white/[0.08]">
                                                    {lead.priority || 'MEDIUM'}
                                                </span>
                                            </td>

                                            <td className="p-3 text-right pr-4">
                                                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    Synced to Admin
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
