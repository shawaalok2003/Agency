'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import { ArrowLeft, Plus, Lock, Upload, CheckCircle, Clock, Link as LinkIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Project {
    id: string;
    name: string;
    clientEmail: string;
    clientAccessParam: string;
    scopes: Scope[];
    deliverables: Deliverable[];
    invoices: Invoice[];
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export default function ProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'deliverables' | 'invoices'>('scope');

    // Forms
    const [newScopeContent, setNewScopeContent] = useState('');
    const [newScopePrice, setNewScopePrice] = useState('');
    const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
    const [newDeliverableNotes, setNewDeliverableNotes] = useState('');

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/projects/${params.id}`);
            setProject(data);
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddScope = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        try {
            await api.post(`/projects/${project.id}/scopes`, {
                content: newScopeContent,
                price: parseFloat(newScopePrice) || 0
            });
            setNewScopeContent('');
            setNewScopePrice('');
            fetchProject();
        } catch (err) {
            alert('Failed to add scope');
        }
    };

    const handleLockScope = async (scopeId: string) => {
        if (!project) return;
        try {
            await api.patch(`/projects/${project.id}/scopes/${scopeId}/lock`);
            fetchProject();
        } catch (err) {
            alert('Failed to lock scope');
        }
    };

    const handleUploadDeliverable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        try {
            await api.post('/deliverables', {
                projectId: project.id,
                fileUrl: newDeliverableUrl,
                notes: newDeliverableNotes
            });
            setNewDeliverableUrl('');
            setNewDeliverableNotes('');
            fetchProject();
        } catch (err) {
            alert('Failed to upload deliverable');
        }
    };

    const copyClientLink = () => {
        if (!project) return;
        const link = `http://localhost:3001/client/access/${project.clientAccessParam}`;
        navigator.clipboard.writeText(link);
        alert(`Copied link: ${link}`);
    };

    const handleCompleteProject = async () => {
        if (!project) return;
        if (!confirm('Are you sure you want to complete this project? This will generate a closure report.')) return;

        try {
            // 1. Update Status
            await api.patch(`/projects/${project.id}`, { status: 'COMPLETED' });

            // 2. Generate PDF Report
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.text('Project Closure Report', 14, 20);

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Project: ${project.name}`, 14, 30);
            doc.text(`Client: ${project.clientEmail || 'N/A'}`, 14, 37);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);

            // Financial Summary
            const totalValue = project.invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
            const paidValue = project.invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

            doc.setDrawColor(200);
            doc.line(14, 50, 196, 50);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Financial Summary', 14, 60);

            doc.setFontSize(10);
            doc.text(`Total Invoiced: $${totalValue.toLocaleString()}`, 14, 68);
            doc.text(`Total Paid: $${paidValue.toLocaleString()}`, 14, 74);
            doc.text(`Balance Due: $${(totalValue - paidValue).toLocaleString()}`, 14, 80);

            // Invoices Table
            doc.setFontSize(14);
            doc.text('Invoices', 14, 95);

            const tableData = project.invoices.map(inv => [
                inv.id.slice(0, 8),
                new Date(inv.createdAt).toLocaleDateString(),
                inv.status,
                `$${inv.amount}`
            ]);

            autoTable(doc, {
                startY: 100,
                head: [['Invoice ID', 'Date', 'Status', 'Amount']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });

            // Save
            doc.save(`Closure_Report_${project.name.replace(/\s+/g, '_')}.pdf`);

            // Refresh
            fetchProject();
            alert('Project completed and report downloaded!');

        } catch (err) {
            console.error(err);
            alert('Failed to complete project');
        }
    };

    // ... (rest of code)

    // ... (rest of code)
    if (loading) return <div className="p-8 text-gray-300">Loading...</div>;
    if (!project) return <div className="p-8 text-gray-300">Project not found</div>;

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">
                <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
                </Link>

                <div className="glass rounded-xl p-6 shadow-xl flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{project?.name}</h1>
                            {project?.status === 'COMPLETED' && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">COMPLETED</span>
                            )}
                        </div>
                        <p className="text-gray-300 mt-1">Client: {project?.clientEmail || 'No client email'}</p>
                    </div>
                    <div className="flex gap-3">
                        {project?.status !== 'COMPLETED' && (
                            <button
                                onClick={handleCompleteProject}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle size={18} />
                                Complete Project
                            </button>
                        )}
                        <button
                            onClick={copyClientLink}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 font-medium transition-all active:scale-95"
                        >
                            <LinkIcon size={18} />
                            Portal Link
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-5xl mx-auto mb-6 flex gap-4 border-b border-white/5">
                {(['scope', 'deliverables', 'invoices'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab
                            ? 'border-indigo-500 text-indigo-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto">

                {/* SCOPE TAB */}
                {activeTab === 'scope' && (
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-xl">
                            <h2 className="text-lg font-semibold text-white mb-4">Add New Scope Version</h2>
                            <form onSubmit={handleAddScope} className="space-y-4">
                                <textarea
                                    value={newScopeContent}
                                    onChange={(e) => setNewScopeContent(e.target.value)}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] text-white placeholder-gray-400"
                                    placeholder="Define the work to be done..."
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Project Price ($)</label>
                                    <input
                                        type="number"
                                        value={newScopePrice}
                                        onChange={(e) => setNewScopePrice(e.target.value)}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg outline-none max-w-xs text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="5000.00"
                                    />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/20">
                                    Add Scope
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            {project.scopes?.map((scope: Scope) => (
                                <div key={scope.id} className="glass p-6 rounded-xl border border-white/5 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-white/10 text-white px-2 py-1 rounded text-xs font-bold uppercase border border-white/5">
                                            v{scope.version}
                                        </span>
                                        <div className="text-right">
                                            <span className="block font-bold text-indigo-300 text-lg">${scope.price}</span>
                                            <span className="text-sm text-gray-400">
                                                {new Date(scope.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 whitespace-pre-wrap mb-4">{scope.content}</p>

                                    {scope.isLocked ? (
                                        <div className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-medium border border-emerald-400/20">
                                            <Lock size={14} /> Scope Locked
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleLockScope(scope.id)}
                                            className="inline-flex items-center gap-1 text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                        >
                                            <Lock size={14} /> Lock Scope
                                        </button>
                                    )}
                                </div>
                            ))}
                            {project.scopes?.length === 0 && <p className="text-gray-400 text-center py-8">No scope defined yet.</p>}
                        </div>
                    </div>
                )}

                {/* DELIVERABLES TAB */}
                {activeTab === 'deliverables' && (
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-xl">
                            <h2 className="text-lg font-semibold text-white mb-4">Upload Deliverable</h2>
                            <form onSubmit={handleUploadDeliverable} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">File URL (Mock)</label>
                                    <input
                                        type="url"
                                        value={newDeliverableUrl}
                                        onChange={(e) => setNewDeliverableUrl(e.target.value)}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://dropbox.com/file..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                                    <input
                                        type="text"
                                        value={newDeliverableNotes}
                                        onChange={(e) => setNewDeliverableNotes(e.target.value)}
                                        className="w-full p-2 bg-white/5 border border-white/10 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Brief description..."
                                    />
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/20">
                                    Upload & Notify Client
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4">
                            {project.deliverables?.map((del) => {
                                const isApproved = del.approvals.some(a => a.action === 'APPROVE');
                                return (
                                    <div key={del.id} className="glass p-4 rounded-xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">Version {del.version}</span>
                                                {isApproved ? (
                                                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20">APPROVED</span>
                                                ) : (
                                                    <span className="text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs font-bold border border-orange-400/20">PENDING APPROVAL</span>
                                                )}
                                            </div>
                                            <a href={del.fileUrl} target="_blank" className="text-indigo-400 hover:text-indigo-300 underline text-sm block mb-1">
                                                {del.fileUrl}
                                            </a>
                                            {del.notes && <p className="text-gray-300 text-sm">{del.notes}</p>}
                                        </div>
                                        <div className="text-right text-sm text-gray-400">
                                            {new Date(del.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })}
                            {project.deliverables?.length === 0 && <p className="text-gray-400 text-center py-8">No deliverables yet.</p>}
                        </div>
                    </div>
                )}

                {/* INVOICES TAB */}
                {activeTab === 'invoices' && (
                    <div className="space-y-4">
                        {project.invoices?.length === 0 ? (
                            <div className="text-center py-12 glass rounded-xl border border-dashed border-white/10">
                                <FileText size={48} className="mx-auto text-gray-500 mb-4" />
                                <p className="text-gray-300">No invoices yet.</p>
                                <p className="text-sm text-gray-400 mt-2">Invoices are generated automatically when a client approves a deliverable.</p>
                            </div>
                        ) : (
                            project.invoices?.map((inv) => (
                                <div key={inv.id} className="glass p-6 rounded-xl border border-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-white tracking-wide">Invoice #{inv.id.slice(0, 8)}</h3>
                                        <p className="text-gray-400 text-sm">Generated on {new Date(inv.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-white mb-1">${inv.amount}</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${inv.status === 'PAID'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
