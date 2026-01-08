'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import {
    LayoutGrid, Plus, DollarSign, Users, Briefcase, Activity,
    Target, CreditCard, ChevronRight, Search,
    MoreHorizontal, Phone, Mail, Calendar, UserPlus
} from 'lucide-react';

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

const NavItem = ({ active, icon: Icon, label, onClick }: any) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium cursor-pointer transition-all group ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} />
        <span>{label}</span>
        {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </div>
);

// --- Page Component ---

export default function Dashboard() {
    const router = useRouter();
    const [activeView, setActiveView] = useState('dashboard');
    const [loading, setLoading] = useState(true);

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
                router.push('/login');
                return;
            }
            // Fetch User Profile First
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);

            await refreshAllData();
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            router.push('/login');
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

    const DashboardView = () => (
        <>
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
                    <p className="text-gray-400">Welcome back, here's the pulse of your agency.</p>
                </div>
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
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> New Project
                </button>
            </header>


            {/* Dynamic Plan Banner */}
            {user && (() => {
                const getTrialDaysLeft = () => {
                    if (!user?.trialEndsAt) return 0;
                    const end = new Date(user.trialEndsAt);
                    const now = new Date();
                    const diff = end.getTime() - now.getTime();
                    return Math.ceil(diff / (1000 * 3600 * 24));
                };
                const isTrialActive = user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();
                const isPro = user?.plan === 'PRO';
                const trialDays = getTrialDaysLeft();

                return (
                    <div className={`bg-gradient-to-r ${isPro || isTrialActive ? 'from-indigo-900/50 to-purple-900/50 border-indigo-500/30' : 'from-gray-800 to-gray-900 border-gray-700'} border rounded-xl p-4 mb-8 flex justify-between items-center relative overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 opacity-20 pointer-events-none"></div>
                        <div className="flex items-center gap-4 z-10">
                            <div className={`w-10 h-10 rounded-full ${isPro || isTrialActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-700 text-gray-400'} flex items-center justify-center`}>
                                <Target size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">
                                    {isPro ? 'Pro Plan Active' : (isTrialActive ? 'Pro Trial Active' : 'Free Plan')}
                                </h3>
                                <p className={`text-sm ${isPro || isTrialActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {isPro ? 'You have full access.' : (isTrialActive ? `You have unlimited access for ${trialDays} more days.` : 'Upgrade to remove limits.')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 z-10">
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-400">Project Limit</div>
                                <div className="text-white font-bold">
                                    {projects.length} / <span className={isPro || isTrialActive ? "text-emerald-400" : "text-amber-400"}>
                                        {isPro || isTrialActive ? 'Unlimited' : '3'}
                                    </span>
                                </div>
                            </div>
                            {(!isPro) && (
                                <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                                    Upgrade Now
                                </button>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatsCard icon={DollarSign} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} sub="+12% from last month" color="emerald" />
                <StatsCard icon={Activity} label="Pending Invoice" value={`$${stats.pendingInvoices.toLocaleString()}`} sub="Waiting for payment" color="amber" />
                <StatsCard icon={Briefcase} label="Active Projects" value={stats.activeProjects} sub="Currently in progress" color="blue" />
                <StatsCard icon={Users} label="Total Clients" value={stats.totalClients} sub="Active relationships" color="purple" />
            </div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                Recent Projects <div className="h-px bg-white/10 flex-1 ml-4"></div>
            </h2>

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
        </>
    );

    const LeadsView = () => (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
                    <p className="text-gray-400">Track and manage potential new business.</p>
                </div>
                <button
                    onClick={() => setModalType('lead')}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    Add Lead
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                {['NEW', 'DISCUSSION', 'PROPOSAL', 'WON', 'LOST'].map((status) => {
                    const filteredLeads = leads.filter(l => l.status === status);
                    if (status === 'LOST' && filteredLeads.length === 0) return null; // Hide lost if empty

                    return (
                        <div key={status} className="glass rounded-xl p-4 border border-white/5 h-full min-h-[400px] min-w-[300px]">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                <h3 className="font-semibold text-gray-200">{status}</h3>
                                <span className="bg-white/5 text-gray-400 px-2 py-0.5 rounded text-xs">{filteredLeads.length}</span>
                            </div>
                            <div className="space-y-3">
                                {filteredLeads.map(lead => (
                                    <div key={lead.id} className="glass-card p-4 rounded-lg border border-white/5 hover:border-indigo-500/30 cursor-pointer group hover:-translate-y-1 transition-transform">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">{lead.name}</span>
                                            <div className="flex items-center gap-1">
                                                {status !== 'WON' && status !== 'LOST' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleWinLead(lead.id, lead.name); }}
                                                        title="Win Lead & Create Project"
                                                        className="text-gray-500 hover:text-emerald-400 transition-colors p-1"
                                                    >
                                                        <Activity size={16} />
                                                    </button>
                                                )}
                                                <MoreHorizontal size={16} className="text-gray-500" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">{lead.company}</p>
                                        <div className="text-sm text-gray-400 mb-3">Value: <span className="text-emerald-400">${parseFloat(lead.value).toLocaleString()}</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const ContactsView = () => (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Contacts</h1>
                    <p className="text-gray-400">Manage your network and client relationships.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 w-64 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Search contacts..." />
                    </div>
                    <button
                        onClick={() => setModalType('contact')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Add Contact
                    </button>
                </div>
            </header>

            <div className="glass rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Company</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {contacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-white">{contact.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{contact.role || '-'}</td>
                                <td className="p-4 text-gray-300">{contact.company || '-'}</td>
                                <td className="p-4 text-gray-400">{contact.email}</td>
                                <td className="p-4"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-500/20">{contact.type}</span></td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-500 hover:text-white"><MoreHorizontal size={18} /></button>
                                </td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No contacts yet. Add one!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const TeamView = () => (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Team</h1>
                    <p className="text-gray-400">Your agency members and collaborators.</p>
                </div>
                <button
                    onClick={() => setModalType('team')}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                    Add Member
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member) => (
                    <div key={member.id} className="glass p-6 rounded-2xl border border-white/5 text-center relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="text-gray-400 cursor-pointer" />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto mb-4 border-4 border-white/5 shadow-xl flex items-center justify-center text-2xl font-bold text-white">
                            {member.name.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-white">{member.name}</h3>
                        <p className="text-indigo-400 text-sm mb-4">{member.role}</p>

                        <div className="flex justify-center gap-3 mb-6">
                            <a href={`mailto:${member.email}`} className="p-2 glass rounded-lg hover:bg-white/10 cursor-pointer"><Mail size={16} className="text-gray-400" /></a>
                        </div>

                        <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-white">{member.projectsCount}</div>
                                <div className="text-xs text-gray-500">Projects</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{parseFloat(member.rating).toFixed(1)}</div>
                                <div className="text-xs text-gray-500">Rating</div>
                            </div>
                        </div>
                    </div>
                ))}
                {team.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400">No team members yet.</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex text-gray-100 font-sans">
            {/* Sidebar - Same as before */}
            <aside className="w-64 glass border-r border-white/5 p-4 hidden md:flex flex-col flex-shrink-0 z-20">
                {/* ... Sidebar header ... */}
                <div className="mb-8 px-2 flex items-center gap-3 mt-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">A</div>
                    <span className="text-xl font-bold tracking-tight text-white">Agency OS</span>
                </div>

                <div className="space-y-6 flex-1">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</div>
                        <nav className="space-y-1">
                            <NavItem active={activeView === 'dashboard'} icon={LayoutGrid} label="Dashboard" onClick={() => setActiveView('dashboard')} />
                            <NavItem active={activeView === 'leads'} icon={Target} label="Leads" onClick={() => setActiveView('leads')} />
                            <NavItem active={activeView === 'contacts'} icon={Users} label="Contacts" onClick={() => setActiveView('contacts')} />
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Practice</div>
                        <nav className="space-y-1">
                            <NavItem active={activeView === 'projects'} icon={Briefcase} label="Projects" onClick={() => setActiveView('dashboard')} />
                            <NavItem active={activeView === 'team'} icon={Users} label="Team" onClick={() => setActiveView('team')} />
                        </nav>
                    </div>
                </div>

                {/* ... User profile ... */}
                <div className="mt-auto">
                    <button onClick={handleSignOut} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5">
                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-xs font-bold border border-indigo-500/30 text-indigo-300">
                            {(user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-gray-200">Owner</div>
                            <div className="text-xs text-gray-500">Sign Out</div>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto relative">
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

                {activeView === 'dashboard' && <DashboardView />}
                {activeView === 'leads' && <LeadsView />}
                {activeView === 'contacts' && <ContactsView />}
                {activeView === 'team' && <TeamView />}
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
        </div>
    );
}

// Stats Card Helper
const StatsCard = ({ icon: Icon, label, value, sub, color }: any) => {
    const colorStyles: any = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'hover:border-emerald-500/20' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'hover:border-amber-500/20' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'hover:border-blue-500/20' },
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'hover:border-purple-500/20' },
    };
    const style = colorStyles[color];

    return (
        <div className={`glass-card p-6 rounded-2xl border border-white/5 ${style.border} transition-colors relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={64} />
            </div>
            <div className="flex items-center gap-3 mb-2 text-gray-400">
                <div className={`p-2 ${style.bg} rounded-lg ${style.text}`}><Icon size={18} /></div>
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
                {value}
            </div>
            <div className={`text-xs ${style.text} mt-2 flex items-center gap-1`}>
                {sub}
            </div>
        </div>
    );
};
