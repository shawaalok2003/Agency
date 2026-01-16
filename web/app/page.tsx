'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import { LinearRegression } from '@/src/utils/ml';
import {
    LayoutGrid, Plus, DollarSign, Users, Briefcase, Activity, Target,
    Search, MoreHorizontal, Phone, Mail, Calendar, UserPlus, CreditCard, ChevronRight, CheckCircle, FileText,
    Star, Link as LinkIcon, Image, Share2, Code, Info, Zap
} from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import LandingPage from '@/app/components/LandingPage';
import OnboardingTour from '@/app/components/OnboardingTour';

// --- Types ---
interface Scope { price: number; }
interface Invoice { id: string; amount: string; status: 'DRAFT' | 'SENT' | 'PAID'; }
interface Project {
    id: string;
    name: string;
    clientEmail?: string;
    updatedAt: string;
    invoices: Invoice[];
    scopes: Scope[];
}
interface User {
    id: string;
    email: string;
    plan: 'FREE' | 'PRO';
    trialEndsAt: string | null;
}

interface Lead {
    id: string;
    name: string;
    company: string;
    value: string; // comes as string from decimal
    status: 'NEW' | 'DISCUSSION' | 'PROPOSAL' | 'WON' | 'LOST';
    ownerId: string;
}

interface Contact {
    id: string;
    name: string;
    role: string;
    company: string;
    email: string;
    type: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    projectsCount: number;
    rating: string;
}

// --- Components ---

// NavItem component removed as it is now in Sidebar.tsx

// --- Page Component ---

export default function Dashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [showLanding, setShowLanding] = useState(false);

    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);

    const [user, setUser] = useState<User | null>(null);

    // Modal State
    const [modalType, setModalType] = useState<'project' | 'lead' | 'contact' | 'team' | null>(null);
    const [formData, setFormData] = useState<any>({});

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeProjects: 0,
        pendingInvoices: 0,
        totalClients: 0
    });

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const checkAuthAndFetch = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token, show landing page instead of redirecting
                setShowLanding(true);
                setLoading(false);
                return;
            }
            // Fetch User Profile First
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);

            await refreshAllData();
        } catch (err: any) {
            console.error(err);
            if (err.message === 'Network Error') {
                alert('Back-end server is unreachable. Please ensure the server is running.');
                return;
            }
            // If auth fails, strip token and show landing
            localStorage.removeItem('token');
            setShowLanding(true);
            setLoading(false);
        }
    };



    const refreshAllData = async () => {
        setLoading(true);
        try {
            const [projRes, leadRes, contRes, teamRes] = await Promise.all([
                api.get('/projects').catch(() => ({ data: [] })),
                api.get('/leads').catch(() => ({ data: [] })),
                api.get('/contacts').catch(() => ({ data: [] })),
                api.get('/team').catch(() => ({ data: [] }))
            ]);

            setProjects(projRes.data);
            setLeads(leadRes.data);
            setContacts(contRes.data);
            setTeam(teamRes.data);

            calculateStats(projRes.data);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Project[]) => {
        let revenue = 0;
        let pending = 0;
        const clients = new Set();
        data.forEach(p => {
            if (p.clientEmail) clients.add(p.clientEmail);
            p.invoices?.forEach(inv => {
                const amount = parseFloat(inv.amount);
                inv.status === 'PAID' ? revenue += amount : pending += amount;
            });
        });
        setStats({
            totalRevenue: revenue,
            activeProjects: data.length,
            pendingInvoices: pending,
            totalClients: clients.size
        });
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    // Helper to remove empty strings which break Zod validation
    const cleanPayload = (data: any) => {
        const cleaned: any = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== '' && data[key] !== undefined) {
                cleaned[key] = data[key];
            }
        });
        return cleaned;
    };

    // Add to api/client.ts logic equivalent (in page.tsx useEffect for now or just trust manual signout)

    // Enhanced Submit with Feedback
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        try {
            const cleaned = cleanPayload(formData);

            if (modalType === 'project') {
                await api.post('/projects', cleaned);
            } else if (modalType === 'lead') {
                const payload = { ...cleaned };
                if (payload.value) payload.value = parseFloat(payload.value);
                await api.post('/leads', payload);
            } else if (modalType === 'contact') {
                await api.post('/contacts', cleaned);
            } else if (modalType === 'team') {
                await api.post('/team', cleaned);
            }

            setSuccessMsg('Saved successfully!');
            setTimeout(() => {
                setModalType(null);
                setFormData({});
                setSuccessMsg('');
                refreshAllData();
            }, 1000);

        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                alert('Session expired. Please sign in again.');
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }
            const msg = err.response?.data?.error?.issues?.[0]?.message ||
                err.response?.data?.error ||
                err.message;
            alert(`Failed to save: ${msg}`);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleWinLead = async (leadId: string, leadName: string) => {
        const email = prompt(`Winning Lead: ${leadName}\n\nPlease enter the Client's Email to create the Project:`);
        if (!email) return;

        try {
            await api.post(`/leads/${leadId}/win`, {
                clientEmail: email,
                projectName: leadName
            });
            alert('Lead Won! Project created successfully.');
            refreshAllData();
        } catch (err: any) {
            console.error(err);
            alert(`Failed to win lead: ${err.response?.data?.error || err.message}`);
        }
    };

    // --- Views ---

    // --- Views ---

    const StatsCard = ({ icon: Icon, label, value, sub, color }: any) => {
        const colors: any = {
            emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
            amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
        };
        const theme = colors[color] || colors.blue;

        return (
            <div className="bg-[#0f111a] border border-gray-800 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${theme.bg} ${theme.text}`}>
                        <Icon size={24} />
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full border border-emerald-500/20">
                        +12.5%
                    </span>
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">{label}</div>
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
            </div>
        );
    };

    const DashboardView = () => (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] text-gray-300 font-medium border border-gray-700 hover:bg-gray-700 transition-colors">
                        <Calendar size={18} />
                        Last 30 days
                    </button>
                    <button
                        onClick={() => {
                            const isTrialActive = user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();
                            const isPro = user?.plan === 'PRO';
                            if (!isPro && !isTrialActive && projects.length >= 3) {
                                alert('Free Plan Limit Reached (3 Projects). Please Upgrade.');
                                return;
                            }
                            setModalType('project');
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus size={20} /> New Project
                    </button>
                </div>
            </header>


            {/* Promotion Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-10 mb-10 shadow-2xl shadow-indigo-900/20">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold text-white mb-2">Experience the full power of Agency OS</h2>
                        <p className="text-indigo-100 text-lg opacity-90">
                            You have 5 days remaining in your premium trial. Unlock unlimited projects, custom subdomains, and advanced analytics for your whole team.
                        </p>
                    </div>
                    <button
                        onClick={async () => {
                            if (confirm("Confirm upgrade to PRO plan? This will unlock unlimited projects.")) {
                                try {
                                    await api.post('/auth/upgrade');
                                    alert("Successfully upgraded to PRO!");
                                    window.location.reload();
                                } catch (e) {
                                    alert("Upgrade failed. Please try again.");
                                }
                            }
                        }}
                        className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-xl shrink-0"
                    >
                        Upgrade Now
                    </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatsCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="emerald" />
                <StatsCard icon={Activity} label="Pending Invoices" value={stats.pendingInvoices.toLocaleString()} color="amber" />
                <StatsCard icon={Briefcase} label="Active Projects" value={stats.activeProjects} color="blue" />
                <StatsCard icon={Users} label="Total Clients" value={stats.totalClients} color="purple" />
            </div>

            {/* Recent Projects Section */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                <button className="text-indigo-400 font-medium hover:text-indigo-300 text-sm">View all</button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 bg-[#0f111a] rounded-2xl border border-dashed border-gray-800">
                    <h3 className="text-gray-400">No projects found. Create one to get started.</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.slice(0, 3).map((project, idx) => {
                        const projectValue = project.scopes?.[0]?.price || 0;
                        // Mocking status/avatars to match visual design if not present
                        const status = idx === 2 ? 'Review' : 'Active';
                        const statusColor = status === 'Active' ? 'text-emerald-400' : 'text-gray-400';
                        const statusDot = status === 'Active' ? 'bg-emerald-500' : 'bg-gray-500';

                        const initials = project.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                        // Mocking random avatars
                        const avatars = [
                            { char: 'JD', color: 'bg-slate-700' },
                            { char: 'AS', color: 'bg-slate-600' }
                        ];

                        return (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <div className="group bg-[#0f111a] hover:bg-[#161b2e] border border-gray-800 p-6 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 h-full flex flex-col justify-between">

                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                                {initials}
                                            </div>
                                            <div className={`flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor} border border-gray-700`}>
                                                <div className={`w-2 h-2 rounded-full ${statusDot}`}></div>
                                                {status}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg text-white mb-1 group-hover:text-indigo-200 transition-colors">{project.name}</h3>
                                        <p className="text-gray-500 text-sm mb-8">
                                            {project.clientEmail || 'Web Development & Branding'}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-gray-800 pt-5">
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Contract Value</div>
                                            <div className="text-white font-bold font-mono">
                                                ${parseFloat(projectValue.toString()).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {avatars.map((av, i) => (
                                                <div key={i} className={`w-8 h-8 rounded-full ${av.color} border-2 border-[#0f111a] flex items-center justify-center text-[10px] text-white font-medium`}>
                                                    {av.char}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const LeadsView = () => {
        // Calculate dynamic stats
        const totalValue = leads.reduce((acc, lead) => acc + (parseFloat(lead.value) || 0), 0);
        const conversionRate = leads.length > 0 ? Math.round((leads.filter(l => l.status === 'WON').length / leads.length) * 100) : 0;

        return (
            <div className="h-full flex flex-col bg-[#030712] -m-8 p-8"> {/* Full screen override style */}
                {/* Top Navigation Bar - Matching Screenshot */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <LayoutGrid size={16} className="text-white" />
                            </div>
                            <span className="font-bold text-white text-lg tracking-tight">Agency OS</span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search leads..."
                                className="bg-[#111827] border border-gray-800 text-gray-300 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <nav className="flex items-center gap-6 text-sm font-medium text-gray-400">
                            <a href="#" className="hover:text-white transition-colors">Dashboard</a>
                            <a href="#" className="text-white border-b-2 border-indigo-500 pb-0.5">Leads</a>
                            <a href="#" className="hover:text-white transition-colors">Deals</a>
                            <a href="#" className="hover:text-white transition-colors">Tasks</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setModalType('lead')}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                <Plus size={16} /> Add Lead
                            </button>
                            {user && (
                                <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-[#1f2937] flex items-center justify-center overflow-hidden">
                                    <span className="text-amber-800 font-bold text-xs">
                                        {(user.email || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Title & Actions */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Leads Pipeline</h1>
                        <p className="text-gray-500">Manage your sales opportunities and track progress across stages.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                            <Briefcase size={16} /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#111827] border border-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                            <MoreHorizontal size={16} /> Sort
                        </button>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex gap-6 h-full min-w-max">
                        {['NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST'].map((status) => {
                            const filteredLeads = leads.filter(l => l.status === status);
                            if (status === 'LOST' && filteredLeads.length === 0) return null;

                            const statusColors: any = {
                                NEW: { dot: 'bg-blue-500', text: 'text-gray-300' },
                                DISCUSSION: { dot: 'bg-amber-500', text: 'text-gray-300' },
                                PROPOSAL: { dot: 'bg-purple-500', text: 'text-gray-300' },
                                WON: { dot: 'bg-emerald-500', text: 'text-gray-300' },
                                LOST: { dot: 'bg-red-500', text: 'text-gray-300' },
                            };
                            const theme = statusColors[status] || statusColors.NEW;

                            return (
                                <div key={status} className="w-[320px] flex flex-col shrink-0">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${theme.dot}`}></div>
                                            <span className={`text-xs font-bold tracking-widest uppercase ${theme.text}`}>{status}</span>
                                            <span className="bg-[#1f2937] text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {filteredLeads.length}
                                            </span>
                                        </div>
                                        <button className="text-gray-600 hover:text-gray-400">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>

                                    {/* Cards */}
                                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                                        {filteredLeads.map(lead => (
                                            <div
                                                key={lead.id}
                                                className="group bg-[#0f111a] hover:bg-[#161b2e] border border-gray-800 p-5 rounded-xl cursor-pointer transition-all hover:border-gray-700 hover:shadow-lg relative"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`p-2 rounded-lg ${status === 'NEW' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                        {status === 'NEW' ? <LayoutGrid size={16} /> : <Briefcase size={16} />}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 font-medium">2d ago</span>
                                                </div>

                                                <h4 className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                                    {lead.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-4">{lead.company}</p>

                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="text-emerald-400 font-bold font-mono text-sm">
                                                        ${parseFloat(lead.value).toLocaleString()}
                                                    </span>

                                                    {status !== 'WON' && (
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleWinLead(lead.id, lead.name); }}
                                                                className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md hover:bg-emerald-500 hover:text-white transition-colors"
                                                                title="Mark as Won"
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {status === 'WON' && (
                                                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-300 font-bold">
                                                            {(user?.email || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="grid grid-cols-4 gap-8 border-t border-gray-800 pt-4 mt-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value:</span>
                        <span className="text-emerald-400 font-bold font-mono">${totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conversion Rate:</span>
                        <span className="text-indigo-400 font-bold font-mono">{conversionRate}%</span>
                    </div>
                    <div className="col-span-2 flex justify-end items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Projects</span>
                        </div>
                        <span className="text-white font-bold">{projects.length}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-l border-gray-700 pl-6">12 New Inquiries Today</span>
                    </div>
                </div>
            </div>
        );
    };

    const FinanceView = () => {
        const [monthlyExpenses, setMonthlyExpenses] = useState(5000);
        const [revenueGoal, setRevenueGoal] = useState(20000);

        // --- ML PREDICTION LOGIC ---
        // Mock Historical Data (Last 6 months)
        const historicalData = [
            { x: 1, y: 12000 }, // Month 1
            { x: 2, y: 13500 }, // Month 2
            { x: 3, y: 12800 }, // Month 3
            { x: 4, y: 15400 }, // Month 4
            { x: 5, y: 14900 }, // Month 5
            { x: 6, y: 17200 }, // Month 6 (Current)
        ];

        // Train Model
        const model = useMemo(() => new LinearRegression(historicalData), []);
        const predictionDetails = model.getDetails();

        // Forecast
        const nextMonthPrediction = model.predict(7); // Predict Month 7
        const yearEndPrediction = model.predict(12); // Predict Month 12
        const trendDirection = predictionDetails.slope > 0 ? 'Growing 📈' : 'Declining 📉';
        // ---------------------------

        // Calculate dynamic values
        const currentRevenue = stats.totalRevenue; // Use actual revenue from stats
        const netProfit = currentRevenue - monthlyExpenses;
        const profitMargin = currentRevenue > 0 ? ((netProfit / currentRevenue) * 100).toFixed(1) : "0";
        const runway = '6 Months'; // Mock logic

        return (
            <div className="space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white mb-2">Finance Hub</h1>
                    <p className="text-gray-400">Monthly Business Calculator & Financial Planning.</p>
                </header>

                {/* Calculator Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Inputs Card */}
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Activity size={20} className="text-indigo-400" /> Parameters
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Est. Monthly Expenses</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={monthlyExpenses}
                                        onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Revenue Goal</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={revenueGoal}
                                        onChange={(e) => setRevenueGoal(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="text-gray-400">Current Revenue</span>
                                <span className="text-white font-medium">${currentRevenue.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((currentRevenue / revenueGoal) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-xs text-indigo-300 mt-1">
                                {((currentRevenue / revenueGoal) * 100).toFixed(0)}% of Goal
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    <div className="glass p-6 rounded-2xl border border-white/5 lg:col-span-2 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="grid grid-cols-2 gap-8 relative z-10">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Net Profit</p>
                                <h2 className={`text-5xl font-bold tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ${netProfit.toLocaleString()}
                                </h2>
                                <p className="text-sm text-gray-500 mt-2">Revenue - Expenses</p>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Profit Margin</p>
                                <h2 className="text-5xl font-bold tracking-tight text-white">
                                    {profitMargin}%
                                </h2>
                                <p className="text-sm text-gray-500 mt-2">Health Score: {parseFloat(profitMargin) > 20 ? 'Healthy 🚀' : 'Needs Optimization ⚠️'}</p>
                            </div>
                        </div>

                        <div>
                            <div className="text-2xl font-bold text-emerald-300">${(netProfit * 12).toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Est. Annual Profit</div>
                        </div>
                    </div>
                </div>

                {/* Predictive Analytics Card (New) */}
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target size={20} className="text-pink-400" /> Revenue Forecast (AI)
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="text-xs text-gray-400 mb-1">Next Month Projection</div>
                            <div className="text-2xl font-bold text-white relative z-10">
                                ${nextMonthPrediction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                Based on {trendDirection} trend
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-400 mb-1">Year End Forecast</div>
                                <div className="text-lg font-bold text-gray-200">
                                    ${yearEndPrediction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-400 mb-1">Confidence Score</div>
                                <div className="text-lg font-bold text-gray-200">
                                    {(predictionDetails.rSquared * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] text-gray-500 font-mono mt-2 text-center">
                            Algorithm: Linear Regression (OLS)
                            <br />
                            Model: {predictionDetails.formula}
                        </div>
                    </div>
                </div>
            </div>

        );
    };

    const ContactsView = () => (
        <div className="h-full flex flex-col bg-[#030712] -m-8 p-8 font-sans">
            {/* Top Header matching screenshot */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <LayoutGrid size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-white text-lg tracking-tight">Agency OS</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 bg-[#1f2937] hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition-colors relative">
                        <div className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#1f2937]"></div>
                        {/* Using a Bell icon if available, otherwise generic */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    </button>
                    <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-white">{(user?.email || 'User').split('@')[0]}</div>
                            <div className="text-[10px] text-gray-500 font-medium">Admin</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#fce7f3] border-2 border-[#1f2937] overflow-hidden">
                            {/* Mock Avatar Image or Initials */}
                            <div className="w-full h-full flex items-center justify-center text-pink-600 font-bold">
                                {(user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Page Title Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Contacts Directory</h1>
                    <p className="text-gray-500">Manage your clients and professional relationships across all accounts.</p>
                </div>
                <button
                    onClick={() => setModalType('contact')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus size={18} /> Add Contact
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#0f111a] p-2 rounded-2xl border border-gray-800 flex items-center justify-between mb-8">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or company..."
                        className="w-full bg-transparent text-gray-300 text-sm placeholder-gray-600 pl-12 pr-4 py-3 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 pr-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-gray-700">
                        <Briefcase size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-gray-700">
                        <FileText size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="flex-1 bg-[#0f111a] rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#161b2e] text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                            <tr>
                                <th className="p-5 pl-6">Name</th>
                                <th className="p-5">Role</th>
                                <th className="p-5">Company</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Type</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {contacts.map((contact, idx) => {
                                // Mock random meta data for display
                                const metaTime = ['Joined 2 days ago', 'Active now', 'Contacted June 12', 'Pending reply', 'Newly assigned'][idx % 5];
                                const typeColor = contact.type === 'Client' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    contact.type === 'Partner' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20';

                                return (
                                    <tr key={contact.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-pink-600'][idx % 5]
                                                    }`}>
                                                    {contact.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{contact.name}</div>
                                                    <div className="text-[11px] text-gray-500 font-medium">{metaTime}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300 font-medium">{contact.role || 'N/A'}</td>
                                        <td className="p-4 text-sm text-gray-300 font-medium">{contact.company || 'N/A'}</td>
                                        <td className="p-4 text-sm text-gray-400">{contact.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border ${typeColor}`}>
                                                {contact.type || 'LEAD'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="text-gray-500 text-sm mb-2">No contacts found</div>
                                        <button onClick={() => setModalType('contact')} className="text-indigo-400 text-sm hover:text-indigo-300 font-medium">Add your first contact</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="mt-auto p-4 border-t border-gray-800 flex justify-between items-center bg-[#0f111a]">
                    <div className="text-xs text-gray-500 font-medium ml-2">
                        Showing <span className="text-white font-bold">1-{contacts.length}</span> of <span className="text-white font-bold">{contacts.length}</span> contacts
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1f2937] text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                            <ChevronRight size={14} className="rotate-180" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-bold text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-gray-400 text-xs font-medium transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-gray-400 text-xs font-medium transition-colors">3</button>
                        <span className="text-gray-600 text-xs">...</span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1f2937] text-gray-400 text-xs font-medium transition-colors">25</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1f2937] text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const TeamView = () => (
        <div className="h-full flex flex-col bg-[#030712] -m-8 p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-1.5 rounded-lg">
                        <Zap size={18} className="text-white bg-transparent" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight leading-none">Agency OS</h1>
                        <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Internal Management</span>
                    </div>
                </div>

                {/* Right Side Header Controls */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block mr-4">
                        <div className="text-sm font-bold text-white">James Wilson</div>
                        <div className="text-[10px] text-gray-500 font-medium">Admin Account</div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-[#fce7f3] border-2 border-[#1f2937] flex items-center justify-center text-pink-600 font-bold overflow-hidden">
                        J
                    </div>
                </div>
            </header>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Team Directory</h1>
                    <p className="text-gray-500">Managing {team.length || 24} team members across {projects.length || 8} active projects.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input className="bg-[#0f111a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 w-64 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Search members..." />
                    </div>
                    <button
                        onClick={() => setModalType('team')}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Member
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'TOTAL STAFF', value: '24', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'ACTIVE NOW', value: '18', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'AVG. RATING', value: '4.85', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'OPEN ROLES', value: '2', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#0f111a] border border-gray-800 p-5 rounded-2xl flex items-center gap-4 hover:border-gray-700 transition-all cursor-default">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">{stat.label}</div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member, idx) => (
                    <div key={member.id} className="bg-[#0f111a] p-8 rounded-3xl border border-gray-800 text-center relative group hover:border-indigo-500/30 hover:-translate-y-1 transition-all">
                        <div className="w-24 h-24 rounded-full p-1 border-2 border-indigo-500/20 mx-auto mb-5 relative group-hover:border-indigo-500 transition-colors">
                            <div className="w-full h-full rounded-full bg-gradient-to-b from-gray-700 to-gray-800 overflow-hidden flex items-center justify-center">
                                {/* If we had real images we'd use 'next/image' here. For now initials. */}
                                <span className="text-3xl font-bold text-white/20">{member.name.charAt(0)}</span>
                            </div>
                            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-[#0f111a] ${idx % 3 === 0 ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                        <p className="text-indigo-400 font-medium text-sm mb-6 pb-6 border-b border-gray-800">{member.role}</p>

                        <div className="flex justify-center gap-4 mb-8">
                            <button className="p-2.5 bg-[#161b2e] text-gray-400 rounded-xl hover:bg-gray-700 hover:text-white transition-colors">
                                <Mail size={16} />
                            </button>
                            <button className="p-2.5 bg-[#161b2e] text-gray-400 rounded-xl hover:bg-gray-700 hover:text-white transition-colors">
                                <Phone size={16} />
                            </button>
                            <button className="p-2.5 bg-[#161b2e] text-gray-400 rounded-xl hover:bg-gray-700 hover:text-white transition-colors">
                                {idx % 2 === 0 ? <LinkIcon size={16} /> : <Share2 size={16} />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-6">
                            <div className="text-left pl-4 border-r border-gray-800">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">PROJECTS</div>
                                <div className="text-lg font-bold text-white">{member.projectsCount} Total</div>
                            </div>
                            <div className="text-right pr-4">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">RATING</div>
                                <div className="text-lg font-bold text-white flex items-center justify-end gap-1">
                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                    {parseFloat(member.rating).toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Fallback if no team members */}
                {team.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-[#0f111a]">
                        <p className="text-gray-500">No team members found.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const ProjectsView = () => (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-gray-400">Manage your active work and deliverables.</p>
                </div>
                <button
                    onClick={() => setModalType('project')}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    New Project
                </button>
            </header>

            {projects.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <h3 className="text-gray-300">No projects found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                        const projectValue = project.scopes?.[0]?.price || 0;
                        return (
                            <Link key={project.id} href={`/projects/${project.id}`}>
                                <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer block h-full group hover:-translate-y-1 border border-white/5 hover:border-indigo-500/30 relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                            {project.name.charAt(0)}
                                        </div>
                                        {projectValue > 0 && (
                                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                                                ${parseFloat(projectValue.toString()).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-xl text-white mb-1 group-hover:text-indigo-300 transition-colors truncate">{project.name}</h3>
                                    <p className="text-sm text-gray-400 mb-6 truncate">{project.clientEmail || 'No client assigned'}</p>

                                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-4">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                        </span>
                                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const SettingsView = () => (
        <div className="max-w-2xl bg-[#0f111a] p-8 rounded-2xl border border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">Profile Information</h3>
                    <p className="text-gray-400 text-sm mb-4">Update your account details and profile.</p>
                    <div className="grid gap-4">
                        <input className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="Display Name" defaultValue={user?.email?.split('@')[0]} />
                        <input className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="Email Address" defaultValue={user?.email} readOnly />
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-800">
                    <h3 className="text-lg font-medium text-white mb-2">Appearance</h3>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Dark Mode</button>
                        <button className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-700">Light Mode</button>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200">Save Changes</button>
            </div>
        </div>
    );

    if (showLanding) {
        return <LandingPage />;
    }

    return (
        <div className="min-h-screen flex text-gray-100 font-sans">
            {/* Sidebar */}
            <Sidebar
                user={user}
                onSignOut={handleSignOut}
                currentView={activeView}
                onViewChange={setActiveView}
            />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto relative">
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

                {activeView === 'dashboard' && <DashboardView />}
                {activeView === 'projects' && <ProjectsView />}
                {activeView === 'finance' && <FinanceView />}
                {activeView === 'leads' && <LeadsView />}
                {activeView === 'contacts' && <ContactsView />}
                {activeView === 'team' && <TeamView />}
                {activeView === 'settings' && <SettingsView />}
            </main>

            {/* Dynamic Modal */}
            {modalType && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl relative">
                        <h2 className="text-2xl font-bold text-white mb-6 capitalize">Add {modalType}</h2>
                        {successMsg && (
                            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm text-center font-medium animate-pulse">
                                {successMsg}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* PROJECT FIELDS */}
                            {modalType === 'project' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Project Name</label>
                                        <input
                                            autoFocus
                                            value={formData.name || ''}
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Client Email</label>
                                        <input
                                            value={formData.clientEmail || ''}
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('clientEmail', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* LEAD FIELDS */}
                            {modalType === 'lead' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Lead Name</label>
                                        <input
                                            autoFocus
                                            value={formData.name || ''}
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Company</label>
                                        <input
                                            value={formData.company || ''}
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('company', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Estimated Value ($)</label>
                                        <input
                                            value={formData.value || ''}
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('value', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Status</label>
                                        <select
                                            value={formData.status || 'NEW'}
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('status', e.target.value)}
                                        >
                                            <option value="NEW" className="bg-gray-900">New</option>
                                            <option value="DISCUSSION" className="bg-gray-900">Discussion</option>
                                            <option value="PROPOSAL" className="bg-gray-900">Proposal</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* CONTACT FIELDS */}
                            {modalType === 'contact' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Full Name</label>
                                        <input
                                            autoFocus
                                            value={formData.name || ''}
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Email Address</label>
                                        <input
                                            value={formData.email || ''}
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Role / Job Title</label>
                                        <input
                                            value={formData.role || ''}
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('role', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Company</label>
                                        <input
                                            value={formData.company || ''}
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('company', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* TEAM FIELDS */}
                            {modalType === 'team' && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Name</label>
                                        <input
                                            autoFocus
                                            value={formData.name || ''}
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Email</label>
                                        <input
                                            value={formData.email || ''}
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('email', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300">Role</label>
                                        <input
                                            value={formData.role || ''}
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-2 rounded text-white outline-none focus:border-indigo-500 transition-colors"
                                            onChange={e => handleInputChange('role', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => { setModalType(null); setFormData({}); }} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Onboarding Tour */}
            <OnboardingTour userId={user?.id} />
        </div>
    );
}
