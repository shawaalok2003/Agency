'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import { ArrowLeft, Plus, Lock, Upload, CheckCircle, Clock, Link as LinkIcon, FileText } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ApprovalAuditLog {
    action: string;
    comments?: string;
    performedBy: string;
    createdAt: string;
}

interface Scope {
    id: string;
    version: number;
    content: string;
    price: string; // Decimal comes as string from JSON often, or number
    isLocked: boolean;
    createdAt: string;
}

interface Deliverable {
    id: string;
    version: number;
    fileUrl: string;
    notes?: string;
    createdAt: string;
    approvals: ApprovalAuditLog[];
}

interface Invoice {
    id: string;
    amount: string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
    clientEmail: string;
    clientAccessParam: string;
    scopes: Scope[];
    deliverables: Deliverable[];
    invoices: Invoice[];
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    // New Fields
    tasks: Task[];
    github?: GitHubData;
}

interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    assignee?: { name: string; avatar: string };
    subtasks: { id: string; title: string; completed: boolean }[];
    dueDate?: string;
}

interface GitHubData {
    repo: string;
    connected: boolean;
    commits: { message: string; author: string; date: string; hash: string }[];
    prs: { title: string; status: 'OPEN' | 'MERGED'; author: string }[];
}

export default function ProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'deliverables' | 'invoices' | 'tasks' | 'code'>('scope');

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

            // Map backend task data to frontend interface
            const mappedTasks = data.tasks?.map((t: any) => ({
                ...t,
                assignee: t.assignee ? { name: t.assignee, avatar: t.assignee[0].toUpperCase() } : undefined,
                subtasks: t.subtasks || []
            })) || [];

            // Mock GitHub Data (Still mocked as backend integration for GitHub is separate)
            const mockGithub: GitHubData = {
                repo: 'agency-os/client-portal',
                connected: false,
                commits: [
                    { message: 'feat: add task management', author: 'Alice', date: '2h ago', hash: 'a1b2c3d' },
                    { message: 'fix: login button alignment', author: 'Bob', date: '5h ago', hash: 'e5f6g7h' },
                    { message: 'docs: update readme', author: 'Charlie', date: '1d ago', hash: 'i8j9k0l' }
                ],
                prs: [
                    { title: 'Feature/Tasks', status: 'OPEN', author: 'Alice' },
                    { title: 'Hotfix/Auth', status: 'MERGED', author: 'Bob' }
                ]
            };

            setProject({ ...data, tasks: mappedTasks, github: mockGithub });
            // Fetch User for Sidebar
            api.get('/auth/me').then(res => setUser(res.data)).catch(() => { });
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO') => {
        if (!project) return;
        const title = prompt('Task Title:');
        if (!title) return;
        const assignee = prompt('Assignee Name (optional):');

        try {
            await api.post('/tasks', {
                projectId: project.id,
                title,
                status,
                assignee
            });
            fetchProject();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to create task: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleAddSubtask = async (taskId: string) => {
        const title = prompt('Subtask Title:');
        if (!title) return;

        try {
            await api.post(`/tasks/${taskId}/subtasks`, { title });
            fetchProject();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to add subtask: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleToggleSubtask = async (subtask: { id: string; completed: boolean; title: string }) => {
        try {
            await api.patch(`/tasks/subtasks/${subtask.id}`, {
                completed: !subtask.completed,
                title: subtask.title
            });
            fetchProject();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to update subtask: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
        // In a real DnD impl, this would be updated. For now we can expose a way to move them if needed, 
        // or just assume the UI will eventually have DnD. 
        // Current UI doesn't have drag/drop yet, but we will add buttons or similar.
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

        if (!newDeliverableUrl.startsWith('http')) {
            alert('Please enter a valid URL (starting with http:// or https://)');
            return;
        }

        try {
            await api.post('/deliverables', {
                projectId: project.id,
                fileUrl: newDeliverableUrl,
                notes: newDeliverableNotes
            });
            setNewDeliverableUrl('');
            setNewDeliverableNotes('');
            fetchProject();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to upload deliverable: ${err.response?.data?.error || err.message}`);
        }
    };

    const copyClientLink = () => {
        if (!project) return;
        const link = `https://agency-3vru.vercel.app/client/access/${project.clientAccessParam}`;
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
        <div className="min-h-screen flex text-gray-100 font-sans">
            <Sidebar user={user} />
            <div className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="max-w-5xl mx-auto mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
                    </Link>

                    <div className="glass rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-white tracking-tight break-all">{project?.name}</h1>
                                {project?.status === 'COMPLETED' && (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold shrink-0">COMPLETED</span>
                                )}
                            </div>
                            <p className="text-gray-300 mt-1 break-all">Client: {project?.clientEmail || 'No client email'}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {project?.status !== 'COMPLETED' && (
                                <button
                                    onClick={handleCompleteProject}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
                                >
                                    <CheckCircle size={18} />
                                    Complete Project
                                </button>
                            )}
                            <button
                                onClick={copyClientLink}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 font-medium transition-all active:scale-95"
                            >
                                <LinkIcon size={18} />
                                Portal Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                {/* Tabs */}
                <div className="max-w-5xl mx-auto mb-6 border-b border-white/5 overflow-x-auto scrollbar-hide">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'scope', 'deliverables', 'tasks', 'invoices', 'code'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`
                                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize
                                    ${activeTab === tab
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-8">
                    {/* ... Existing Tabs ... */}
                    {activeTab === 'scope' && (
                        <div className="space-y-6">
                            {/* ... Scope Content (Existing) ... */}
                            {project.scopes?.length === 0 && (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <p className="text-gray-400">No scope defined yet.</p>
                                </div>
                            )}
                            {project.scopes?.map((scope) => (
                                <div key={scope.id} className="glass p-6 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Version {scope.version}</h3>
                                            <p className="text-xs text-gray-500">{new Date(scope.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {scope.isLocked ? (
                                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 flex items-center gap-1">
                                                    <Lock size={12} /> Approved
                                                </span>
                                            ) : (
                                                <button onClick={() => handleLockScope(scope.id)} className="text-xs text-indigo-400 hover:text-indigo-300">
                                                    Mark as Approved
                                                </button>
                                            )}
                                            <span className="text-xl font-bold text-white">${parseFloat(scope.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="prose prose-invert max-w-none text-gray-300">
                                        <p>{scope.content}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Add Scope Form */}
                            <form onSubmit={handleAddScope} className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Add Scope / Quote</h3>
                                <div className="space-y-4">
                                    <textarea
                                        placeholder="Scope details..."
                                        value={newScopeContent}
                                        onChange={(e) => setNewScopeContent(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 min-h-[100px]"
                                    />
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newScopePrice}
                                            onChange={(e) => setNewScopePrice(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                                        />
                                        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
                                            Add Scope
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'deliverables' && (
                        <div className="space-y-6">
                            {/* Upload Deliverable Form */}
                            <form onSubmit={handleUploadDeliverable} className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Upload New Deliverable</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="File URL (e.g., Google Drive link)"
                                        value={newDeliverableUrl}
                                        onChange={(e) => setNewDeliverableUrl(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                                    />
                                    <textarea
                                        placeholder="Notes (optional)"
                                        value={newDeliverableNotes}
                                        onChange={(e) => setNewDeliverableNotes(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 min-h-[80px]"
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/20 text-sm">
                                        Upload
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-4">
                                {project.deliverables?.map((del) => {
                                    const isApproved = del.approvals.some(a => a.action === 'APPROVE');
                                    const isRequested = del.approvals.some(a => a.action === 'REQUEST_CHANGES');
                                    return (
                                        <div key={del.id} className="glass p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center group hover:bg-white/5 transition-colors gap-3">
                                            <div className="w-full">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="font-semibold text-white shrink-0">Version {del.version}</span>
                                                    {isApproved ? (
                                                        <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs font-bold border border-emerald-400/20 shrink-0">APPROVED</span>
                                                    ) : isRequested ? (
                                                        <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs font-bold border border-red-400/20 shrink-0">CHANGES REQUESTED</span>
                                                    ) : (
                                                        <span className="text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs font-bold border border-orange-400/20 shrink-0">PENDING APPROVAL</span>
                                                    )}
                                                </div>
                                                <a href={del.fileUrl} target="_blank" className="text-indigo-400 hover:text-indigo-300 underline text-sm block mb-1 break-all">
                                                    {del.fileUrl}
                                                </a>
                                                {del.notes && <p className="text-gray-300 text-sm break-words">{del.notes}</p>}
                                                {isRequested && (
                                                    <div className="mt-3 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                                                        <p className="text-xs font-bold text-red-400 mb-1">CLIENT FEEDBACK:</p>
                                                        <p className="text-sm text-gray-200">"{del.approvals.find(a => a.action === 'REQUEST_CHANGES')?.comments}"</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-full md:w-auto text-left md:text-right text-sm text-gray-400 shrink-0">
                                                {new Date(del.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })}
                                {project.deliverables?.length === 0 && <p className="text-gray-400 text-center py-8">No deliverables yet.</p>}
                            </div>
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && project.tasks && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                            {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                                <div key={status} className="glass p-4 rounded-xl border border-white/5 h-fit min-h-[200px]">
                                    <h3 className="text-sm font-medium text-gray-400 mb-4 px-2 flex justify-between items-center">
                                        {status.replace('_', ' ')}
                                        <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-300">
                                            {project.tasks.filter(t => t.status === status).length}
                                        </span>
                                    </h3>
                                    <div className="space-y-3">
                                        {project.tasks.filter(t => t.status === status).map(task => (
                                            <div key={task.id} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-medium text-white">{task.title}</span>
                                                    {task.assignee && (
                                                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold" title={task.assignee.name}>
                                                            {task.assignee.avatar}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Subtasks */}
                                                {task.subtasks.length > 0 && (
                                                    <div className="space-y-1 mb-2">
                                                        {task.subtasks.map(sub => (
                                                            <div
                                                                key={sub.id}
                                                                className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white"
                                                                onClick={() => handleToggleSubtask(sub)}
                                                            >
                                                                <div className={`w-3 h-3 rounded-full border border-gray-600 flex items-center justify-center ${sub.completed ? 'bg-emerald-500/20 border-emerald-500/50' : ''}`}>
                                                                    {sub.completed && <CheckCircle size={8} className="text-emerald-400" />}
                                                                </div>
                                                                <span className={sub.completed ? 'line-through opacity-50' : ''}>{sub.title}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleAddSubtask(task.id)}
                                                        className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                                                    >
                                                        <Plus size={10} /> Subtask
                                                    </button>
                                                    <div className="text-[10px] text-gray-500">
                                                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleAddTask(status as any)}
                                            className="w-full py-2 text-xs text-gray-400 hover:text-white border border-dashed border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                        >
                                            + Add Task
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CODE TAB */}
                    {activeTab === 'code' && project.github && (
                        <div className="space-y-6">
                            <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{project.github.repo}</h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${project.github.connected ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                                            {project.github.connected ? 'Connected' : 'Not Connected'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (project.github) {
                                            setProject({ ...project, github: { ...project.github, connected: !project.github.connected } });
                                        }
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    {project.github.connected ? 'Disconnect' : 'Connect Repo'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Commits */}
                                <div className="glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Recent Commits</h3>
                                    <div className="space-y-4">
                                        {project.github.commits.map((commit, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="mt-1 flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                                    {i !== project.github!.commits.length - 1 && <div className="w-0.5 h-full bg-gray-800 my-1"></div>}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-200 font-mono">{commit.message}</p>
                                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                        <span>{commit.author}</span>
                                                        <span>•</span>
                                                        <span>{commit.date}</span>
                                                        <span>•</span>
                                                        <span className="font-mono text-indigo-400">{commit.hash}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* PRs */}
                                <div className="glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Pull Requests</h3>
                                    <div className="space-y-3">
                                        {project.github.prs.map((pr, i) => (
                                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                                <div>
                                                    <h4 className="text-sm font-medium text-white mb-1">{pr.title}</h4>
                                                    <p className="text-xs text-gray-500">Opened by {pr.author}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium border ${pr.status === 'MERGED'
                                                    ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                                                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                    }`}>
                                                    {pr.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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
                                    <div key={inv.id} className="glass p-6 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="font-bold text-white tracking-wide">Invoice #{inv.id.slice(0, 8)}</h3>
                                            <p className="text-gray-400 text-sm">Generated on {new Date(inv.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2">
                                            <span className="block text-2xl font-bold text-white mb-0 sm:mb-1">${inv.amount}</span>
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
        </div>
    );
}
