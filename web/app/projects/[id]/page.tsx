'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import {
    ArrowLeft, Plus, Lock, Upload, CheckCircle, Clock, Link as LinkIcon,
    FileText, LayoutGrid, Code, ListTodo, Layers, DollarSign, Activity,
    AlertCircle, Calendar, Trash2, X, ExternalLink, ShieldCheck, CheckSquare
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';

// --- Interfaces ---
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
    price: string | number;
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
    amount: string | number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
    createdAt: string;
    dueDate?: string;
    payments?: any[];
}

interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    assignee?: string;
    dueDate?: string;
    subtasks?: { id: string; title: string; completed: boolean }[];
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
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
    tasks: Task[];
    createdAt?: string;
    updatedAt?: string;
}

export default function ProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'deliverables' | 'scope' | 'invoices' | 'code'>('overview');

    // Forms & Modals
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        assignee: '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: ''
    });

    const [newScopeContent, setNewScopeContent] = useState('');
    const [newScopePrice, setNewScopePrice] = useState('');
    const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
    const [newDeliverableNotes, setNewDeliverableNotes] = useState('');
    const [newInvoiceAmount, setNewInvoiceAmount] = useState('');

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/projects/${params.id}`);

            // Clean real tasks mapping
            const mappedTasks = (data.tasks || []).map((t: any) => ({
                ...t,
                assignee: typeof t.assignee === 'string' ? t.assignee : t.assignee?.name || '',
                subtasks: t.subtasks || [],
                priority: t.priority || 'MEDIUM'
            }));

            setProject({
                ...data,
                scopes: data.scopes || [],
                deliverables: data.deliverables || [],
                invoices: data.invoices || [],
                tasks: mappedTasks
            });

            api.get('/auth/me').then(res => setUser(res.data)).catch(() => {});
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    // Task Creation
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !taskFormData.title.trim()) return;

        try {
            await api.post('/tasks', {
                projectId: project.id,
                title: taskFormData.title.trim(),
                status: taskFormData.status || 'TODO',
                assignee: taskFormData.assignee.trim() || undefined,
                dueDate: taskFormData.dueDate || undefined
            });

            setIsTaskModalOpen(false);
            setTaskFormData({
                title: '',
                assignee: '',
                priority: 'MEDIUM',
                status: 'TODO',
                dueDate: ''
            });

            await fetchProject();
        } catch (err: any) {
            alert(err.response?.data?.error || err.message || 'Failed to add task');
        }
    };

    // Toggle Task Status
    const handleToggleTaskStatus = async (task: Task) => {
        const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        try {
            await api.patch(`/tasks/${task.id}`, { status: nextStatus });
            await fetchProject();
        } catch (err: any) {
            alert('Failed to update task status');
        }
    };

    // Delete Task
    const handleDeleteTask = async (taskId: string) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            await fetchProject();
        } catch (err: any) {
            alert('Failed to delete task');
        }
    };

    // Add Scope
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
            await fetchProject();
        } catch (err) {
            alert('Failed to add scope');
        }
    };

    // Add Deliverable
    const handleUploadDeliverable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !newDeliverableUrl) return;
        try {
            await api.post(`/projects/${project.id}/deliverables`, {
                fileUrl: newDeliverableUrl,
                notes: newDeliverableNotes
            });
            setNewDeliverableUrl('');
            setNewDeliverableNotes('');
            await fetchProject();
        } catch (err) {
            alert('Failed to upload deliverable');
        }
    };

    // Add Invoice
    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !newInvoiceAmount) return;
        try {
            await api.post('/invoices', {
                projectId: project.id,
                amount: parseFloat(newInvoiceAmount),
                status: 'SENT'
            });
            setNewInvoiceAmount('');
            await fetchProject();
        } catch (err) {
            alert('Failed to generate invoice');
        }
    };

    const copyClientLink = () => {
        if (!project) return;
        const url = `${window.location.origin}/client/access/${project.clientAccessParam}`;
        navigator.clipboard.writeText(url);
        alert('Client Access Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-3 text-indigo-400">
                    <Activity className="animate-spin" size={20} />
                    <span>Loading project workspace...</span>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6">
                <h2 className="text-xl font-bold mb-2">Project not found</h2>
                <p className="text-gray-400 text-sm mb-6">The requested project could not be found or you do not have permission to view it.</p>
                <Link href="/?view=projects" className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-bold text-white">
                    Return to Projects
                </Link>
            </div>
        );
    }

    // Calculations based strictly on real project data
    const totalScopeValue = project.scopes?.reduce((sum, s) => sum + (parseFloat(s.price.toString()) || 0), 0) || 0;
    const invoicedAmount = project.invoices?.reduce((sum, i) => sum + (parseFloat(i.amount.toString()) || 0), 0) || 0;
    const paidAmount = project.invoices?.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (parseFloat(i.amount.toString()) || 0), 0) || 0;
    const completedTasksCount = project.tasks?.filter(t => t.status === 'DONE').length || 0;
    const totalTasksCount = project.tasks?.length || 0;
    const taskProgressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    return (
        <div className="min-h-screen flex text-gray-100 font-sans bg-[#030712]">
            {/* Consistent Global agnecyos Sidebar */}
            <Sidebar
                user={user}
                onSignOut={() => {
                    localStorage.removeItem('token');
                    router.push('/login');
                }}
                currentView="projects"
                currentProjectName={project.name}
                counts={{
                    projects: 1,
                    tasks: project.tasks?.filter(t => t.status !== 'DONE').length || 0,
                    invoices: project.invoices?.length || 0,
                    approvals: project.deliverables?.length || 0
                }}
            />

            {/* Main Project Work Area */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Project Header Bar */}
                    <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <Link
                                    href="/?view=projects"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                                >
                                    <ArrowLeft size={13} /> Projects
                                </Link>
                                <span className="text-gray-600">/</span>
                                <span className="text-xs text-gray-400 font-medium">Workspace</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{project.name}</h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Client: <span className="text-gray-200 font-medium">{project.clientEmail || 'No client email assigned'}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={copyClientLink}
                                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/20 text-xs font-bold transition-all shadow-sm"
                            >
                                <LinkIcon size={14} /> Copy Client Portal Link
                            </button>
                            <Link
                                href="/portal/preview"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 border border-white/10 rounded-xl text-xs font-bold transition-all"
                            >
                                <ExternalLink size={14} /> Preview Portal
                            </Link>
                        </div>
                    </div>

                    {/* Top Tab Bar Navigation (Consistent SaaS Standard) */}
                    <div className="flex items-center gap-1 border-b border-white/[0.08] pb-1 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: LayoutGrid },
                            { id: 'tasks', label: 'Tasks', icon: ListTodo, badge: totalTasksCount },
                            { id: 'deliverables', label: 'Deliverables', icon: Layers, badge: project.deliverables?.length || 0 },
                            { id: 'scope', label: 'Scope of Work', icon: FileText, badge: project.scopes?.length || 0 },
                            { id: 'invoices', label: 'Invoices', icon: DollarSign, badge: project.invoices?.length || 0 },
                            { id: 'code', label: 'Code & Specs', icon: Code },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                                            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <TabIcon size={15} />
                                    <span>{tab.label}</span>
                                    {tab.badge !== undefined && tab.badge > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-gray-300'}`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* --- TAB 1: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Key Operational Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-[#0a0f1d] border border-white/[0.08] p-5 rounded-2xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Task Completion</span>
                                    <div className="text-2xl font-bold text-white mt-1 mb-2 font-mono">
                                        {taskProgressPct}%
                                    </div>
                                    <div className="text-xs text-gray-400 mb-3">
                                        {completedTasksCount} / {totalTasksCount} tasks completed
                                    </div>
                                    <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${taskProgressPct}%` }}></div>
                                    </div>
                                </div>

                                <div className="bg-[#0a0f1d] border border-white/[0.08] p-5 rounded-2xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Contract Scope</span>
                                    <div className="text-2xl font-bold text-white mt-1 mb-2 font-mono">
                                        ₹{totalScopeValue.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {project.scopes?.length || 0} locked milestones
                                    </div>
                                </div>

                                <div className="bg-[#0a0f1d] border border-white/[0.08] p-5 rounded-2xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Collected (Paid)</span>
                                    <div className="text-2xl font-bold text-emerald-400 mt-1 mb-2 font-mono">
                                        ₹{paidAmount.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {project.invoices?.filter(i => i.status === 'PAID').length || 0} paid invoices
                                    </div>
                                </div>

                                <div className="bg-[#0a0f1d] border border-white/[0.08] p-5 rounded-2xl">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Pending Billing</span>
                                    <div className="text-2xl font-bold text-amber-400 mt-1 mb-2 font-mono">
                                        ₹{(invoicedAmount - paidAmount).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Unpaid client balances
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions & Recent Tasks summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-white text-sm">Project Tasks Summary</h3>
                                        <button
                                            onClick={() => setIsTaskModalOpen(true)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                                        >
                                            + Add Task
                                        </button>
                                    </div>
                                    {totalTasksCount === 0 ? (
                                        <div className="text-center py-6 text-gray-500 text-xs">
                                            No tasks added yet for this project.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {project.tasks.slice(0, 4).map(task => (
                                                <div key={task.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                                                    <span className={`font-medium ${task.status === 'DONE' ? 'line-through text-gray-500' : 'text-white'}`}>
                                                        {task.title}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                                    <h3 className="font-bold text-white text-sm mb-4">Deliverables & Approvals</h3>
                                    {project.deliverables?.length === 0 ? (
                                        <div className="text-center py-6 text-gray-500 text-xs">
                                            No deliverables uploaded yet. Upload files in the Deliverables tab.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {project.deliverables.map(d => (
                                                <div key={d.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                                                    <div>
                                                        <span className="font-medium text-white">v{d.version} Deliverable Package</span>
                                                        <div className="text-[10px] text-gray-400">{d.notes || 'Files uploaded for review'}</div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                                        Uploaded
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: TASKS --- */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-[#0a0f1d] p-4 rounded-2xl border border-white/[0.08]">
                                <div className="text-xs text-gray-400">
                                    Total: <strong className="text-white">{totalTasksCount}</strong> • Completed: <strong className="text-emerald-400">{completedTasksCount}</strong>
                                </div>
                                <button
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                                >
                                    <Plus size={14} /> Add Task
                                </button>
                            </div>

                            {totalTasksCount === 0 ? (
                                <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                                    <CheckSquare size={36} className="text-indigo-400 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-white mb-1">No tasks yet</h3>
                                    <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                                        Add tasks to organize deliverables and calculate project health automatically.
                                    </p>
                                    <button
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                                    >
                                        <Plus size={16} /> Create Task
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {project.tasks.map((task) => {
                                        const isDone = task.status === 'DONE';
                                        return (
                                            <div
                                                key={task.id}
                                                className="p-4 rounded-xl bg-[#0a0f1d] border border-white/[0.08] flex items-center justify-between gap-4 hover:border-white/[0.15] transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleToggleTaskStatus(task)}
                                                        className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                                                            isDone
                                                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                                                : 'border-gray-600 hover:border-indigo-400'
                                                        }`}
                                                    >
                                                        {isDone && <CheckCircle size={14} />}
                                                    </button>
                                                    <div>
                                                        <div className={`text-sm font-semibold ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                                                            {task.title}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Assigned: {task.assignee || 'Unassigned'}
                                                            {task.dueDate && ` • Due ${new Date(task.dueDate).toLocaleDateString()}`}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                                        isDone
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-gray-600 hover:text-red-400 p-1"
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB 3: DELIVERABLES --- */}
                    {activeTab === 'deliverables' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-white mb-2">Upload Deliverable for Client Approval</h3>
                                <p className="text-xs text-gray-400 mb-4">Upload finished assets to the client portal for sign-off.</p>
                                <form onSubmit={handleUploadDeliverable} className="space-y-3">
                                    <input
                                        required
                                        type="url"
                                        placeholder="Deliverable File URL (Figma, Google Drive, ZIP link)..."
                                        value={newDeliverableUrl}
                                        onChange={(e) => setNewDeliverableUrl(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Notes for client review..."
                                        value={newDeliverableNotes}
                                        onChange={(e) => setNewDeliverableNotes(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
                                    >
                                        Upload Deliverable
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-3">
                                {project.deliverables?.map(d => (
                                    <div key={d.id} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/[0.08] flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-white text-sm">v{d.version} Deliverable</div>
                                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">
                                                {d.fileUrl}
                                            </a>
                                            {d.notes && <div className="text-xs text-gray-400 mt-1">{d.notes}</div>}
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            Ready for Review
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 4: SCOPE OF WORK --- */}
                    {activeTab === 'scope' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-white mb-2">Add Scope Milestone</h3>
                                <form onSubmit={handleAddScope} className="space-y-3">
                                    <textarea
                                        required
                                        placeholder="Describe scope deliverables, terms, and technical boundaries..."
                                        value={newScopeContent}
                                        onChange={(e) => setNewScopeContent(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl p-3 text-xs text-white h-24 focus:outline-none"
                                    />
                                    <input
                                        required
                                        type="number"
                                        placeholder="Price in INR (₹)..."
                                        value={newScopePrice}
                                        onChange={(e) => setNewScopePrice(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                                    >
                                        Save Scope
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-3">
                                {project.scopes?.map(s => (
                                    <div key={s.id} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/[0.08] flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-gray-400 uppercase font-bold">Scope v{s.version}</div>
                                            <div className="text-sm text-white mt-1">{s.content}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-emerald-400 text-base">₹{Number(s.price).toLocaleString('en-IN')}</div>
                                            <span className="text-[10px] text-gray-500">{s.isLocked ? 'Locked' : 'Draft'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 5: INVOICES --- */}
                    {activeTab === 'invoices' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                                <h3 className="text-sm font-bold text-white mb-2">Create Project Invoice</h3>
                                <form onSubmit={handleCreateInvoice} className="flex gap-3">
                                    <input
                                        required
                                        type="number"
                                        placeholder="Amount in INR (₹)..."
                                        value={newInvoiceAmount}
                                        onChange={(e) => setNewInvoiceAmount(e.target.value)}
                                        className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                                    >
                                        Generate Invoice
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-3">
                                {project.invoices?.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-xs bg-[#0a0f1d] rounded-2xl border border-dashed border-white/[0.08]">
                                        No invoices generated for this project yet.
                                    </div>
                                ) : (
                                    project.invoices.map(inv => (
                                        <div key={inv.id} className="p-4 rounded-xl bg-[#0a0f1d] border border-white/[0.08] flex items-center justify-between">
                                            <div>
                                                <div className="font-mono font-bold text-white text-sm">{inv.id.substring(0, 12)}</div>
                                                <div className="text-xs text-gray-400">Created: {new Date(inv.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono font-bold text-white text-sm">₹{Number(inv.amount).toLocaleString('en-IN')}</div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                                    inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 6: CODE & GITHUB --- */}
                    {activeTab === 'code' && (
                        <div className="p-8 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] text-center space-y-3">
                            <Code size={32} className="text-indigo-400 mx-auto" />
                            <h3 className="font-bold text-white text-base">GitHub &amp; Code Repositories</h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                Connect your agency GitHub organization to automatically sync commit logs, pull requests, and deployment branches.
                            </p>
                            <button
                                onClick={() => alert('GitHub Integration: Enter repo credentials in Settings > Integrations.')}
                                className="bg-white/[0.05] hover:bg-white/[0.1] text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10"
                            >
                                Connect Repository
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Task Creation Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.08]">
                            <h3 className="text-base font-bold text-white">Add Project Task</h3>
                            <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Task Title *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Implement Navigation & Auth"
                                    value={taskFormData.title}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Assignee</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={taskFormData.assignee}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, assignee: e.target.value })}
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Status</label>
                                    <select
                                        value={taskFormData.status}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                                        className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Priority</label>
                                    <select
                                        value={taskFormData.priority}
                                        onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as any })}
                                        className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={taskFormData.dueDate}
                                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                                    className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsTaskModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
