'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/src/api/client';
import {
    MessageSquare, Paperclip, AtSign, CheckCircle, AlertCircle,
    Maximize2, ChevronRight, Download, Clock, Send, FileText, DollarSign
} from 'lucide-react';

// Reusing interfaces
interface Project {
    id: string;
    name: string;
    clientEmail: string;
    scopes: any[];
    deliverables: any[];
    invoices: any[];
}

export default function ClientPortal() {
    const params = useParams();
    const token = params.token as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Approval Modal State (We'll integrate this into the new UI flow)
    const [selectedDeliv, setSelectedDeliv] = useState<string | null>(null);
    const [feedback, setFeedback] = useState(''); // Unified feedback state
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProjectData();

        // Auto-refresh every 10 seconds to check for updates (new deliverables, invoice status)
        const interval = setInterval(fetchProjectData, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const fetchProjectData = async () => {
        try {
            const { data } = await api.get(`/client/access/${token}`);
            setProject(data);
        } catch (err) {
            setError('Invalid or expired project link.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = async (deliverableId: string, action: 'APPROVE' | 'REQUEST_CHANGES', text: string = '') => {
        setSubmitting(true);
        try {
            await api.post(`/client/deliverables/${deliverableId}/approve`, {
                action,
                comments: text
            }, {
                headers: { 'x-client-token': token }
            });

            setFeedback('');
            fetchProjectData(); // Refresh UI
            alert(action === 'APPROVE' ? 'Deliverable approved!' : 'Changes requested.');
        } catch (err) {
            console.error(err);
            alert('Action failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePayment = async (invoiceId: string) => {
        if (!confirm("Proceed with payment?")) return;
        setSubmitting(true);
        try {
            await api.post(`/client/invoices/${invoiceId}/pay`, {}, {
                headers: { 'x-client-token': token }
            });
            alert('Payment Successful! Thank you.');
            fetchProjectData();
        } catch (err) {
            console.error(err);
            alert('Payment failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to get the latest deliverable or selected one
    const latestDeliverable = project?.deliverables && project.deliverables.length > 0
        ? project.deliverables[0]
        : null;

    if (loading) return <div className="min-h-screen bg-[#030712] text-white flex justify-center items-center">Loading Project...</div>;
    if (error) return <div className="min-h-screen bg-[#030712] text-red-500 flex justify-center items-center">{error}</div>;
    if (!project) return null;

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-indigo-500/30">
            {/* Top Navigation Bar */}
            <nav className="border-b border-white/5 bg-[#0f111a]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <div className="w-4 h-4 rounded-sm bg-white/20" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Agency OS</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Project</span>
                            <ChevronRight size={14} />
                            <span className="text-white font-medium">{project.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                            Client Portal
                        </span>
                        <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-[#1f2937] flex items-center justify-center overflow-hidden">
                            {/* Initials Avatar */}
                            <span className="text-amber-800 font-bold text-xs">{(project.clientEmail || 'C').charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        Active Projects <ChevronRight size={12} /> {project.name}
                    </div>
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome back.</h1>
                    <p className="text-gray-400 text-lg">Please review the latest assets below for approval.</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Asset Preview (Spans 2 columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Asset Container - Showing Top 2 Deliverables */}
                        {project.deliverables && project.deliverables.slice(0, 2).map((del: any, index: number) => (
                            <div key={del.id} className={`${index > 0 ? 'mt-8 pt-8 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity' : ''}`}>
                                {index > 0 && <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Previous Version</h3>}

                                <div className="group relative aspect-video bg-[#0f111a] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                                    <div className="w-3/4 h-3/4 bg-[#1e293b] shadow-2xl rounded-lg flex items-center justify-center relative transform group-hover:scale-[1.01] transition-transform duration-500">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-lg" />
                                        <div className="text-center p-4">
                                            <h3 className="text-2xl font-serif text-white/80 mb-2 truncate max-w-md">{del.notes || 'Deliverable Preview'}</h3>
                                            <p className="text-white/40 font-serif italic text-sm">Version {del.version}</p>
                                        </div>
                                    </div>

                                    {/* Overlay Controls */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a href={del.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white backdrop-blur-sm transition-colors block">
                                            <Download size={20} />
                                        </a>
                                    </div>
                                </div>

                                {/* Asset Meta Info */}
                                <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-xl border border-white/5 mt-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Version {del.version}</h3>
                                        <p className="text-gray-500 text-sm mt-1">Uploaded {new Date(del.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-gray-500 font-medium flex items-center gap-2">
                                            Status:
                                            {del.approvals?.some((a: any) => a.action === 'APPROVE') ? (
                                                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">APPROVED</span>
                                            ) : del.approvals?.some((a: any) => a.action === 'REQUEST_CHANGES') ? (
                                                <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-bold border border-red-400/20">CHANGES REQUESTED</span>
                                            ) : (
                                                <span className="text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs font-bold border border-orange-400/20">PENDING REVIEW</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(!project.deliverables || project.deliverables.length === 0) && (
                            <div className="aspect-video bg-[#0f111a] rounded-2xl border border-dashed border-gray-700 flex items-center justify-center text-gray-500">
                                No deliverables ready for review yet.
                            </div>
                        )}

                        {/* Scope / History Section */}
                        {project.scopes.length > 0 && (
                            <div>
                                <div className="flex justify-between items-end mb-4 mt-8">
                                    <h3 className="font-bold text-white text-lg">Project Scope</h3>
                                </div>
                                <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 space-y-4">
                                    {project.scopes.map((scope: any) => (
                                        <div key={scope.id} className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                                                    <FileText size={12} fill="currentColor" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium text-sm">Scope Version {scope.version} - ${scope.price}</h4>
                                                <p className="text-gray-500 text-xs mt-1">{scope.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Right Column: Actions & Feedback */}
                    <div className="space-y-6">

                        {/* Invoices Section (Sidebar) */}
                        <div className="bg-[#0f111a] rounded-2xl border border-white/5 overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-400" />
                                <h3 className="font-bold text-white text-sm">Invoices & Payments</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {project.invoices && project.invoices.length > 0 ? (
                                    project.invoices.map((inv: any) => (
                                        <div key={inv.id} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${inv.status === 'PAID' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                                <div>
                                                    <div className="text-white font-medium text-xs">#{inv.id.slice(0, 6)}</div>
                                                    <div className="text-gray-500 text-[10px]">{inv.status}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-white font-bold text-xs">${inv.amount}</div>
                                                {inv.status !== 'PAID' && (
                                                    <button
                                                        onClick={() => handlePayment(inv.id)}
                                                        disabled={submitting}
                                                        className="text-[10px] text-indigo-400 font-bold hover:underline disabled:opacity-50"
                                                    >
                                                        {submitting ? 'PAYING...' : 'PAY NOW'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-xs">
                                        No invoices generated yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {latestDeliverable && (
                            <div className="grid gap-4">
                                {/* Approve Card */}
                                <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Approve Version</h3>
                                            <p className="text-gray-400 text-sm">Everything looks perfect</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleQuickAction(latestDeliverable.id, 'APPROVE')}
                                        disabled={submitting}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Processing...' : 'Approve Now'}
                                    </button>
                                </div>

                                {/* Request Changes Card */}
                                <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Request Changes</h3>
                                            <p className="text-gray-400 text-sm">If tweaks are needed</p>
                                        </div>
                                    </div>
                                    {/* For quick styling we'll assume they type feedback below first, 
                                        or we could pop a modal. For now, let's just trigger it but 
                                        check if feedback is non-empty? */
                                    }
                                    <button
                                        onClick={() => {
                                            if (!feedback) {
                                                alert('Please add your change request details in the text box below first.');
                                                return;
                                            }
                                            handleQuickAction(latestDeliverable.id, 'REQUEST_CHANGES', feedback);
                                        }}
                                        disabled={submitting}
                                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Revision Request
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Feedback Widget */}
                        <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare size={18} className="text-indigo-400" />
                                <h3 className="font-bold text-white">Your Feedback</h3>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Add your thoughts or specific change requests here..."
                                    className="w-full h-32 bg-[#161b2e] border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                                />
                                <div className="absolute bottom-3 left-3 flex gap-2">
                                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Attach">
                                        <Paperclip size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
                                    Send Message <Send size={14} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600 text-xs">
                Powered by Agency OS
            </footer>
        </div>
    );
}
