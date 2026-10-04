'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckSquare, Phone, Calendar, Send, Clock, AlertCircle,
    CheckCircle, MessageSquare, ExternalLink, Flame, TrendingUp,
    FileText, User, RefreshCw, Paperclip
} from 'lucide-react';
import { api } from '@/src/api/client';
import { formatINR } from '@/app/page';

interface DailyTrackerProps {
    user: any;
    onViewChange?: (view: string) => void;
}

export default function DailyTrackerView({ user, onViewChange }: DailyTrackerProps) {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [tasksCompleted, setTasksCompleted] = useState('');
    const [callsMade, setCallsMade] = useState(0);
    const [meetingsBooked, setMeetingsBooked] = useState(0);
    const [leadsContacted, setLeadsContacted] = useState(0);
    const [dealsClosedValue, setDealsClosedValue] = useState(0);
    const [blockers, setBlockers] = useState('');
    const [proofUrl, setProofUrl] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/daily-reports');
            setReports(data || []);
        } catch (err) {
            console.error('Failed to fetch daily reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tasksCompleted.trim()) {
            alert('Please specify the tasks completed today.');
            return;
        }

        setSubmitting(true);
        setSuccessMessage('');
        try {
            await api.post('/daily-reports', {
                tasksCompleted,
                callsMade: Number(callsMade) || 0,
                meetingsBooked: Number(meetingsBooked) || 0,
                leadsContacted: Number(leadsContacted) || 0,
                dealsClosedValue: Number(dealsClosedValue) || 0,
                blockers: blockers.trim() || undefined,
                proofUrl: proofUrl.trim() || undefined,
            });

            setSuccessMessage('🎉 Work Tracker Submitted! Details have been synced to the Company Admin.');
            setTasksCompleted('');
            setCallsMade(0);
            setMeetingsBooked(0);
            setLeadsContacted(0);
            setDealsClosedValue(0);
            setBlockers('');
            setProofUrl('');

            await fetchReports();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to submit daily report');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate user's aggregate stats
    const totalCalls = reports.reduce((acc, r) => acc + (r.callsMade || 0), 0);
    const totalMeetings = reports.reduce((acc, r) => acc + (r.meetingsBooked || 0), 0);
    const totalClosed = reports.reduce((acc, r) => acc + (parseFloat(r.dealsClosedValue) || 0), 0);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20 uppercase tracking-wide">
                            {user?.department || 'SALES'} • {user?.companyName || user?.email?.split('@')[0]?.toUpperCase()}
                        </span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-xs text-gray-400">Employee Activity Portal</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <CheckSquare className="text-emerald-400" /> Daily Task Tracker &amp; Work Updates
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                        Log your daily achievements, lead calls, client meetings, proofs of work, and sync to Admin.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReports}
                        className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white transition-colors"
                        title="Refresh Submissions"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {onViewChange && (
                        <button
                            onClick={() => onViewChange('sales_dashboard')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                        >
                            Open Sales Hub
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reports Logged</div>
                    <div className="text-2xl font-bold font-mono text-white">{reports.length}</div>
                    <div className="text-[11px] text-gray-500 mt-1">Daily records on file</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Calls Logged</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">{totalCalls}</div>
                    <div className="text-[11px] text-gray-500 mt-1">Prospect outreach touches</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Meetings Booked</div>
                    <div className="text-2xl font-bold font-mono text-purple-400">{totalMeetings}</div>
                    <div className="text-[11px] text-gray-500 mt-1">Demos &amp; client discussions</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Deals Revenue Logged</div>
                    <div className="text-2xl font-bold font-mono text-amber-400">{formatINR(totalClosed)}</div>
                    <div className="text-[11px] text-gray-500 mt-1">Direct sales contributions</div>
                </div>
            </div>

            {/* Submission Form */}
            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Send size={18} className="text-emerald-400" />
                            <span>Log Today&apos;s Work Tracker</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Submitting this form updates the company admin in real-time.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Date: {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                {successMessage && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold mb-6 flex items-center gap-2">
                        <CheckCircle size={16} className="shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quantitative Counters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                        <div>
                            <label className="text-[11px] text-gray-300 font-semibold block mb-1">
                                Calls Made
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={callsMade}
                                onChange={(e) => setCallsMade(parseInt(e.target.value) || 0)}
                                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-300 font-semibold block mb-1">
                                Meetings Booked
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={meetingsBooked}
                                onChange={(e) => setMeetingsBooked(parseInt(e.target.value) || 0)}
                                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-300 font-semibold block mb-1">
                                Leads Contacted
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={leadsContacted}
                                onChange={(e) => setLeadsContacted(parseInt(e.target.value) || 0)}
                                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] text-gray-300 font-semibold block mb-1">
                                Deals Closed (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={dealsClosedValue}
                                onChange={(e) => setDealsClosedValue(parseFloat(e.target.value) || 0)}
                                className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Tasks Completed Textarea */}
                    <div>
                        <label className="text-xs font-bold text-gray-200 block mb-1.5 flex items-center justify-between">
                            <span>Key Tasks Completed Today *</span>
                            <span className="text-[10px] text-gray-500">Provide bullet points or summary</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            placeholder="e.g.&#10;• Contacted 15 new enterprise leads from Bengaluru&#10;• Demo completed with ABC Corp - sending proposal for ₹2,50,000&#10;• Updated lead stages in CRM&#10;• Coordinated with Ops team for contract delivery"
                            value={tasksCompleted}
                            onChange={(e) => setTasksCompleted(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                    </div>

                    {/* Proof of Work and Blockers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-200 block mb-1.5 flex items-center gap-1.5">
                                <Paperclip size={13} className="text-indigo-400" />
                                <span>Proof / Evidence Link (Optional)</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://drive.google.com/... or screenshot URL"
                                value={proofUrl}
                                onChange={(e) => setProofUrl(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                Optional Google Drive, Loom video, or screenshot proof link for Admin review.
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-200 block mb-1.5 flex items-center gap-1.5">
                                <AlertCircle size={13} className="text-amber-400" />
                                <span>Blockers or Help Needed from Admin</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Need approval on discount for XYZ Corp proposal"
                                value={blockers}
                                onChange={(e) => setBlockers(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                Flags any bottlenecks directly on Admin&apos;s daily review queue.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-gray-500">
                            Logged as: <strong className="text-gray-300">{user?.name || user?.email}</strong> ({user?.role || 'SALES'})
                        </span>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Send size={14} />
                            <span>{submitting ? 'Syncing to Admin...' : 'Submit Daily Work Tracker'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Past Work Log History */}
            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-indigo-400" />
                            <span>My Submissions History &amp; Admin Feedback</span>
                        </h2>
                        <p className="text-xs text-gray-400">Previous reports and notes acknowledged by Admin.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 bg-white/[0.05] px-2.5 py-1 rounded-lg">
                        {reports.length} Records
                    </span>
                </div>

                {reports.length === 0 ? (
                    <div className="p-10 rounded-xl bg-black/20 border border-dashed border-white/[0.08] text-center text-xs text-gray-500">
                        No previous daily reports logged. Fill out the form above to log your first work report.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-xs font-mono">
                                            {new Date(report.date || report.createdAt).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                            report.status === 'REVIEWED'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : report.status === 'ACKNOWLEDGED'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {report.status}
                                        </span>
                                        {report.proofUrl && (
                                            <a
                                                href={report.proofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"
                                            >
                                                <ExternalLink size={10} /> Proof Link
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Metrics Summary Chips */}
                                <div className="flex flex-wrap gap-2 text-[11px]">
                                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-gray-300">
                                        📞 <strong>{report.callsMade || 0}</strong> Calls
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-gray-300">
                                        📅 <strong>{report.meetingsBooked || 0}</strong> Meetings
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-gray-300">
                                        🎯 <strong>{report.leadsContacted || 0}</strong> Leads
                                    </span>
                                    {Number(report.dealsClosedValue) > 0 && (
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
                                            🎉 {formatINR(report.dealsClosedValue)} Closed
                                        </span>
                                    )}
                                </div>

                                {/* Tasks Text */}
                                <div className="text-xs text-gray-300 whitespace-pre-line bg-black/20 p-3 rounded-lg border border-white/5">
                                    {report.tasksCompleted}
                                </div>

                                {report.blockers && (
                                    <div className="text-xs text-amber-300 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-lg flex items-start gap-2">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                                        <span><strong>Blocker:</strong> {report.blockers}</span>
                                    </div>
                                )}

                                {/* Admin Feedback Callout */}
                                {report.adminFeedback && (
                                    <div className="text-xs text-indigo-200 bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-lg flex items-start gap-2">
                                        <MessageSquare size={14} className="shrink-0 mt-0.5 text-indigo-400" />
                                        <div>
                                            <div className="font-bold text-indigo-300 text-[11px]">Admin Feedback:</div>
                                            <div className="mt-0.5">{report.adminFeedback}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
