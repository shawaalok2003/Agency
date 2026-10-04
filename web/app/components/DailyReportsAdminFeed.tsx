'use client';

import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Users, Phone, Calendar, Target, DollarSign,
    CheckCircle, MessageSquare, AlertCircle, ExternalLink,
    Filter, RefreshCw, Send, ShieldCheck
} from 'lucide-react';
import { api } from '@/src/api/client';
import { formatINR } from '@/app/page';

interface DailyReportsAdminFeedProps {
    user: any;
    onViewChange?: (view: string) => void;
}

export default function DailyReportsAdminFeed({ user, onViewChange }: DailyReportsAdminFeedProps) {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/daily-reports');
            setReports(data || []);
        } catch (err) {
            console.error('Failed to fetch daily reports for admin:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdminFeedback = async (reportId: string, status: string) => {
        setActionLoadingId(reportId);
        try {
            const feedback = feedbackInputs[reportId] || undefined;
            await api.patch(`/daily-reports/${reportId}`, {
                status,
                adminFeedback: feedback
            });
            await fetchReports();
            setFeedbackInputs(prev => ({ ...prev, [reportId]: '' }));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update report status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredReports = departmentFilter === 'ALL'
        ? reports
        : reports.filter(r => (r.department || 'SALES').toUpperCase() === departmentFilter);

    // Compute live company-wide totals
    const totalCalls = reports.reduce((acc, r) => acc + (r.callsMade || 0), 0);
    const totalMeetings = reports.reduce((acc, r) => acc + (r.meetingsBooked || 0), 0);
    const totalLeads = reports.reduce((acc, r) => acc + (r.leadsContacted || 0), 0);
    const totalRevenue = reports.reduce((acc, r) => acc + (parseFloat(r.dealsClosedValue) || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-bold border border-cyan-500/20 uppercase tracking-wide flex items-center gap-1">
                            <ShieldCheck size={13} /> COMPANY ADMIN OVERSIGHT • {user?.companyName || user?.email?.split('@')[0]?.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-xs text-gray-400 font-mono">{user?.email}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <ClipboardList className="text-indigo-400" /> Team Daily Task Trackers &amp; Work Updates
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                        Live stream of sales outreach, operations milestones, closed deals, and blockers across all departments.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReports}
                        className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white transition-colors"
                        title="Refresh Stream"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {onViewChange && (
                        <button
                            onClick={() => onViewChange('team')}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                        >
                            Manage Team Members
                        </button>
                    )}
                </div>
            </div>

            {/* Aggregated Company Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Total Submissions</div>
                    <div className="text-3xl font-extrabold text-white font-mono">{reports.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Daily tracker reports received</div>
                </div>

                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Outreach Calls Made</div>
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">{totalCalls}</div>
                    <div className="text-xs text-gray-500 mt-1">Logged by sales representatives</div>
                </div>

                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Meetings &amp; Demos</div>
                    <div className="text-3xl font-extrabold text-purple-400 font-mono">{totalMeetings}</div>
                    <div className="text-xs text-gray-500 mt-1">Client pitches conducted</div>
                </div>

                <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Closed Deals Value</div>
                    <div className="text-3xl font-extrabold text-amber-400 font-mono">{formatINR(totalRevenue)}</div>
                    <div className="text-xs text-gray-500 mt-1">Reported revenue contributions</div>
                </div>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
                    {['ALL', 'SALES', 'OPERATIONS', 'DEVELOPMENT', 'DESIGN', 'MANAGEMENT'].map(dept => (
                        <button
                            key={dept}
                            onClick={() => setDepartmentFilter(dept)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                departmentFilter === dept
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                <span className="text-xs text-gray-500">
                    Showing <strong>{filteredReports.length}</strong> updates
                </span>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
                <div className="p-16 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                    <ClipboardList size={40} className="text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">No Daily Reports Submitted Yet</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                        When your team members (e.g. Sales reps or Operations) submit their daily tasks and lead updates, they will appear here in real-time.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReports.map((report) => {
                        const dept = (report.department || 'SALES').toUpperCase();
                        const deptBadgeStyles: Record<string, string> = {
                            SALES: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                            OPERATIONS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                            DEVELOPMENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                            DESIGN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                            MANAGEMENT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        };

                        return (
                            <div
                                key={report.id}
                                className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-4"
                            >
                                {/* Top Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow">
                                            {(report.userName || report.userEmail || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-sm">{report.userName}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${deptBadgeStyles[dept] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                                    {dept}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase font-mono">
                                                    ({report.userRole})
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">
                                                {report.userEmail}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-400">
                                            {new Date(report.date || report.createdAt).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })} • {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                            report.status === 'REVIEWED'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                : report.status === 'ACKNOWLEDGED'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantitative Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Calls Made</div>
                                        <div className="text-base font-extrabold text-emerald-400 font-mono">{report.callsMade || 0}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Meetings Booked</div>
                                        <div className="text-base font-extrabold text-purple-400 font-mono">{report.meetingsBooked || 0}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Leads Contacted</div>
                                        <div className="text-base font-extrabold text-indigo-400 font-mono">{report.leadsContacted || 0}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Deals Closed</div>
                                        <div className="text-base font-extrabold text-amber-400 font-mono">{formatINR(report.dealsClosedValue || 0)}</div>
                                    </div>
                                </div>

                                {/* Tasks Text */}
                                <div>
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Tasks &amp; Milestones Logged:
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-gray-200 whitespace-pre-line leading-relaxed">
                                        {report.tasksCompleted}
                                    </div>
                                </div>

                                {/* Blockers Alert */}
                                {report.blockers && (
                                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-300">
                                        <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-amber-400">Blocker / Assistance Required:</strong> {report.blockers}
                                        </div>
                                    </div>
                                )}

                                {/* Proof URL */}
                                {report.proofUrl && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Work Evidence Proof:</span>
                                        <a
                                            href={report.proofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold text-xs border border-indigo-500/20 inline-flex items-center gap-1.5 transition-colors"
                                        >
                                            <ExternalLink size={12} /> View Submission Proof
                                        </a>
                                    </div>
                                )}

                                {/* Admin Feedback & Quick Action Box */}
                                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder={report.adminFeedback ? `Current Feedback: "${report.adminFeedback}"` : 'Write feedback or instructions for this member...'}
                                        value={feedbackInputs[report.id] || ''}
                                        onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [report.id]: e.target.value })}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                    />

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            disabled={actionLoadingId === report.id}
                                            onClick={() => handleAdminFeedback(report.id, 'ACKNOWLEDGED')}
                                            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                                        >
                                            Acknowledge
                                        </button>
                                        <button
                                            disabled={actionLoadingId === report.id}
                                            onClick={() => handleAdminFeedback(report.id, 'REVIEWED')}
                                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                                        >
                                            <CheckCircle size={13} />
                                            <span>Mark Reviewed &amp; Save Feedback</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
