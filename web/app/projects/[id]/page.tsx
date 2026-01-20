'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import { ArrowLeft, Plus, Lock, Upload, CheckCircle, Clock, Link as LinkIcon, FileText, LayoutGrid, Code, ListTodo, Layers, DollarSign, Activity, AlertCircle, Calendar } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    price: string;
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
    dueDate?: string; // New
    items?: { description: string; amount: number }[]; // New
}

interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    assignee?: { name: string; avatar: string };
    subtasks: { id: string; title: string; completed: boolean }[];
    dueDate?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'; // New field for ClickUp style
}

interface GitHubData {
    repo: string;
    connected: boolean;
    commits: { message: string; author: string; date: string; hash: string }[];
    prs: { title: string; status: 'OPEN' | 'MERGED'; author: string }[];
}

interface ActivityLog {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
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
    github?: GitHubData;
    activity: ActivityLog[];
    dueDate?: string;
}

export default function ProjectDetails() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'deliverables' | 'invoices' | 'tasks' | 'code'>('overview');

    // Onboarding State
    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    // Tour Steps Configuration
    const tourSteps = [
        {
            target: 'overview',
            title: 'Project Command Center',
            content: 'This is your dashboard. Check project health, budget status, and recent activity at a glance.'
        },
        {
            target: 'scope',
            title: 'The Statement of Work',
            content: 'Define exactly what is being built here. Approved items become your "Promise" to the client.'
        },
        {
            target: 'tasks',
            title: 'Task Management',
            content: 'Track progress with our new Board view. Assign tasks, set priorities, and upload proofs when done.'
        }
    ];

    // UI State for Detailed Views
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

    // Forms State
    const [newScopeContent, setNewScopeContent] = useState('');
    const [newScopePrice, setNewScopePrice] = useState('');
    const [newDeliverableUrl, setNewDeliverableUrl] = useState('');
    const [newDeliverableNotes, setNewDeliverableNotes] = useState('');

    // Sidebar Items Configuration
    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'scope', label: 'Scope', icon: FileText },
        { id: 'deliverables', label: 'Deliverables', icon: Layers },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'invoices', label: 'Invoices', icon: DollarSign },
        { id: 'code', label: 'Code', icon: Code },
    ];

    useEffect(() => {
        fetchProject();
        // Check for first-time visitor (mock)
        const hasSeenTour = localStorage.getItem('agency_tour_completed');
        if (!hasSeenTour) {
            setTimeout(() => setShowTour(true), 1000); // Small delay for dramatic effect
        }
    }, [params.id]);

    const handleTourNext = () => {
        if (tourStep < tourSteps.length - 1) {
            const nextStep = tourStep + 1;
            setTourStep(nextStep);
            setActiveTab(tourSteps[nextStep].target as any); // Auto-navigate tabs
        } else {
            setShowTour(false);
            localStorage.setItem('agency_tour_completed', 'true');
        }
    };

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/projects/${params.id}`);

            // Map backend task data
            const mappedTasks = data.tasks?.map((t: any) => ({
                ...t,
                assignee: t.assignee ? { name: t.assignee, avatar: t.assignee[0].toUpperCase() } : undefined,
                subtasks: t.subtasks || [],
                priority: t.priority || ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)] // Mock priority if missing
            })) || [];

            // Mock GitHub Data
            const mockGithub: GitHubData = {
                repo: 'agency-os/client-portal',
                connected: false,
                commits: [
                    { message: 'feat: add task management', author: 'Alice', date: '2h ago', hash: 'a1b2c3d' },
                    { message: 'fix: login button alignment', author: 'Bob', date: '5h ago', hash: 'e5f6g7h' },
                ],
                prs: [{ title: 'Feature/Tasks', status: 'OPEN', author: 'Alice' }]
            };

            // Mock Activity Data (Overview)
            const mockActivity: ActivityLog[] = [
                { id: '1', user: 'System', action: 'generated', target: 'Invoice #1023', timestamp: '2 hours ago' },
                { id: '2', user: 'Client', action: 'approved', target: 'Scope v1.2', timestamp: 'Yesterday' },
                { id: '3', user: 'Bob', action: 'uploaded', target: 'Wireframes.pdf', timestamp: '2 days ago' },
            ];

            // Mock Invoices (Expanded)
            const mockInvoices: Invoice[] = data.invoices?.length ? data.invoices : [
                { id: 'INV-2024-001', amount: '5000', status: 'PAID', createdAt: new Date(Date.now() - 840000000).toISOString(), items: [{ description: 'Initial Deposit', amount: 5000 }] },
                { id: 'INV-2024-002', amount: '7500', status: 'SENT', createdAt: new Date().toISOString(), items: [{ description: 'Milestone 1: Design', amount: 7500 }] }
            ];

            setProject({
                ...data,
                tasks: mappedTasks,
                github: mockGithub,
                activity: mockActivity,
                invoices: mockInvoices,
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
            });

            api.get('/auth/me').then(res => setUser(res.data)).catch(() => { });
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers (Restored) ---

    const handleAddTask = async (status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO') => {
        if (!project) return;
        const title = prompt('Task Title:');
        if (!title) return;
        const assignee = prompt('Assignee Name (optional):');
        try {
            await api.post('/tasks', { projectId: project.id, title, status, assignee });
            fetchProject();
        } catch (err: any) { alert(err.message); }
    };

    const handleAddSubtask = async (taskId: string) => {
        const title = prompt('Subtask Title:');
        if (!title) return;
        try {
            await api.post(`/tasks/${taskId}/subtasks`, { title });
            fetchProject();
        } catch (err: any) { alert(err.message); }
    };

    const handleToggleSubtask = async (subtask: { id: string; completed: boolean; title: string }) => {
        try {
            await api.patch(`/tasks/subtasks/${subtask.id}`, { completed: !subtask.completed, title: subtask.title });
            fetchProject();
        } catch (err: any) { alert(err.message); }
    };

    const handleAddScope = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        try {
            await api.post(`/projects/${project.id}/scopes`, { content: newScopeContent, price: parseFloat(newScopePrice) || 0 });
            setNewScopeContent(''); setNewScopePrice('');
            fetchProject();
        } catch (err) { alert('Failed to add scope'); }
    };

    const handleLockScope = async (scopeId: string) => {
        if (!project) return;
        try {
            await api.patch(`/projects/${project.id}/scopes/${scopeId}/lock`);
            fetchProject();
        } catch (err) { alert('Failed to lock scope'); }
    };

    const handleUploadDeliverable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;
        if (!newDeliverableUrl.startsWith('http')) { alert('Please enter a valid URL'); return; }
        try {
            await api.post('/deliverables', { projectId: project.id, fileUrl: newDeliverableUrl, notes: newDeliverableNotes });
            setNewDeliverableUrl(''); setNewDeliverableNotes('');
            fetchProject();
        } catch (err: any) { alert(err.message); }
    };

    const copyClientLink = () => {
        if (!project) return;
        const link = `https://agency-3vru.vercel.app/client/access/${project.clientAccessParam}`;
        navigator.clipboard.writeText(link);
        alert(`Copied link: ${link}`);
    };

    const handleCompleteProject = async () => {
        if (!project) return;
        if (!confirm('Are you sure?')) return;
        try {
            await api.patch(`/projects/${project.id}`, { status: 'COMPLETED' });
            fetchProject();
        } catch (err) { alert('Failed'); }
    };


    // --- Render Functions (Dashboard) ---

    if (loading) return <div className="p-8 text-gray-300">Loading...</div>;
    if (!project) return <div className="p-8 text-gray-300">Project not found</div>;

    const totalBudget = project.scopes.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const invoicedAmount = project.invoices.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const paidAmount = project.invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const progress = project.tasks.length ? Math.round((completedTasks / project.tasks.length) * 100) : 0;

    return (
        <div className="min-h-screen flex text-gray-100 font-sans">
            <Sidebar
                user={user}
                customNavItems={sidebarItems}
                activeItemId={activeTab}
                onViewChange={(id) => {
                    setActiveTab(id as any);
                    setSelectedInvoiceId(null); // Reset detail view
                }}
            />
            <div className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="glass rounded-xl p-6 shadow-xl flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
                            <p className="text-gray-400">Client: {project.clientEmail}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyClientLink}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 font-medium transition-all"
                            >
                                <LinkIcon size={18} /> Portal Link
                            </button>
                        </div>
                    </div>

                    {/* OVERVIEW DASHBOARD */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="glass p-5 rounded-xl border border-white/5">
                                    <h3 className="text-gray-400 text-xs uppercase font-semibold mb-2">Project Health</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <span className="text-2xl font-bold text-white">{progress}%</span>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                {completedTasks} / {project.tasks.length} Tasks
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 mt-4 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="glass p-5 rounded-xl border border-white/5">
                                    <h3 className="text-gray-400 text-xs uppercase font-semibold mb-2">Budget Utilized</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <span className="text-2xl font-bold text-white">${invoicedAmount.toLocaleString()}</span>
                                            <p className="text-xs text-gray-500">of ${totalBudget.toLocaleString()} Scope</p>
                                        </div>
                                    </div>
                                    {/* Mini Budget Bar */}
                                    <div className="flex h-1.5 mt-4 rounded-full overflow-hidden bg-white/5">
                                        <div className="bg-indigo-500 h-full" style={{ width: `${(invoicedAmount / (totalBudget || 1)) * 100}%` }}></div>
                                    </div>
                                </div>

                                <div className="glass p-5 rounded-xl border border-white/5">
                                    <h3 className="text-gray-400 text-xs uppercase font-semibold mb-2">Outstanding</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <span className="text-2xl font-bold text-white">${(invoicedAmount - paidAmount).toLocaleString()}</span>
                                            <p className="text-xs text-gray-500">Unpaid Invoices</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass p-5 rounded-xl border border-white/5">
                                    <h3 className="text-gray-400 text-xs uppercase font-semibold mb-2">Deadline</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold text-white">{new Date(project.dueDate || '').toLocaleDateString()}</span>
                                            <p className="text-xs text-gray-500">Target Completion</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                                    <div className="space-y-4">
                                        {project.activity.map((log) => (
                                            <div key={log.id} className="flex gap-4 items-start group">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400 border border-white/10 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-colors">
                                                    {log.user[0]}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="text-sm text-gray-200">
                                                        <span className="font-semibold text-white">{log.user}</span> {log.action} <span className="text-indigo-300">{log.target}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {project.activity.length === 0 && <p className="text-gray-500 text-sm">No activity recorded.</p>}
                                    </div>
                                </div>

                                {/* Pending Actions / Quick Links */}
                                <div className="glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button onClick={() => setActiveTab('scope')} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group">
                                            <span className="text-sm text-gray-300 group-hover:text-white">Add Scope Item</span>
                                            <Plus size={16} className="text-gray-500 group-hover:text-white" />
                                        </button>
                                        <button onClick={() => setActiveTab('tasks')} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group">
                                            <span className="text-sm text-gray-300 group-hover:text-white">Create Task</span>
                                            <ListTodo size={16} className="text-gray-500 group-hover:text-white" />
                                        </button>
                                        <button onClick={() => handleCompleteProject()} className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center group">
                                            <span className="text-sm text-gray-300 group-hover:text-white">Generate Report</span>
                                            <FileText size={16} className="text-gray-500 group-hover:text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SCOPE TAB */}
                    {activeTab === 'scope' && (
                        <div className="space-y-6">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                                <h3 className="text-indigo-400 font-semibold flex items-center gap-2 mb-1">
                                    <FileText size={18} /> Statement of Work (SOW)
                                </h3>
                                <p className="text-sm text-gray-300">
                                    Define the specific items, features, or services included in this project.
                                    Locking an item signals a signed agreement. This is your "Promise".
                                </p>
                            </div>
                            {project.scopes?.length === 0 && (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="text-gray-500" size={32} />
                                    </div>
                                    <h4 className="text-white font-medium mb-1">No Scope Defined</h4>
                                    <p className="text-sm text-gray-400 max-w-sm mx-auto">Start by adding line items that you agree to deliver.</p>
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
                                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 flex items-center gap-1"><Lock size={12} /> Approved</span>
                                            ) : (
                                                <button onClick={() => handleLockScope(scope.id)} className="text-xs text-indigo-400 hover:text-indigo-300">Mark as Approved</button>
                                            )}
                                            <span className="text-xl font-bold text-white">${parseFloat(scope.price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="prose prose-invert max-w-none text-gray-300"><p>{scope.content}</p></div>
                                </div>
                            ))}
                            <form onSubmit={handleAddScope} className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Add Line Item to SOW</h3>
                                <div className="space-y-4">
                                    <textarea placeholder="Describe the deliverable..." value={newScopeContent} onChange={(e) => setNewScopeContent(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 min-h-[100px]" />
                                    <div className="flex gap-4">
                                        <input type="number" placeholder="Price" value={newScopePrice} onChange={(e) => setNewScopePrice(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" />
                                        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">Add to Scope</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* DELIVERABLES TAB */}
                    {activeTab === 'deliverables' && (
                        <div className="space-y-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                <h3 className="text-emerald-400 font-semibold flex items-center gap-2 mb-1">
                                    <Layers size={18} /> Project Assets & Deliverables
                                </h3>
                                <p className="text-sm text-gray-300">
                                    Upload finished work for client review. Once approved, these items are considered complete.
                                    This is your "Proof" of work.
                                </p>
                            </div>
                            <form onSubmit={handleUploadDeliverable} className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Submit Asset for Review</h3>
                                <div className="space-y-4">
                                    <input type="text" placeholder="File URL..." value={newDeliverableUrl} onChange={(e) => setNewDeliverableUrl(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" />
                                    <textarea placeholder="Notes..." value={newDeliverableNotes} onChange={(e) => setNewDeliverableNotes(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 min-h-[80px]" />
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium">Submit for Approval</button>
                                </div>
                            </form>
                            <div className="space-y-4">
                                {project.deliverables?.map((del) => {
                                    const isApproved = del.approvals.some(a => a.action === 'APPROVE');
                                    const isRequested = del.approvals.some(a => a.action === 'REQUEST_CHANGES');
                                    return (
                                        <div key={del.id} className="glass p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                            <div className="w-full">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <span className="font-semibold text-white">Version {del.version}</span>
                                                    {isApproved ? <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs">APPROVED</span> : isRequested ? <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs">CHANGES REQUESTED</span> : <span className="text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded text-xs">PENDING APPROVAL</span>}
                                                </div>
                                                <a href={del.fileUrl} target="_blank" className="text-indigo-400 hover:text-indigo-300 underline text-sm">{del.fileUrl}</a>
                                                {del.notes && <p className="text-gray-300 text-sm mt-1">{del.notes}</p>}
                                            </div>
                                            <div className="text-right text-sm text-gray-400">{new Date(del.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    );
                                })}
                                {project.deliverables?.length === 0 && <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 border-dashed"><h4 className="text-white font-medium">No Deliverables Yet</h4><p className="text-sm text-gray-400">When you finish a task, upload it here.</p></div>}
                            </div>
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && project.tasks && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                            {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                                <div key={status} className="glass p-4 rounded-xl border border-white/5 h-fit min-h-[200px]">
                                    <h3 className="text-sm font-medium text-gray-400 mb-4 px-2 flex justify-between items-center">{status.replace('_', ' ')} <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-300">{project.tasks.filter(t => t.status === status).length}</span></h3>
                                    <div className="space-y-3">
                                        {project.tasks.filter(t => t.status === status).map(task => (
                                            <div key={task.id} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                                                <div className="flex justify-between items-start mb-2"><span className="text-sm font-medium text-white">{task.title}</span>{task.assignee && <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">{task.assignee.avatar}</div>}</div>
                                                {task.subtasks.length > 0 && <div className="space-y-1 mb-2">{task.subtasks.map(sub => (<div key={sub.id} className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer" onClick={() => handleToggleSubtask(sub)}><div className={`w-3 h-3 rounded-full border border-gray-600 ${sub.completed ? 'bg-emerald-500/20' : ''}`} />{sub.title}</div>))}</div>}
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5"><button onClick={() => handleAddSubtask(task.id)} className="text-[10px] text-gray-400 flex items-center gap-1"><Plus size={10} /> Subtask</button></div>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddTask(status as any)} className="w-full py-2 text-xs text-gray-400 border border-dashed border-white/10 rounded-lg">+ Add Task</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* INVOICES TAB (ENHANCED) */}
                    {activeTab === 'invoices' && (
                        <div className="space-y-6">
                            {selectedInvoiceId ? (
                                // DETAILED INVOICE VIEW
                                <div className="glass p-8 rounded-2xl border border-white/5">
                                    <button onClick={() => setSelectedInvoiceId(null)} className="flex items-center text-sm text-gray-400 hover:text-white mb-6"><ArrowLeft size={16} className="mr-1" /> Back to List</button>

                                    {/* Payment Flow Stepper */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center relative z-10">
                                            {['Generated', 'Sent', 'Viewed', 'Paid', 'Deposited'].map((step, i) => {
                                                const currentStatus = project.invoices.find(i => i.id === selectedInvoiceId)?.status;
                                                const statusMap = { 'DRAFT': 0, 'SENT': 1, 'PAID': 3, 'OVERDUE': 1 };
                                                const currentStepIndex = statusMap[currentStatus || 'DRAFT'] ?? 0;
                                                const active = i <= currentStepIndex;
                                                return (
                                                    <div key={step} className="flex flex-col items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-gray-700 text-gray-500'}`}>
                                                            {i + 1}
                                                        </div>
                                                        <span className={`text-xs ${active ? 'text-white font-medium' : 'text-gray-600'}`}>{step}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-0 hidden md:block" style={{ top: '240px' }}></div>
                                        {/* CSS Hack for stepper line, would normally use relative positioning better */}
                                    </div>

                                    {/* Invoice Content */}
                                    {(() => {
                                        const invoice = project.invoices.find(inv => inv.id === selectedInvoiceId);
                                        if (!invoice) return null;
                                        return (
                                            <div className="bg-white/5 rounded-xl p-8 border border-white/5">
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white mb-1">Invoice</h2>
                                                        <p className="text-gray-400">#{invoice.id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-400">Amount Due</p>
                                                        <p className="text-3xl font-bold text-white">${invoice.amount}</p>
                                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border ${invoice.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{invoice.status}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 mb-8">
                                                    <div className="flex justify-between text-sm text-gray-400 border-b border-gray-700 pb-2">
                                                        <span>Description</span>
                                                        <span>Amount</span>
                                                    </div>
                                                    {invoice.items?.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-white">
                                                            <span>{item.description}</span>
                                                            <span>${item.amount.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    {!invoice.items && <p className="text-gray-500 italic">No line items details.</p>}
                                                </div>

                                                <div className="flex justify-between pt-4 border-t border-gray-700">
                                                    <span className="text-white font-bold">Total</span>
                                                    <span className="text-white font-bold">${invoice.amount}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                // LIST VIEW
                                <div className="space-y-4">
                                    {project.invoices?.length === 0 ? (
                                        <div className="text-center py-12 glass rounded-xl border border-dashed border-white/10"><FileText size={48} className="mx-auto text-gray-500 mb-4" /><p className="text-gray-300">No invoices yet.</p></div>
                                    ) : (
                                        project.invoices?.map((inv) => (
                                            <div key={inv.id} onClick={() => setSelectedInvoiceId(inv.id)} className="cursor-pointer glass p-6 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/5 transition-colors group">
                                                <div>
                                                    <h3 className="font-bold text-white tracking-wide group-hover:text-indigo-400 transition-colors">Invoice #{inv.id.slice(0, 8)}</h3>
                                                    <p className="text-gray-400 text-sm">Generated on {new Date(inv.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className="block text-xl font-bold text-white mb-1">${inv.amount}</span>
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{inv.status}</span>
                                                    </div>
                                                    <ArrowLeft size={16} className="rotate-180 text-gray-600 group-hover:text-indigo-400" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {/* CODE TAB */}
                    {activeTab === 'code' && project.github && (
                        <div className="glass p-6 rounded-2xl border border-white/5"><div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white"><Code size={24} /></div><div><h3 className="text-lg font-bold text-white">{project.github.repo}</h3><p className={`text-sm ${project.github.connected ? 'text-emerald-400' : 'text-orange-400'}`}>{project.github.connected ? 'Connected' : 'Not Connected'}</p></div></div><h3 className="text-sm font-semibold uppercase text-gray-500 mb-4">Recent Commits</h3><div className="space-y-4">{project.github.commits.map((c, i) => (<div key={i} className="flex gap-3"><div className="mt-1 w-2 h-2 rounded-full bg-gray-600" /><div><p className="text-sm text-gray-200 font-mono">{c.message}</p><p className="text-xs text-gray-500">{c.author} • {c.date}</p></div></div>))}</div></div>
                    )}
                </div>
            </div>

            {/* TOUR OVERLAY */}
            {showTour && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0f1115] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">{tourSteps[tourStep].title}</h2>
                            <p className="text-gray-400 leading-relaxed">{tourSteps[tourStep].content}</p>
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <div className="flex gap-2">
                                {tourSteps.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === tourStep ? 'w-8 bg-indigo-500' : 'w-2 bg-gray-700'}`}></div>
                                ))}
                            </div>
                            <button
                                onClick={handleTourNext}
                                className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                {tourStep === tourSteps.length - 1 ? 'Get Started' : 'Next'} <ArrowLeft size={16} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
