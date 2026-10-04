'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import {
    LayoutGrid, Plus, DollarSign, Users, Briefcase, Activity, Target,
    Search, Calendar, CreditCard, ChevronRight, CheckCircle, FileText,
    Star, Trash2, Clock, TrendingUp, CheckSquare, ShieldCheck,
    ArrowUpRight, Bell, Sparkles, Download, ExternalLink, X, Command,
    AlertCircle, FolderPlus, UserCheck, Edit3, ArrowRight, ArrowLeft,
    Phone, Mail, MessageSquare, Award, Flame, UserPlus, Filter, MoreVertical,
    Key, Eye, EyeOff, Copy
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import LandingPage from '@/app/components/LandingPage';
import SalesDashboardView from '@/app/components/SalesDashboardView';
import DailyTrackerView from '@/app/components/DailyTrackerView';
import DailyReportsAdminFeed from '@/app/components/DailyReportsAdminFeed';
import TeamChatView from '@/app/components/TeamChatView';
import CheckInWidget from '@/app/components/CheckInWidget';
import AttendanceView from '@/app/components/AttendanceView';
import TechDashboardView from '@/app/components/TechDashboardView';
import LeadershipDashboardView from '@/app/components/LeadershipDashboardView';

// --- Interfaces ---
interface Scope {
    id?: string;
    price: number;
    content?: string;
}

interface Payment {
    id: string;
    amount: number;
    transactionId?: string;
    status: string;
    createdAt: string;
}

interface Invoice {
    id: string;
    projectId: string;
    amount: number | string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
    dueDate?: string;
    paidAt?: string;
    createdAt?: string;
    project?: {
        id: string;
        name: string;
        clientEmail?: string;
    };
    payments?: Payment[];
}

interface Task {
    id: string;
    projectId: string;
    title: string;
    status: string;
    assignee?: string;
    dueDate?: string;
    createdAt?: string;
    project?: {
        id: string;
        name: string;
        clientEmail?: string;
    };
    subtasks?: Array<{ id: string; title: string; completed: boolean }>;
}

interface Project {
    id: string;
    name: string;
    clientEmail?: string;
    updatedAt: string;
    status?: string;
    invoices?: Invoice[];
    scopes?: Scope[];
    tasks?: Task[];
    deliverables?: any[];
    _count?: {
        deliverables?: number;
        invoices?: number;
        tasks?: number;
    };
}

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    companyName?: string;
    department?: string;
    plan: 'FREE' | 'PRO';
    trialEndsAt: string | null;
}

interface Lead {
    id: string;
    name: string;
    company?: string;
    email?: string;
    value: string | number;
    status: 'NEW' | 'DISCUSSION' | 'PROPOSAL' | 'WON' | 'LOST';
    assignedToEmail?: string;
    assignedToName?: string;
    priority?: string;
    notes?: string;
    ownerId?: string;
    createdAt?: string;
}

interface Contact {
    id: string;
    name: string;
    role?: string;
    company?: string;
    email: string;
    type?: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    avatarUrl?: string;
    department?: string; // 'SALES' | 'OPERATIONS' | 'DEVELOPMENT' | 'DESIGN' | 'MANAGEMENT'
    phone?: string;
    status?: 'ACTIVE' | 'INVITED' | 'ON_LEAVE';
    loginPassword?: string;
    projectsCount?: number;
    leadsAssigned?: number;
    dealsClosed?: number;
    revenueGenerated?: number | string;
    rating?: string | number;
    createdAt?: string;
}

// Format Currency to Indian Rupee (INR ₹)
export function formatINR(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatCompactINR(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
}

export default function Dashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const viewParam = params.get('view');
            if (viewParam) return viewParam;
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    if (parsed.role === 'SALES') return 'sales_dashboard';
                } catch (e) {}
            }
        }
        return 'dashboard';
    });
    const [loading, setLoading] = useState(true);
    const [showLanding, setShowLanding] = useState(false);

    // Live Real Database State (Zero Hardcoded / Random Arrays)
    const [projects, setProjects] = useState<Project[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [user, setUser] = useState<User | null>(null);

    // UI & Modal States
    const [searchQuery, setSearchQuery] = useState('');
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [modalType, setModalType] = useState<'project' | 'lead' | 'contact' | 'task' | 'invoice' | 'payment' | 'team' | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [invoiceFilter, setInvoiceFilter] = useState<string>('ALL');
    const [teamDepartmentFilter, setTeamDepartmentFilter] = useState<string>('ALL');
    const [teamSearchQuery, setTeamSearchQuery] = useState('');
    const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
    const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

    const userRole = (user?.role || 'OWNER').toUpperCase();
    const userDept = (user?.department || (userRole === 'SALES' ? 'SALES' : (userRole === 'DEVELOPER' ? 'DEVELOPMENT' : 'MANAGEMENT'))).toUpperCase();
    const isCompanyAdmin = userRole === 'ADMIN' || userRole === 'OWNER' || user?.email === 'aalokshaw2003@gmail.com';
    const isSales = !isCompanyAdmin && (userDept === 'SALES' || userRole === 'SALES');
    const isTech = !isCompanyAdmin && (userDept === 'DEVELOPMENT' || userDept === 'TECH_DEV' || userDept === 'TECH' || userRole === 'DEVELOPER');
    const isLeadership = !isCompanyAdmin && (userDept === 'MANAGEMENT' || userDept === 'LEADERSHIP');

    const toggleRevealPassword = (id: string) => {
        setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsCommandPaletteOpen(false);
                setShowNotifications(false);
                setModalType(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            setShowLanding(true);
            setLoading(false);
            return;
        }

        try {
            const userRes = await api.get('/auth/me');
            const currentUser = userRes.data;
            setUser(currentUser);

            const role = (currentUser?.role || 'OWNER').toUpperCase();
            const dept = (currentUser?.department || (role === 'SALES' ? 'SALES' : (role === 'DEVELOPER' ? 'DEVELOPMENT' : 'MANAGEMENT'))).toUpperCase();
            const isCompanyAdmin = role === 'ADMIN' || role === 'OWNER' || currentUser?.email === 'aalokshaw2003@gmail.com';

            if (!isCompanyAdmin) {
                if (dept === 'SALES' || role === 'SALES') {
                    setActiveView(prev => (prev === 'dashboard' ? 'sales_dashboard' : prev));
                } else if (dept === 'DEVELOPMENT' || dept === 'TECH_DEV' || dept === 'TECH' || role === 'DEVELOPER') {
                    setActiveView(prev => (prev === 'dashboard' ? 'tech_dashboard' : prev));
                } else if (dept === 'MANAGEMENT' || dept === 'LEADERSHIP') {
                    setActiveView(prev => (prev === 'dashboard' ? 'leadership_dashboard' : prev));
                }
            }
            await refreshAllData();
        } catch (err: any) {
            if (err.response?.status === 401) {
                setShowLanding(true);
            }
            setLoading(false);
        }
    };

    const refreshAllData = async () => {
        try {
            const [projRes, leadRes, contRes, taskRes, invRes, teamRes] = await Promise.all([
                api.get('/projects').catch(() => ({ data: [] })),
                api.get('/leads').catch(() => ({ data: [] })),
                api.get('/contacts').catch(() => ({ data: [] })),
                api.get('/tasks').catch(() => ({ data: [] })),
                api.get('/invoices').catch(() => ({ data: [] })),
                api.get('/team').catch(() => ({ data: [] }))
            ]);

            setProjects(projRes.data || []);
            setLeads(leadRes.data || []);
            setContacts(contRes.data || []);
            setTasks(taskRes.data || []);
            setInvoices(invRes.data || []);
            setTeam(teamRes.data || []);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    // Calculate real stats strictly from live user database records
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let pendingInvoices = 0;
        const clientSet = new Set<string>();

        // Tally invoices directly
        invoices.forEach(inv => {
            const amt = parseFloat(inv.amount.toString()) || 0;
            if (inv.status === 'PAID') {
                totalRevenue += amt;
            } else {
                pendingInvoices += amt;
            }
        });

        // Also tally any project scopes if no standalone invoices were generated yet
        if (invoices.length === 0) {
            projects.forEach(p => {
                const scopePrice = p.scopes?.[0]?.price || 0;
                if (p.status === 'COMPLETED') {
                    totalRevenue += Number(scopePrice);
                } else if (p.status === 'ACTIVE') {
                    pendingInvoices += Number(scopePrice);
                }
            });
        }

        // Tally unique clients
        contacts.forEach(c => {
            if (c.email) clientSet.add(c.email.toLowerCase());
        });
        projects.forEach(p => {
            if (p.clientEmail) clientSet.add(p.clientEmail.toLowerCase());
        });

        return {
            totalRevenue,
            pendingInvoices,
            activeProjects: projects.filter(p => p.status !== 'ARCHIVED').length,
            totalClients: clientSet.size
        };
    }, [projects, invoices, contacts]);

    // Live Operational Priorities directly from real user records
    const operationalPriorities = useMemo(() => {
        const now = new Date();

        // 1. Overdue Tasks: dueDate < today and not DONE
        const overdueTasks = tasks.filter(t => {
            if (t.status === 'DONE') return false;
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < now;
        });

        // 2. Overdue Invoices: status !== PAID and (status === OVERDUE or dueDate < today)
        const overdueInvoices = invoices.filter(inv => {
            if (inv.status === 'PAID') return false;
            if (inv.status === 'OVERDUE') return true;
            if (inv.dueDate && new Date(inv.dueDate) < now) return true;
            return false;
        });

        // 3. Pending Deliverable Approvals
        let pendingApprovalsCount = 0;
        projects.forEach(p => {
            p.deliverables?.forEach((d: any) => {
                const hasApproval = d.approvals?.some((a: any) => a.action === 'APPROVE');
                if (!hasApproval) pendingApprovalsCount++;
            });
        });

        // 4. Projects with deadlines within next 48 hours
        const upcomingProjectDeadlines = projects.filter(p => {
            if (p.status === 'COMPLETED' || p.status === 'ARCHIVED') return false;
            // Check tasks with upcoming deadline in next 2 days
            return p.tasks?.some(t => {
                if (!t.dueDate || t.status === 'DONE') return false;
                const due = new Date(t.dueDate);
                const diffHours = (due.getTime() - now.getTime()) / (1000 * 3600);
                return diffHours >= 0 && diffHours <= 48;
            });
        });

        return {
            overdueTasks,
            overdueInvoices,
            pendingApprovalsCount,
            upcomingProjectDeadlines
        };
    }, [tasks, invoices, projects]);

    // Lead stage transition handler
    const handleMoveLeadStage = async (leadId: string, currentStatus: string, direction: 'forward' | 'backward') => {
        const stages: Array<'NEW' | 'DISCUSSION' | 'PROPOSAL' | 'WON' | 'LOST'> = ['NEW', 'DISCUSSION', 'PROPOSAL', 'WON'];
        const currentIndex = stages.indexOf(currentStatus as any);
        if (currentIndex === -1) return;

        const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0 || nextIndex >= stages.length) return;

        const newStatus = stages[nextIndex];
        try {
            await api.patch(`/leads/${leadId}`, { status: newStatus });
            refreshAllData();
        } catch (e) {
            alert('Failed to update lead status');
        }
    };

    // Lead won conversion handler
    const handleConvertWonLead = async (lead: Lead) => {
        if (confirm(`Convert Won Lead "${lead.name}" (${lead.company || 'Client'}) into a project and client record?`)) {
            try {
                const clientEmail = lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '')}@${(lead.company || 'client').toLowerCase().replace(/\s+/g, '')}.com`;

                // 1. Create Contact
                await api.post('/contacts', {
                    name: lead.name,
                    company: lead.company || 'Client Company',
                    email: clientEmail,
                    type: 'Client'
                });

                // 2. Create Project
                await api.post('/projects', {
                    name: `${lead.company || lead.name} Engagement`,
                    clientEmail
                });

                // 3. Mark Lead as WON
                await api.patch(`/leads/${lead.id}`, { status: 'WON' });

                alert('Lead converted to Client and Project successfully!');
                refreshAllData();
            } catch (err: any) {
                alert('Conversion failed: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    // Delete lead
    const handleDeleteLead = async (leadId: string) => {
        if (confirm('Are you sure you want to delete this lead?')) {
            try {
                await api.delete(`/leads/${leadId}`);
                refreshAllData();
            } catch (e) {
                alert('Failed to delete lead');
            }
        }
    };

    // Delete contact
    const handleDeleteContact = async (contactId: string) => {
        if (confirm('Delete this client contact?')) {
            try {
                await api.delete(`/contacts/${contactId}`);
                refreshAllData();
            } catch (e) {
                alert('Failed to delete contact');
            }
        }
    };

    // Delete project
    const handleDeleteProject = async (projectId: string) => {
        if (confirm('Are you sure you want to delete this project and all its tasks, deliverables, and invoices?')) {
            try {
                // Optimistic UI update
                setProjects(prev => prev.filter(p => p.id !== projectId));
                await api.delete(`/projects/${projectId}`);
                await refreshAllData();
            } catch (err: any) {
                console.error('[Delete Project Error]', err);
                const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete project';
                alert(errorMsg);
                await refreshAllData();
            }
        }
    };

    // Delete invoice
    const handleDeleteInvoice = async (invoiceId: string) => {
        if (confirm('Delete this invoice?')) {
            try {
                await api.delete(`/invoices/${invoiceId}`);
                refreshAllData();
            } catch (e) {
                alert('Failed to delete invoice');
            }
        }
    };

    // Task toggle handler
    const handleToggleTaskStatus = async (task: Task) => {
        const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        try {
            await api.patch(`/tasks/${task.id}`, { status: nextStatus });
            refreshAllData();
        } catch (e) {
            alert('Failed to update task');
        }
    };

    // Task delete handler
    const handleDeleteTask = async (taskId: string) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            refreshAllData();
        } catch (e) {
            alert('Failed to delete task');
        }
    };

    // Team member delete handler
    const handleDeleteTeamMember = async (memberId: string, memberName: string) => {
        if (confirm(`Are you sure you want to remove "${memberName}" from the team workspace?`)) {
            try {
                setTeam(prev => prev.filter(m => m.id !== memberId));
                await api.delete(`/team/${memberId}`);
                await refreshAllData();
            } catch (err: any) {
                alert(err.response?.data?.error || 'Failed to remove team member');
                await refreshAllData();
            }
        }
    };

    // Team member edit opener
    const handleEditTeamMember = (member: TeamMember) => {
        setEditingTeamMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            email: member.email,
            password: member.loginPassword || '',
            department: member.department || 'SALES',
            phone: member.phone || '',
            status: member.status || 'ACTIVE',
            leadsAssigned: member.leadsAssigned || 0,
            dealsClosed: member.dealsClosed || 0,
            revenueGenerated: member.revenueGenerated || 0,
            projectsCount: member.projectsCount || 0,
            rating: member.rating || 5.0
        });
        setModalType('team');
    };

    // Record Payment Form submit
    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;
        setSubmitting(true);
        try {
            await api.post(`/invoices/${selectedInvoice.id}/payments`, {
                amount: parseFloat(formData.amount || selectedInvoice.amount),
                method: formData.method || 'UPI',
                transactionId: formData.transactionId || `PAY-${Date.now()}`
            });
            alert('Payment recorded successfully! Invoice marked as PAID.');
            setModalType(null);
            setSelectedInvoice(null);
            setFormData({});
            refreshAllData();
        } catch (err: any) {
            alert(err.response?.data?.error || err.message || 'Payment recording failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Generic Modal Form Submit
    const handleGenericSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalType === 'project') {
                await api.post('/projects', {
                    name: formData.name,
                    clientEmail: formData.clientEmail || undefined
                });
            } else if (modalType === 'lead') {
                await api.post('/leads', {
                    name: formData.name,
                    company: formData.company || undefined,
                    email: formData.email || undefined,
                    value: formData.value ? parseFloat(formData.value) : 0,
                    status: formData.status || 'NEW'
                });
            } else if (modalType === 'contact') {
                await api.post('/contacts', {
                    name: formData.name,
                    company: formData.company || undefined,
                    email: formData.email,
                    role: formData.role || undefined,
                    type: formData.type || 'CLIENT'
                });
            } else if (modalType === 'task') {
                await api.post('/tasks', {
                    projectId: formData.projectId,
                    title: formData.title,
                    assignee: formData.assignee || undefined,
                    status: formData.status || 'TODO',
                    dueDate: formData.dueDate || undefined
                });
            } else if (modalType === 'invoice') {
                await api.post('/invoices', {
                    projectId: formData.projectId,
                    amount: parseFloat(formData.amount),
                    status: formData.status || 'DRAFT',
                    dueDate: formData.dueDate || undefined
                });
            } else if (modalType === 'team') {
                const payload = {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    department: formData.department || 'SALES',
                    phone: formData.phone || undefined,
                    loginPassword: formData.password || undefined,
                    status: formData.status || 'ACTIVE',
                    leadsAssigned: parseInt(formData.leadsAssigned) || 0,
                    dealsClosed: parseInt(formData.dealsClosed) || 0,
                    revenueGenerated: parseFloat(formData.revenueGenerated) || 0,
                    projectsCount: parseInt(formData.projectsCount) || 0,
                    rating: parseFloat(formData.rating) || 5.0
                };
                if (editingTeamMember) {
                    await api.patch(`/team/${editingTeamMember.id}`, payload);
                    if (formData.password) {
                        const targetRole = (formData.department === 'SALES' ? 'SALES' : (formData.role?.toUpperCase().includes('DEV') ? 'DEVELOPER' : 'TEAM_MEMBER'));
                        await api.post('/auth/create-team-user', {
                            name: formData.name,
                            email: formData.email,
                            password: formData.password,
                            role: targetRole,
                            department: formData.department || 'SALES',
                            phone: formData.phone || undefined
                        }).catch(() => {});
                    }
                    alert(`✅ Team Member Updated!\n\nEmail: ${formData.email}\nPassword: ${formData.password || '(unchanged)'}`);
                } else {
                    if (formData.password) {
                        const targetRole = (formData.department === 'SALES' ? 'SALES' : (formData.role?.toUpperCase().includes('DEV') ? 'DEVELOPER' : 'TEAM_MEMBER'));
                        await api.post('/auth/create-team-user', {
                            name: formData.name,
                            email: formData.email,
                            password: formData.password,
                            role: targetRole,
                            department: formData.department || 'SALES',
                            phone: formData.phone || undefined
                        });
                        alert(`✅ Team Member Account Created!\n\nLogin Email: ${formData.email}\nPassword: ${formData.password}\nDepartment: ${formData.department || 'SALES'}\n\nThey can now sign in at the login page and access their role dashboard.`);
                    } else {
                        await api.post('/team', payload);
                    }
                }
                setEditingTeamMember(null);
            }

            setModalType(null);
            setFormData({});
            refreshAllData();
        } catch (err: any) {
            alert(err.response?.data?.error || err.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Account plan state
    const isPro = user?.plan === 'PRO';
    const isTrialActive = Boolean(user?.trialEndsAt && new Date(user.trialEndsAt) > new Date());
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 3600 * 24)))
        : 0;

    // --- Dynamic Account Banner ---
    const AccountPlanBanner = () => {
        if (isPro) {
            return (
                <div className="bg-[#0b101d] border border-emerald-500/20 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">Growth Plan Active</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    PRO
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">Unlimited Projects, Client Portals, and Invoices Enabled</p>
                        </div>
                    </div>
                    <button
                        onClick={() => alert("Subscription Management: Managed via Billing Settings.")}
                        className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-gray-300 border border-white/10 transition-colors shrink-0"
                    >
                        Manage Subscription
                    </button>
                </div>
            );
        }

        if (isTrialActive) {
            return (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 p-6 mb-8 border border-indigo-500/30 shadow-xl shadow-indigo-950/30">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
                                    <Sparkles size={12} /> Pro Trial
                                </span>
                                <span className="text-white font-bold text-base">
                                    Your Pro trial ends in {trialDaysRemaining} days
                                </span>
                            </div>
                            <p className="text-indigo-200/80 text-sm max-w-xl">
                                You are currently using all premium agency features including CRM Pipelines, GST billing, and Client Portals.
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm("Upgrade to PRO plan to unlock unlimited projects?")) {
                                    try {
                                        await api.post('/auth/upgrade');
                                        alert("Upgraded to PRO!");
                                        window.location.reload();
                                    } catch (e) {
                                        alert("Upgrade failed.");
                                    }
                                }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shrink-0"
                        >
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative overflow-hidden rounded-2xl bg-[#0f111a] p-6 mb-8 border border-white/[0.08]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold text-white mb-1">You are currently on the Free plan.</h3>
                        <p className="text-gray-400 text-sm">
                            Unlock unlimited projects, advanced client portals, and automated billing.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            if (confirm("Upgrade to Pro Plan?")) {
                                try {
                                    await api.post('/auth/upgrade');
                                    alert("Upgraded to Pro Plan!");
                                    window.location.reload();
                                } catch (e) {
                                    alert("Upgrade failed.");
                                }
                            }
                        }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shrink-0"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        );
    };

    // --- Top Navigation Header ---
    const TopNavBar = ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/[0.06]">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                {/* One-Click Attendance Duty Check-In Tracker */}
                <CheckInWidget compact user={user} />

                {/* Global Search Input (opens Command Palette) */}
                <button
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="flex items-center gap-3 bg-[#0a0f1d] hover:bg-[#111827] border border-white/[0.08] hover:border-white/[0.15] px-3.5 py-2 rounded-xl text-xs text-gray-400 transition-all shadow-sm group"
                >
                    <Search size={15} className="text-gray-500 group-hover:text-gray-300" />
                    <span>Search projects, leads, clients...</span>
                    <span className="ml-2 font-mono text-[10px] bg-white/[0.08] px-1.5 py-0.5 rounded text-gray-300 border border-white/10">
                        Ctrl+K
                    </span>
                </button>

                {/* Notifications Center */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(prev => !prev)}
                        className="p-2.5 rounded-xl bg-[#0a0f1d] hover:bg-[#111827] border border-white/[0.08] text-gray-400 hover:text-white transition-colors relative"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {(operationalPriorities.overdueTasks.length > 0 || operationalPriorities.overdueInvoices.length > 0) && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#030712] animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-2xl p-4 z-40">
                            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                                <span className="font-bold text-xs text-white uppercase tracking-wider">Live System Alerts</span>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="text-[11px] text-gray-400 hover:text-white"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="space-y-2.5 max-h-64 overflow-y-auto text-xs">
                                {operationalPriorities.overdueTasks.length > 0 ? (
                                    operationalPriorities.overdueTasks.map(t => (
                                        <div key={t.id} className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-gray-300">
                                            <div className="font-semibold text-red-400">Task Overdue: {t.title}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{t.project?.name || 'Project task'}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-xs py-4 text-center">
                                        All tasks and deliverables on schedule.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Quick Create Button */}
                <button
                    onClick={() => {
                        if (!isPro && !isTrialActive && projects.length >= 3) {
                            alert('Free Plan Limit Reached (3 Projects). Please Upgrade.');
                            return;
                        }
                        setModalType('project');
                    }}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                >
                    <Plus size={16} /> New Project
                </button>
            </div>
        </header>
    );

    // --- Command Palette Component (Ctrl+K) ---
    const CommandPalette = () => {
        if (!isCommandPaletteOpen) return null;

        const actionList = [
            { id: 'act-proj', label: 'Create New Project', action: () => { setModalType('project'); setIsCommandPaletteOpen(false); }, icon: Plus },
            { id: 'act-lead', label: 'Add Sales Lead', action: () => { setModalType('lead'); setIsCommandPaletteOpen(false); }, icon: Target },
            { id: 'act-client', label: 'Add Client Contact', action: () => { setModalType('contact'); setIsCommandPaletteOpen(false); }, icon: Users },
            { id: 'act-task', label: 'Create Project Task', action: () => { setModalType('task'); setIsCommandPaletteOpen(false); }, icon: CheckSquare },
            { id: 'act-inv', label: 'Generate GST Invoice', action: () => { setModalType('invoice'); setIsCommandPaletteOpen(false); }, icon: FileText },
            { id: 'act-portal', label: 'Open Client Portal Preview', action: () => { router.push('/portal/preview'); setIsCommandPaletteOpen(false); }, icon: ExternalLink },
            { id: 'act-sett', label: 'Open Settings', action: () => { setActiveView('settings'); setIsCommandPaletteOpen(false); }, icon: Command }
        ].filter(a => a.label.toLowerCase().includes(searchQuery.toLowerCase()));

        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4">
                <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
                        <Search size={18} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Type a command, jump to a view, or search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
                        />
                        <button onClick={() => setIsCommandPaletteOpen(false)} className="text-gray-500 hover:text-white p-1">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-2 max-h-80 overflow-y-auto space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Quick Actions
                        </div>
                        {actionList.map((action) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={action.id}
                                    onClick={action.action}
                                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm text-gray-200 hover:bg-white/[0.06] hover:text-white transition-colors group"
                                >
                                    <div className="p-1.5 rounded-lg bg-white/[0.05] group-hover:bg-indigo-500/20 text-gray-400 group-hover:text-indigo-400 transition-colors">
                                        <ActionIcon size={16} />
                                    </div>
                                    <span className="font-medium flex-1">{action.label}</span>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-400" />
                                </button>
                            );
                        })}
                    </div>

                    <div className="px-4 py-2.5 bg-black/30 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-500">
                        <span>Navigate with keyboard • ESC to close</span>
                        <span className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10">agnecyos</span>
                    </div>
                </div>
            </div>
        );
    };

    // --- Overview View (Strictly Live Data) ---
    const DashboardOverview = () => {
        return (
            <div className="max-w-7xl mx-auto space-y-8">
                <TopNavBar
                    title="Overview"
                    subtitle="Executive agency performance, operational priorities, and financial health."
                />

                <AccountPlanBanner />

                {/* 4 Key Metric Cards (Real Values) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">TOTAL REVENUE</span>
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                            {formatINR(stats.totalRevenue)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {invoices.filter(i => i.status === 'PAID').length} paid invoices collected
                        </div>
                    </div>

                    <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">OUTSTANDING</span>
                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                                <Activity size={18} />
                            </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                            {formatINR(stats.pendingInvoices)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {invoices.filter(i => i.status !== 'PAID').length} pending client payments
                        </div>
                    </div>

                    <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">ACTIVE PROJECTS</span>
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                <Briefcase size={18} />
                            </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                            {stats.activeProjects}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {projects.filter(p => p.status === 'COMPLETED').length} completed to date
                        </div>
                    </div>

                    <div className="bg-[#0a0f1d] border border-white/[0.07] p-5 rounded-2xl flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">ACTIVE CLIENTS</span>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                <Users size={18} />
                            </div>
                        </div>
                        <div className="text-2xl lg:text-3xl font-bold text-white font-mono tracking-tight mb-2">
                            {stats.totalClients}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                            {contacts.length} client accounts registered
                        </div>
                    </div>
                </div>

                {/* Today's Priorities (My Work - Computed directly from live data) */}
                <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight">Today&apos;s Priorities</h2>
                                <p className="text-xs text-gray-400">Immediate operational items that require your action today.</p>
                            </div>
                        </div>
                        <span className="text-[11px] font-mono text-gray-400">{new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div
                            onClick={() => setActiveView('tasks')}
                            className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 hover:border-red-500/40 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                {operationalPriorities.overdueTasks.length} Overdue Tasks
                            </div>
                            <p className="text-xs text-gray-300 font-medium truncate">
                                {operationalPriorities.overdueTasks.length > 0 ? operationalPriorities.overdueTasks[0].title : 'No overdue tasks'}
                            </p>
                            <span className="text-[10px] text-gray-400 group-hover:text-red-300 mt-2 inline-flex items-center gap-1">
                                View Tasks <ChevronRight size={12} />
                            </span>
                        </div>

                        <div
                            onClick={() => setActiveView('approvals')}
                            className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                {operationalPriorities.pendingApprovalsCount} Approvals Waiting
                            </div>
                            <p className="text-xs text-gray-300 font-medium truncate">
                                {operationalPriorities.pendingApprovalsCount > 0 ? 'Deliverables pending sign-off' : 'All deliverables reviewed'}
                            </p>
                            <span className="text-[10px] text-gray-400 group-hover:text-amber-300 mt-2 inline-flex items-center gap-1">
                                Check Approvals <ChevronRight size={12} />
                            </span>
                        </div>

                        <div
                            onClick={() => setActiveView('finance')}
                            className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                {operationalPriorities.overdueInvoices.length} Overdue Invoices
                            </div>
                            <p className="text-xs text-gray-300 font-medium truncate">
                                {formatINR(operationalPriorities.overdueInvoices.reduce((acc, i) => acc + (parseFloat(i.amount.toString()) || 0), 0))} pending collection
                            </p>
                            <span className="text-[10px] text-gray-400 group-hover:text-indigo-300 mt-2 inline-flex items-center gap-1">
                                View Invoices <ChevronRight size={12} />
                            </span>
                        </div>

                        <div
                            onClick={() => setActiveView('projects')}
                            className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all group"
                        >
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                {operationalPriorities.upcomingProjectDeadlines.length} Upcoming Deadlines
                            </div>
                            <p className="text-xs text-gray-300 font-medium truncate">
                                {operationalPriorities.upcomingProjectDeadlines.length > 0 ? operationalPriorities.upcomingProjectDeadlines[0].name : 'No urgent deadlines today'}
                            </p>
                            <span className="text-[10px] text-gray-400 group-hover:text-blue-300 mt-2 inline-flex items-center gap-1">
                                Check Projects <ChevronRight size={12} />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Live Team Check-Ins & Attendance Monitor for Admin */}
                <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight">Live Team Attendance & Check-Ins</h2>
                                <p className="text-xs text-gray-400">Real-time status of staff members on duty across your organization.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveView('attendance')}
                            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                            <span>Open Attendance Desk</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    <AttendanceView />
                </div>

                {/* Recent Projects Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Recent Projects</h2>
                        <button
                            onClick={() => setActiveView('projects')}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                            View all projects ({projects.length}) <ChevronRight size={14} />
                        </button>
                    </div>

                    {projects.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                            <FolderPlus size={36} className="text-indigo-400 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-white mb-1">No projects created yet</h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                                Add your first client project to start tracking scopes, tasks, and client approvals.
                            </p>
                            <button
                                onClick={() => setModalType('project')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                            >
                                <Plus size={16} /> Create Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {projects.slice(0, 3).map((project) => {
                                const totalProjectTasks = project.tasks?.length || 0;
                                const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
                                const progressPct = totalProjectTasks > 0 ? Math.round((completedTasks / totalProjectTasks) * 100) : 0;
                                const contractValue = project.scopes?.[0]?.price || 0;

                                return (
                                    <Link key={project.id} href={`/projects/${project.id}`}>
                                        <div className="bg-[#0a0f1d] hover:bg-[#111827] border border-white/[0.08] hover:border-indigo-500/40 p-6 rounded-2xl transition-all hover:-translate-y-1 shadow-lg group flex flex-col justify-between h-full">
                                            <div>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                                                        {project.name.charAt(0)}
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        {project.status || 'ACTIVE'}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-base text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <p className="text-xs text-gray-400 mb-5">
                                                    {project.clientEmail || 'No client email assigned'}
                                                </p>

                                                {/* Tasks completion ratio */}
                                                <div className="space-y-1.5 mb-5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-400">{completedTasks} / {totalProjectTasks} tasks done</span>
                                                        <span className="font-bold text-white font-mono">{progressPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                                                            style={{ width: `${progressPct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Contract Value</div>
                                                    <div className="font-bold text-white font-mono text-sm">{formatINR(contractValue)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Updated</div>
                                                    <div className="text-gray-300 font-medium">{new Date(project.updatedAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Project Profitability Breakdown (Real Projects) */}
                <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-400" /> Project Profitability &amp; Financials
                            </h2>
                            <p className="text-xs text-gray-400">Real-time revenue collected vs outstanding balances per project.</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {projects.length} Active Projects
                        </span>
                    </div>

                    {projects.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-xs">
                            No project financial data yet. Add a project and generate invoices to track profitability.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="text-gray-400 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                                    <tr>
                                        <th className="pb-3 pl-2">Project</th>
                                        <th className="pb-3">Client</th>
                                        <th className="pb-3">Contract Value</th>
                                        <th className="pb-3">Collected (Paid)</th>
                                        <th className="pb-3">Pending</th>
                                        <th className="pb-3 text-right pr-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {projects.map((proj) => {
                                        const contractVal = proj.scopes?.[0]?.price || 0;
                                        let paidAmt = 0;
                                        let pendingAmt = 0;
                                        proj.invoices?.forEach(inv => {
                                            const a = parseFloat(inv.amount.toString()) || 0;
                                            if (inv.status === 'PAID') paidAmt += a;
                                            else pendingAmt += a;
                                        });

                                        return (
                                            <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 pl-2 font-medium text-white">{proj.name}</td>
                                                <td className="py-3.5 text-gray-400">{proj.clientEmail || 'N/A'}</td>
                                                <td className="py-3.5 font-mono text-gray-200">{formatINR(contractVal)}</td>
                                                <td className="py-3.5 font-mono font-bold text-emerald-400">{formatINR(paidAmt)}</td>
                                                <td className="py-3.5 font-mono text-amber-400">{formatINR(pendingAmt)}</td>
                                                <td className="py-3.5 text-right pr-2">
                                                    <Link href={`/projects/${proj.id}`} className="text-indigo-400 hover:text-indigo-300 font-bold">
                                                        Manage &rarr;
                                                    </Link>
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
    };

    // --- Leads CRM Pipeline (5-Stage Kanban) ---
    const LeadsView = () => {
        const crmStages: Array<'NEW' | 'DISCUSSION' | 'PROPOSAL' | 'WON' | 'LOST'> = [
            'NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST'
        ];

        const totalValue = leads.reduce((acc, l) => acc + (parseFloat(l.value?.toString() || '0') || 0), 0);

        return (
            <div className="space-y-6">
                <TopNavBar
                    title="Leads Pipeline"
                    subtitle="Track sales opportunities from initial inquiry to signed client contract."
                />

                <div className="flex items-center justify-between bg-[#0a0f1d] p-4 rounded-2xl border border-white/[0.08] flex-wrap gap-4">
                    <div className="flex items-center gap-6 text-xs">
                        <div>
                            <span className="text-gray-400">Total Pipeline Value:</span>{' '}
                            <span className="font-bold text-emerald-400 font-mono text-sm">{formatINR(totalValue)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Total Leads:</span>{' '}
                            <span className="font-bold text-white">{leads.length}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalType('lead')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                        <Plus size={14} /> Add Lead
                    </button>
                </div>

                {/* 5-Stage Kanban Board */}
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {crmStages.map((stage) => {
                            const stageLeads = leads.filter(l => l.status === stage);
                            const stageTotal = stageLeads.reduce((acc, l) => acc + (parseFloat(l.value?.toString() || '0') || 0), 0);

                            const stageThemes: any = {
                                NEW: { dot: 'bg-blue-500', name: 'New Inquiries' },
                                DISCUSSION: { dot: 'bg-amber-500', name: 'Discussion / Discovery' },
                                PROPOSAL: { dot: 'bg-purple-500', name: 'Proposal Sent' },
                                WON: { dot: 'bg-emerald-500', name: 'Won (Signed)' },
                                LOST: { dot: 'bg-red-500', name: 'Closed Lost' },
                            };
                            const theme = stageThemes[stage] || stageThemes.NEW;

                            return (
                                <div key={stage} className="w-72 bg-[#0a0f1d] rounded-2xl border border-white/[0.08] p-4 flex flex-col">
                                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${theme.dot}`}></span>
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">{stage}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-gray-300">
                                                {stageLeads.length}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-mono text-gray-400 font-semibold">{formatCompactINR(stageTotal)}</span>
                                    </div>

                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                                        {stageLeads.map((lead) => (
                                            <div
                                                key={lead.id}
                                                className="bg-[#111827] hover:bg-[#162032] border border-white/[0.06] hover:border-indigo-500/30 p-4 rounded-xl transition-all shadow-sm group"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                        {lead.company || lead.name}
                                                    </h4>
                                                    <button
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                                        title="Delete Lead"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>

                                                <div className="text-[11px] text-gray-400 mb-2">
                                                    {lead.name} {lead.email ? `• ${lead.email}` : ''}
                                                </div>

                                                <div className="text-xs font-mono font-bold text-emerald-400 mb-3">
                                                    {formatINR(lead.value)}
                                                </div>

                                                {/* Stage movement actions */}
                                                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                                                    <div className="flex gap-1">
                                                        {stage !== 'NEW' && (
                                                            <button
                                                                onClick={() => handleMoveLeadStage(lead.id, lead.status, 'backward')}
                                                                className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white"
                                                                title="Move Back"
                                                            >
                                                                <ArrowLeft size={12} />
                                                            </button>
                                                        )}
                                                        {stage !== 'WON' && stage !== 'LOST' && (
                                                            <button
                                                                onClick={() => handleMoveLeadStage(lead.id, lead.status, 'forward')}
                                                                className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white"
                                                                title="Move Forward"
                                                            >
                                                                <ArrowRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {stage !== 'WON' ? (
                                                        <button
                                                            onClick={() => handleConvertWonLead(lead)}
                                                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={11} /> Convert
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                                                            Won Deal ✓
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {stageLeads.length === 0 && (
                                            <div className="text-center py-8 text-gray-600 text-xs border border-dashed border-white/[0.05] rounded-xl">
                                                No leads in {stage.toLowerCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // --- Invoices & GST Billing View (Real Database Invoices) ---
    const InvoicesView = () => {
        const filteredInvoices = invoices.filter(inv => {
            if (invoiceFilter === 'ALL') return true;
            return inv.status === invoiceFilter;
        });

        return (
            <div className="space-y-6">
                <TopNavBar
                    title="Invoices & GST Billing"
                    subtitle="Create GST invoices, track client receivables, and record incoming payments."
                />

                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setInvoiceFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    invoiceFilter === status
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            if (projects.length === 0) {
                                alert('Please create at least one Project first to generate an invoice.');
                                return;
                            }
                            setModalType('invoice');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                        <Plus size={14} /> Create GST Invoice
                    </button>
                </div>

                {invoices.length === 0 ? (
                    <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                        <FileText size={36} className="text-indigo-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">No invoices found</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                            Generate your first GST invoice for any active project.
                        </p>
                        <button
                            onClick={() => {
                                if (projects.length === 0) {
                                    alert('Please create a project first.');
                                    return;
                                }
                                setModalType('invoice');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Create Invoice
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/[0.02] text-gray-400 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                                    <tr>
                                        <th className="p-4 pl-6">Invoice ID</th>
                                        <th className="p-4">Project</th>
                                        <th className="p-4">Client</th>
                                        <th className="p-4">Base Amount</th>
                                        <th className="p-4">Total (GST 18%)</th>
                                        <th className="p-4">Due Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {filteredInvoices.map((inv) => {
                                        const baseAmt = parseFloat(inv.amount.toString()) || 0;
                                        const totalWithGST = Math.round(baseAmt * 1.18);

                                        const statusBadge = {
                                            PAID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            SENT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                            OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20',
                                            DRAFT: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                                        }[inv.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

                                        return (
                                            <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 pl-6 font-mono font-bold text-white">{inv.id.substring(0, 12)}</td>
                                                <td className="p-4 text-gray-200 font-medium">{inv.project?.name || 'Project'}</td>
                                                <td className="p-4 text-gray-400">{inv.project?.clientEmail || 'N/A'}</td>
                                                <td className="p-4 font-mono text-gray-300">{formatINR(baseAmt)}</td>
                                                <td className="p-4 font-mono font-bold text-white">{formatINR(totalWithGST)}</td>
                                                <td className="p-4 text-gray-400">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusBadge}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {inv.status !== 'PAID' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedInvoice(inv);
                                                                    setFormData({ amount: totalWithGST });
                                                                    setModalType('payment');
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold text-[10px] transition-colors"
                                                            >
                                                                Record Payment
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteInvoice(inv.id)}
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                                            title="Delete Invoice"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Tasks View (Real Database Tasks) ---
    const TasksView = () => {
        return (
            <div className="space-y-6">
                <TopNavBar
                    title="Tasks & Priorities"
                    subtitle="Organize deliverables, assign team members, and track milestone due dates."
                />

                <div className="flex justify-between items-center bg-[#0a0f1d] p-4 rounded-2xl border border-white/[0.08]">
                    <div className="text-xs text-gray-400">
                        Total Tasks: <span className="font-bold text-white">{tasks.length}</span> •
                        Completed: <span className="font-bold text-emerald-400">{tasks.filter(t => t.status === 'DONE').length}</span>
                    </div>
                    <button
                        onClick={() => {
                            if (projects.length === 0) {
                                alert('Please create a project first before creating tasks.');
                                return;
                            }
                            setModalType('task');
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                        <Plus size={14} /> Add Task
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                        <CheckSquare size={36} className="text-indigo-400 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">No tasks created yet</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                            Create project tasks to track operational deliverables and priorities.
                        </p>
                        <button
                            onClick={() => {
                                if (projects.length === 0) {
                                    alert('Please create a project first.');
                                    return;
                                }
                                setModalType('task');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                        >
                            <Plus size={16} /> Create Task
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => {
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
                                                {task.project?.name || 'Project'} • Assigned: {task.assignee || 'Unassigned'}
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
        );
    };

    // --- Loading Skeleton View ---
    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] text-gray-100 flex">
                <div className="w-72 bg-[#020617] border-r border-white/5 p-6 animate-pulse hidden md:block">
                    <div className="h-8 bg-white/[0.06] rounded-xl w-3/4 mb-8"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-10 bg-white/[0.04] rounded-xl w-full"></div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 p-8 animate-pulse space-y-6">
                    <div className="h-8 bg-white/[0.06] rounded-xl w-48 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-white/[0.04] rounded-2xl"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-white/[0.04] rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (showLanding) {
        return <LandingPage />;
    }

    return (
        <div className="min-h-screen flex text-gray-100 font-sans bg-[#030712]">
            <CommandPalette />

            <Sidebar
                user={user}
                onSignOut={handleSignOut}
                currentView={activeView}
                onViewChange={setActiveView}
                counts={{
                    projects: projects.length,
                    leads: leads.length,
                    tasks: tasks.filter(t => t.status !== 'DONE').length,
                    invoices: invoices.length,
                    approvals: operationalPriorities.pendingApprovalsCount,
                    team: team.length
                }}
            />

            <main className="flex-1 p-6 md:p-10 overflow-y-auto relative">
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

                {activeView === 'dashboard' && <DashboardOverview />}

                {activeView === 'sales_dashboard' && (
                    <SalesDashboardView
                        user={user}
                        leads={leads}
                        onRefresh={refreshAllData}
                        onViewChange={setActiveView}
                        onCreateLead={() => setModalType('lead')}
                    />
                )}

                {activeView === 'daily_tracker' && (
                    <DailyTrackerView
                        user={user}
                        onViewChange={setActiveView}
                    />
                )}

                {activeView === 'daily_reports_feed' && (
                    <DailyReportsAdminFeed
                        user={user}
                        onViewChange={setActiveView}
                    />
                )}

                {activeView === 'tech_dashboard' && (
                    <TechDashboardView
                        user={user}
                        projects={projects}
                        tasks={tasks}
                        onOpenNewProject={() => setModalType('project')}
                        onViewChange={setActiveView}
                    />
                )}

                {activeView === 'leadership_dashboard' && (
                    <LeadershipDashboardView
                        user={user}
                        projects={projects}
                        leads={leads}
                        tasks={tasks}
                        team={team}
                        onViewChange={setActiveView}
                    />
                )}

                {activeView === 'attendance' && (
                    <div className="space-y-6">
                        <TopNavBar title="Live Team Attendance" subtitle="Real-time duty monitor and check-ins across departments." />
                        <AttendanceView />
                    </div>
                )}

                {activeView === 'team_chat' && (
                    <TeamChatView
                        user={user}
                    />
                )}

                {activeView === 'projects' && (
                    <div className="space-y-6">
                        <TopNavBar title="Projects" subtitle="Active client projects, scopes of work, and team deliverables." />
                        {projects.length === 0 ? (
                            <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                                <FolderPlus size={36} className="text-indigo-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-white mb-1">No projects found</h3>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                                    Create a project to start organizing tasks, deliverables, and invoices.
                                </p>
                                <button
                                    onClick={() => setModalType('project')}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                                >
                                    <Plus size={16} /> Create Project
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((p) => (
                                    <div key={p.id} className="bg-[#0a0f1d] hover:bg-[#111827] border border-white/[0.08] hover:border-indigo-500/40 p-6 rounded-2xl transition-all shadow-md group flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleDeleteProject(p.id);
                                                    }}
                                                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                            <Link href={`/projects/${p.id}`}>
                                                <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors mb-1">{p.name}</h3>
                                            </Link>
                                            <p className="text-xs text-gray-400 mb-4">{p.clientEmail || 'No client assigned'}</p>
                                        </div>
                                        <div className="pt-3 border-t border-white/[0.06] flex justify-between text-xs text-gray-400">
                                            <span>{p.tasks?.length || 0} Tasks</span>
                                            <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'tasks' && <TasksView />}

                {activeView === 'calendar' && (
                    <div className="space-y-6">
                        <TopNavBar title="Deadlines & Calendar" subtitle="Milestone delivery dates and client approval checkpoints." />
                        <div className="p-8 bg-[#0a0f1d] rounded-2xl border border-white/[0.08]">
                            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-indigo-400" /> Upcoming Task Due Dates
                            </h3>
                            {tasks.filter(t => t.dueDate).length === 0 ? (
                                <div className="text-xs text-gray-500 text-center py-8">
                                    No task due dates scheduled. Set due dates on tasks to populate your timeline.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tasks.filter(t => t.dueDate).map(t => (
                                        <div key={t.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center justify-between text-xs">
                                            <span className="font-medium text-white">{t.title}</span>
                                            <span className="font-mono text-gray-400">{new Date(t.dueDate!).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'leads' && <LeadsView />}

                {activeView === 'contacts' && (
                    <div className="space-y-6">
                        <TopNavBar title="Clients Directory" subtitle="All professional accounts, points of contact, and client portal links." />
                        <div className="flex justify-between items-center bg-[#0a0f1d] p-4 rounded-2xl border border-white/[0.08]">
                            <span className="text-xs text-gray-400">Total Clients: <strong className="text-white">{contacts.length}</strong></span>
                            <button
                                onClick={() => setModalType('contact')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                            >
                                <Plus size={14} /> Add Client
                            </button>
                        </div>

                        {contacts.length === 0 ? (
                            <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                                <Users size={36} className="text-indigo-400 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-white mb-1">No clients found</h3>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                                    Add your client contacts or convert won opportunities from your CRM.
                                </p>
                                <button
                                    onClick={() => setModalType('contact')}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                                >
                                    <Plus size={16} /> Add Client
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white/[0.02] text-gray-400 uppercase font-bold border-b border-white/[0.06]">
                                        <tr>
                                            <th className="p-4 pl-6">Client Name</th>
                                            <th className="p-4">Company</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4 text-right pr-6">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {contacts.map((c) => (
                                            <tr key={c.id} className="hover:bg-white/[0.02]">
                                                <td className="p-4 pl-6 font-bold text-white">{c.name}</td>
                                                <td className="p-4 text-gray-300">{c.company || 'N/A'}</td>
                                                <td className="p-4 text-gray-400">{c.email}</td>
                                                <td className="p-4 text-gray-400">{c.role || 'Client'}</td>
                                                <td className="p-4 text-right pr-6">
                                                    <button
                                                        onClick={() => handleDeleteContact(c.id)}
                                                        className="text-gray-500 hover:text-red-400 p-1"
                                                        title="Delete Contact"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'finance' && (
                    isCompanyAdmin ? (
                        <InvoicesView />
                    ) : (
                        <div className="space-y-6">
                            <TopNavBar title="Invoices & Billing" subtitle="Company financials." />
                            <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-red-500/20 text-center space-y-3">
                                <ShieldCheck size={40} className="text-red-400 mx-auto" />
                                <h3 className="text-base font-bold text-white">Confidential Financials</h3>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    Company invoices, billing, and financial ledgers are restricted to Company Admin only.
                                </p>
                            </div>
                        </div>
                    )
                )}

                {activeView === 'payments' && (
                    isCompanyAdmin ? (
                        <div className="space-y-6">
                            <TopNavBar title="Payments Ledger" subtitle="Completed and reconciled client payments." />
                            <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6">
                                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                                    <CreditCard size={18} className="text-emerald-400" /> Recorded Payment History
                                </h3>
                                {invoices.filter(i => i.status === 'PAID').length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-xs">
                                        No completed payments recorded yet. Click &apos;Record Payment&apos; on any invoice to record payment.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {invoices.filter(i => i.status === 'PAID').map(inv => (
                                            <div key={inv.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="font-bold text-white">{inv.project?.name || 'Invoice Payment'}</span>
                                                    <span className="text-gray-500 ml-2 font-mono">({inv.id.substring(0, 8)})</span>
                                                </div>
                                                <span className="font-mono font-bold text-emerald-400">{formatINR(inv.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <TopNavBar title="Payments Ledger" subtitle="Company ledger." />
                            <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-red-500/20 text-center space-y-3">
                                <ShieldCheck size={40} className="text-red-400 mx-auto" />
                                <h3 className="text-base font-bold text-white">Confidential Financials</h3>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    Company payments and ledgers are confidential and restricted to Company Admin.
                                </p>
                            </div>
                        </div>
                    )
                )}

                {(activeView === 'team' || activeView === 'directory') && (() => {
                    const salesMembers = team.filter(m => (m.department || 'SALES').toUpperCase() === 'SALES');
                    const totalSalesRevenue = salesMembers.reduce((sum, m) => sum + (parseFloat(m.revenueGenerated?.toString() || '0') || 0), 0);
                    const totalDeals = salesMembers.reduce((sum, m) => sum + (m.dealsClosed || 0), 0);
                    const totalLeads = salesMembers.reduce((sum, m) => sum + (m.leadsAssigned || 0), 0);
                    const activeCount = team.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length;

                    const filteredMembers = team.filter(m => {
                        const dept = (m.department || 'SALES').toUpperCase();
                        const matchesDept = teamDepartmentFilter === 'ALL' || dept === teamDepartmentFilter;
                        const q = teamSearchQuery.toLowerCase().trim();
                        const matchesSearch = !q ||
                            m.name.toLowerCase().includes(q) ||
                            m.email.toLowerCase().includes(q) ||
                            m.role.toLowerCase().includes(q) ||
                            (m.phone && m.phone.toLowerCase().includes(q));
                        return matchesDept && matchesSearch;
                    });

                    return (
                        <div className="space-y-6">
                            <TopNavBar
                                title={isCompanyAdmin && activeView === 'team' ? "Team & Sales Workspace" : "Company Team Directory"}
                                subtitle={isCompanyAdmin && activeView === 'team' ? "Manage your agency sales force, delivery team, credentials, and workload." : "Staff directory and department contacts."}
                            />

                            {/* Sales & Team Performance Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400">Sales Force</span>
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                            <Flame size={16} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white">{salesMembers.length}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">Quota-carrying reps & SDRs</div>
                                </div>

                                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400">Pipeline Leads</span>
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                            <Target size={16} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white">{totalLeads}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">Assigned sales opportunities</div>
                                </div>

                                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400">Deals Won</span>
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white">{totalDeals}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">Closed client contracts</div>
                                </div>

                                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400">Sales Closed (INR)</span>
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                            <TrendingUp size={16} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                                        {formatCompactINR(totalSalesRevenue)}
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-1">Total revenue closed</div>
                                </div>

                                <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400">Active Staff</span>
                                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                            <Users size={16} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-extrabold text-white">{activeCount} / {team.length}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">Full agency capacity</div>
                                </div>
                            </div>

                            {/* Filter Bar & Action Header */}
                            <div className="bg-[#0a0f1d] p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Department Pills */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                                    {[
                                        { id: 'ALL', label: 'All Staff', count: team.length },
                                        { id: 'SALES', label: '🔥 Sales Team', count: team.filter(m => (m.department || 'SALES').toUpperCase() === 'SALES').length },
                                        { id: 'OPERATIONS', label: '⚡ Operations', count: team.filter(m => (m.department || '').toUpperCase() === 'OPERATIONS').length },
                                        { id: 'DEVELOPMENT', label: '💻 Tech & Dev', count: team.filter(m => (m.department || '').toUpperCase() === 'DEVELOPMENT').length },
                                        { id: 'DESIGN', label: '🎨 Creative', count: team.filter(m => (m.department || '').toUpperCase() === 'DESIGN').length },
                                    ].map(dept => (
                                        <button
                                            key={dept.id}
                                            onClick={() => setTeamDepartmentFilter(dept.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                                teamDepartmentFilter === dept.id
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                                    : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                            }`}
                                        >
                                            <span>{dept.label}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                                teamDepartmentFilter === dept.id ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-300'
                                            }`}>
                                                {dept.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Search & Add Button */}
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 md:w-56">
                                        <input
                                            type="text"
                                            placeholder="Search team or sales..."
                                            value={teamSearchQuery}
                                            onChange={(e) => setTeamSearchQuery(e.target.value)}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <Search size={14} className="absolute left-2.5 top-2 text-gray-500" />
                                    </div>

                                    {isCompanyAdmin && (
                                        <button
                                            onClick={() => {
                                                setEditingTeamMember(null);
                                                setFormData({
                                                    department: 'SALES',
                                                    role: 'Sales Lead',
                                                    status: 'ACTIVE',
                                                    leadsAssigned: 0,
                                                    dealsClosed: 0,
                                                    revenueGenerated: 0,
                                                    rating: 5.0
                                                });
                                                setModalType('team');
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
                                        >
                                            <Plus size={14} /> Add Team Member
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Team Member Cards Grid */}
                            {filteredMembers.length === 0 ? (
                                <div className="p-12 rounded-2xl bg-[#0a0f1d] border border-dashed border-white/[0.1] text-center">
                                    <UserCheck size={36} className="text-indigo-400 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-white mb-1">
                                        {teamSearchQuery ? 'No matching members found' : 'No team members in this department'}
                                    </h3>
                                    <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
                                        {teamSearchQuery
                                            ? 'Try adjusting your search criteria or filter.'
                                            : 'Add your sales reps, developers, and project managers to manage assignments and workload.'}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setEditingTeamMember(null);
                                            setFormData({
                                                department: teamDepartmentFilter !== 'ALL' ? teamDepartmentFilter : 'SALES',
                                                role: 'Sales Lead',
                                                status: 'ACTIVE',
                                                leadsAssigned: 0,
                                                dealsClosed: 0,
                                                revenueGenerated: 0
                                            });
                                            setModalType('team');
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-1.5"
                                    >
                                        <Plus size={16} /> Add Member
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMembers.map(m => {
                                        const isSales = (m.department || 'SALES').toUpperCase() === 'SALES';
                                        const deptName = (m.department || 'SALES').toUpperCase();
                                        const deptBadgeStyles: Record<string, string> = {
                                            SALES: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                                            DEVELOPMENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                                            DESIGN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                                            OPERATIONS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                                            MANAGEMENT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                        };

                                        return (
                                            <div
                                                key={m.id}
                                                className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] hover:border-indigo-500/40 transition-all shadow-md group flex flex-col justify-between relative overflow-hidden"
                                            >
                                                {/* Ambient Corner Tint */}
                                                {isSales && (
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                                                )}

                                                <div>
                                                    {/* Top Row: Avatar + Status + Edit/Delete */}
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 text-indigo-300 font-extrabold text-base flex items-center justify-center shadow-inner">
                                                                {m.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-white text-base leading-tight group-hover:text-indigo-300 transition-colors">
                                                                    {m.name}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${deptBadgeStyles[deptName] || deptBadgeStyles.SALES}`}>
                                                                        {deptName === 'SALES' ? '🔥 SALES' : deptName}
                                                                    </span>
                                                                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                                            m.status === 'ON_LEAVE' ? 'bg-gray-400' : m.status === 'INVITED' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                                                                        }`} />
                                                                        {m.status || 'Active'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions (Company Admin Only: "leadership can do all but can not access team details") */}
                                                        {isCompanyAdmin && (
                                                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditTeamMember(m)}
                                                                    className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                                                                    title="Edit Member"
                                                                >
                                                                    <Edit3 size={14} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteTeamMember(m.id, m.name)}
                                                                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                                                                    title="Remove Member"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Role Title */}
                                                    <div className="text-xs font-semibold text-gray-300 mb-3 flex items-center gap-1.5">
                                                        <Briefcase size={13} className="text-indigo-400" />
                                                        <span>{m.role}</span>
                                                    </div>

                                                    {/* Contact Chips */}
                                                    <div className="space-y-1.5 mb-4">
                                                        <a
                                                            href={`mailto:${m.email}`}
                                                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-indigo-300 transition-colors"
                                                        >
                                                            <Mail size={12} className="text-gray-500 shrink-0" />
                                                            <span className="truncate">{m.email}</span>
                                                        </a>
                                                        {m.phone && (
                                                            <div className="flex items-center justify-between text-xs text-gray-400">
                                                                <a
                                                                    href={`tel:${m.phone}`}
                                                                    className="flex items-center gap-2 hover:text-indigo-300 transition-colors"
                                                                >
                                                                    <Phone size={12} className="text-gray-500 shrink-0" />
                                                                    <span>{m.phone}</span>
                                                                </a>
                                                                <a
                                                                    href={`https://wa.me/${m.phone.replace(/\D/g, '')}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                                                                >
                                                                    <MessageSquare size={11} /> WhatsApp
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Member Login Password Visible ONLY to Admin */}
                                                    {isCompanyAdmin && (
                                                        <div className="mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <Key size={13} className="text-amber-400 shrink-0" />
                                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Password:</span>
                                                                <span className="font-mono text-indigo-300 font-bold text-xs truncate">
                                                                    {revealedPasswords[m.id] ? (m.loginPassword || 'Aalok@6290') : '••••••••'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleRevealPassword(m.id)}
                                                                    className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                                    title={revealedPasswords[m.id] ? "Hide password" : "Show password"}
                                                                >
                                                                    {revealedPasswords[m.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const pass = m.loginPassword || 'Aalok@6290';
                                                                        navigator.clipboard.writeText(pass);
                                                                        alert(`Copied password for ${m.name}: ${pass}`);
                                                                    }}
                                                                    className="p-1 rounded text-gray-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
                                                                    title="Copy password"
                                                                >
                                                                    <Copy size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Performance Metric Block */}
                                                <div>
                                                    {isSales ? (
                                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] grid grid-cols-3 gap-2 text-center mb-3">
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Leads</div>
                                                                <div className="text-sm font-extrabold text-white font-mono mt-0.5">{m.leadsAssigned || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Deals</div>
                                                                <div className="text-sm font-extrabold text-purple-400 font-mono mt-0.5">{m.dealsClosed || 0}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-gray-500 uppercase font-semibold">Revenue</div>
                                                                <div className="text-xs font-extrabold text-emerald-400 font-mono mt-0.5">
                                                                    {formatCompactINR(m.revenueGenerated || 0)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs mb-3">
                                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                                <CheckSquare size={13} className="text-indigo-400" />
                                                                <span>{m.projectsCount || 0} Projects</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-amber-400 font-bold">
                                                                <Star size={13} className="fill-amber-400 text-amber-400" />
                                                                <span>{m.rating || '5.0'}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Card Footer Quick Link */}
                                                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-400">
                                                        <button
                                                            onClick={() => setActiveView('leads')}
                                                            className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] inline-flex items-center gap-1"
                                                        >
                                                            <Target size={12} /> Assign to CRM Leads
                                                        </button>
                                                        <span className="text-[10px] text-gray-500">
                                                            {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {activeView === 'approvals' && (
                    <div className="space-y-6">
                        <TopNavBar title="Client Approvals" subtitle="Live audit log of client milestone sign-offs." />
                        <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08]">
                            <div className="text-xs text-gray-400 text-center py-6">
                                Approvals are updated in real-time when clients sign off on deliverables in their Client Portal.
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'settings' && (
                    <div className="space-y-6 max-w-3xl">
                        <TopNavBar title="Settings" subtitle="Agency branding, billing, and profile." />
                        <div className="bg-[#0a0f1d] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">User Email</label>
                                <input className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white" defaultValue={user?.email || ''} readOnly />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Subscription Plan</label>
                                <input className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white" defaultValue={user?.plan || 'FREE'} readOnly />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Dynamic Real Action Modals */}
            {modalType && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0f1d] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/[0.08]">
                            <h3 className="text-base font-bold text-white">
                                {modalType === 'payment'
                                    ? 'Record Client Payment'
                                    : modalType === 'team'
                                        ? (editingTeamMember ? 'Edit Staff Member' : 'Add Team Member / Sales Rep')
                                        : `Add ${modalType ? modalType.charAt(0).toUpperCase() + modalType.slice(1) : ''}`}
                            </h3>
                            <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={modalType === 'payment' ? handleRecordPayment : handleGenericSubmit} className="space-y-4">
                            {modalType === 'project' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Project Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Website Redesign"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Client Email</label>
                                        <input
                                            type="email"
                                            placeholder="client@company.com"
                                            value={formData.clientEmail || ''}
                                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </>
                            )}

                            {modalType === 'lead' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Contact Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Contact Name"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Company</label>
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={formData.company || ''}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Email</label>
                                        <input
                                            type="email"
                                            placeholder="contact@company.com"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Estimated Value (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="150000"
                                            value={formData.value || ''}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Pipeline Stage</label>
                                        <select
                                            value={formData.status || 'NEW'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        >
                                            <option value="NEW">NEW</option>
                                            <option value="DISCUSSION">DISCUSSION</option>
                                            <option value="PROPOSAL">PROPOSAL</option>
                                            <option value="WON">WON</option>
                                            <option value="LOST">LOST</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {modalType === 'contact' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Client Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Client Name"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Email *</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="name@company.com"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Company</label>
                                        <input
                                            type="text"
                                            placeholder="Company Name"
                                            value={formData.company || ''}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Role / Designation</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Marketing Director"
                                            value={formData.role || ''}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                </>
                            )}

                            {modalType === 'task' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Project *</label>
                                        <select
                                            required
                                            value={formData.projectId || ''}
                                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Task Title *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Task title"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Assignee</label>
                                        <input
                                            type="text"
                                            placeholder="Assignee name"
                                            value={formData.assignee || ''}
                                            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate || ''}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        />
                                    </div>
                                </>
                            )}

                            {modalType === 'invoice' && (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Project *</label>
                                        <select
                                            required
                                            value={formData.projectId || ''}
                                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Base Amount (₹) *</label>
                                        <input
                                            required
                                            type="number"
                                            placeholder="50000"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                        />
                                        <span className="text-[10px] text-gray-500 mt-1 block">
                                            18% GST (CGST 9% + SGST 9%) will be calculated on tax invoice.
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate || ''}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        />
                                    </div>
                                </>
                            )}

                            {modalType === 'team' && (
                                <>
                                    {/* Department Selector */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1.5 font-semibold">Department *</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'SALES', label: '🔥 Sales Team' },
                                                { id: 'OPERATIONS', label: '⚡ Operations' },
                                                { id: 'DEVELOPMENT', label: '💻 Tech / Dev' },
                                                { id: 'DESIGN', label: '🎨 Creative' },
                                                { id: 'MANAGEMENT', label: '👑 Leadership' },
                                            ].map(d => (
                                                <button
                                                    type="button"
                                                    key={d.id}
                                                    onClick={() => setFormData({ ...formData, department: d.id })}
                                                    className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                                                        (formData.department || 'SALES') === d.id
                                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                                            : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.06]'
                                                    }`}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Full Name *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Rahul Sharma"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Role Title *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder={(formData.department || 'SALES') === 'SALES' ? 'e.g. Senior Account Executive' : 'e.g. Lead Full Stack Engineer'}
                                            value={formData.role || ''}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                        />
                                        {/* Quick Role Suggestions */}
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {((formData.department || 'SALES') === 'SALES'
                                                ? ['Sales Lead', 'Account Executive', 'SDR', 'BDM']
                                                : ['Project Manager', 'UI/UX Designer', 'Developer', 'Lead']
                                            ).map(preset => (
                                                <button
                                                    type="button"
                                                    key={preset}
                                                    onClick={() => setFormData({ ...formData, role: preset })}
                                                    className="text-[10px] bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white px-2 py-0.5 rounded-lg border border-white/5 transition-colors"
                                                >
                                                    + {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Work Email (Login ID) *</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="rep@agency.com"
                                                value={formData.email || ''}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Phone / WhatsApp</label>
                                            <input
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={formData.phone || ''}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                                <ShieldCheck size={14} className="text-indigo-400" />
                                                <span>Member Login Password *</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const randomPass = 'Team@' + Math.floor(1000 + Math.random() * 9000);
                                                    setFormData({ ...formData, password: randomPass });
                                                }}
                                                className="text-[10px] text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-0.5 rounded border border-indigo-500/30 transition-colors"
                                            >
                                                + Generate Password
                                            </button>
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Sales@2026!"
                                            value={formData.password || ''}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-400"
                                        />
                                        <p className="text-[10px] text-gray-400">
                                            Admin sets &amp; views credentials. The team member logs in at <span className="text-indigo-300 font-mono">/login</span> with this email and password.
                                        </p>
                                    </div>

                                    {/* Sales Performance Inputs (if Sales department) */}
                                    {(formData.department || 'SALES') === 'SALES' && (
                                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                                            <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                                <Flame size={12} /> Sales Pipeline & Quota Setup
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-gray-400 block mb-0.5">Leads Assigned</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.leadsAssigned ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, leadsAssigned: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 block mb-0.5">Deals Closed</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.dealsClosed ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, dealsClosed: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 block mb-0.5">Revenue Won (₹)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.revenueGenerated ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, revenueGenerated: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Selector */}
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Status</label>
                                        <select
                                            value={formData.status || 'ACTIVE'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        >
                                            <option value="ACTIVE">ACTIVE (On Duty)</option>
                                            <option value="INVITED">INVITED (Onboarding)</option>
                                            <option value="ON_LEAVE">ON_LEAVE (Temporary)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {modalType === 'payment' && (
                                <>
                                    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs">
                                        <div className="text-gray-400">Invoice: <span className="text-white font-mono font-bold">{selectedInvoice?.id?.substring(0, 12)}</span></div>
                                        <div className="text-gray-400 mt-1">Amount Due: <span className="text-emerald-400 font-mono font-bold">{formatINR(selectedInvoice?.amount || 0)}</span></div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Payment Method</label>
                                        <select
                                            value={formData.method || 'UPI'}
                                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                            className="w-full bg-[#111827] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white"
                                        >
                                            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                                            <option value="NEFT">Bank Transfer (NEFT / RTGS / IMPS)</option>
                                            <option value="STRIPE">Credit / Debit Card</option>
                                            <option value="CASH">Cash / Cheque</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalType(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                                >
                                    {submitting
                                        ? 'Saving...'
                                        : modalType === 'team'
                                            ? (editingTeamMember ? 'Update Member' : (formData.department === 'SALES' ? 'Add Sales Rep' : 'Add Team Member'))
                                            : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
