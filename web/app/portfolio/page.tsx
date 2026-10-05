'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ExternalLink, Code2, ShieldCheck, CheckCircle2, ArrowRight,
    Sparkles, Flame, Users, Briefcase, Globe, Phone, Mail,
    MessageSquare, Clock, Send, Check, Calculator, ChevronRight,
    Star, ArrowUpRight, Award, Layers, Zap, Building2, BookOpen, Camera
} from 'lucide-react';
import { api } from '@/src/api/client';

export default function PortfolioShowcasePage() {
    // Quote Calculator State
    const [selectedProjectTier, setSelectedProjectTier] = useState<string>('corporate');
    const [selectedAddons, setSelectedAddons] = useState<string[]>(['portal', 'whatsapp']);
    const [selectedTimeline, setSelectedTimeline] = useState<string>('standard');

    // Quote Form Inputs
    const [quoteFormData, setQuoteFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    });
    const [submittingQuote, setSubmittingQuote] = useState(false);
    const [quoteSubmitted, setQuoteSubmitted] = useState(false);
    const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');

    // Contact Form Inputs
    const [contactFormData, setContactFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [submittingContact, setSubmittingContact] = useState(false);
    const [contactSubmitted, setContactSubmitted] = useState(false);

    // Active project tab filter
    const [activeCategory, setActiveCategory] = useState<string>('ALL');

    // Pricing Matrix (in INR ₹)
    const baseTiers: Record<string, { name: string; basePrice: number; desc: string; icon: any }> = {
        studio: {
            name: 'Creative Studio & Portfolio Portal',
            basePrice: 45000,
            desc: 'Ultra-fast media portfolio, package selector & client inquiry engine like StudioCloudChild.',
            icon: Camera
        },
        corporate: {
            name: 'Corporate Compliance & Enterprise Portal',
            basePrice: 65000,
            desc: 'Statutory compliance, verified testimonial vault & enterprise client engine like CWC India.',
            icon: Building2
        },
        edtech: {
            name: 'EdTech Academy & Course Platform',
            basePrice: 79000,
            desc: 'Interactive curriculum explorer, student enrollment funnels & counselor routing like Sharkedutech.',
            icon: BookOpen
        },
        agnecyos: {
            name: 'AgnecyOS CRM & Multi-Department ERP',
            basePrice: 89000,
            desc: 'Full-stack agency command center: GST billing, client approval portal, scope locking & team check-in.',
            icon: Layers
        },
        custom: {
            name: 'Custom Full-Stack Web Application / SaaS MVP',
            basePrice: 125000,
            desc: 'Tailored PostgreSQL + Fastify + Next.js architecture with custom workflows and role security.',
            icon: Code2
        }
    };

    const addonOptions = [
        { id: 'portal', label: 'Client Approval & Review Portal', price: 15000 },
        { id: 'whatsapp', label: 'Automated WhatsApp Lead Routing & Chat', price: 9000 },
        { id: 'invoicing', label: 'Automated GST Invoicing & Milestone Billing', price: 18000 },
        { id: 'mobile', label: 'PWA / Mobile-Optimized Fast App Setup', price: 14000 },
        { id: 'seo', label: 'Comprehensive Technical SEO & Speed Audit (95+ Score)', price: 12000 }
    ];

    const timelineMultipliers: Record<string, { label: string; multiplier: number }> = {
        rush: { label: 'Rush Delivery (2-3 Weeks)', multiplier: 1.25 },
        standard: { label: 'Standard Sprint (4-6 Weeks)', multiplier: 1.0 },
        relaxed: { label: 'Flexible Phased (8+ Weeks)', multiplier: 0.95 }
    };

    // Calculate Dynamic Estimate
    const currentTier = baseTiers[selectedProjectTier] || baseTiers.corporate;
    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
        const item = addonOptions.find(a => a.id === addonId);
        return sum + (item ? item.price : 0);
    }, 0);
    const subtotal = currentTier.basePrice + addonsTotal;
    const estimatedTotal = Math.round(subtotal * (timelineMultipliers[selectedTimeline]?.multiplier || 1.0));

    const toggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Handle Quote Submission
    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingQuote(true);
        try {
            const servicesList = selectedAddons.map(id => addonOptions.find(a => a.id === id)?.label || id);
            const payload = {
                name: quoteFormData.name,
                email: quoteFormData.email,
                phone: quoteFormData.phone || undefined,
                company: quoteFormData.company || 'Website Quote',
                projectType: currentTier.name,
                budget: estimatedTotal,
                timeline: timelineMultipliers[selectedTimeline]?.label || 'Standard Sprint',
                services: servicesList,
                notes: quoteFormData.notes || undefined
            };

            await api.post('/public/quote-request', payload);
            setQuoteSubmitted(true);
            setQuoteSuccessMsg(`Quote inquiry for ₹${estimatedTotal.toLocaleString('en-IN')} submitted successfully!`);
        } catch (err: any) {
            alert(err.response?.data?.error || err.message || 'Failed to submit quote request. Please call or WhatsApp us.');
        } finally {
            setSubmittingQuote(false);
        }
    };

    // Handle Contact Form Submission
    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingContact(true);
        try {
            const payload = {
                name: contactFormData.name,
                email: contactFormData.email,
                phone: contactFormData.phone || undefined,
                company: contactFormData.company || 'Direct Contact',
                projectType: 'General Consultation & Contact',
                budget: 50000,
                timeline: 'Immediate',
                notes: contactFormData.message
            };
            await api.post('/public/quote-request', payload);
            setContactSubmitted(true);
        } catch (err: any) {
            alert(err.response?.data?.error || err.message || 'Failed to send message.');
        } finally {
            setSubmittingContact(false);
        }
    };

    // Featured Real Projects Showcase Data
    const projects = [
        {
            id: 'studiocloudchild',
            name: 'StudioCloudChild',
            client: 'StudioCloudChild Photography & Creative Production',
            url: 'https://www.studiocloudchild.in/',
            category: 'CREATIVE',
            badge: 'Visual Media & Creative Studio',
            tagline: 'High-Impact Media Portfolio & Visual Creative Showcase',
            description: 'Designed and engineered an ultra-fast, luxury visual media showcase for StudioCloudChild. Features high-resolution 4K asset delivery, interactive client inquiries, and package customization tailored for brand campaigns and studio bookings.',
            deliverables: [
                'Responsive 4K Media Portfolio & Gallery',
                'Client Booking & Package Selector Funnel',
                'Custom Luxury Dark-Mode Aesthetic & Fluid Motion',
                'Sub-Second Asset Delivery CDN Architecture',
                'Mobile-First Touch Interaction for Visual Media'
            ],
            tech: ['Next.js', 'React', 'Tailwind CSS', 'Asset CDN', 'Inquiry Pipeline'],
            metrics: '4K Asset Delivery • Sub-second Load • 100% Mobile Ready',
            gradient: 'from-purple-900/40 via-indigo-900/30 to-black',
            accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
        },
        {
            id: 'cwcindia',
            name: 'CWC India',
            client: 'CWC India | Global Accounting & Cost Governance Firm',
            url: 'https://cwcindia.in/',
            category: 'CORPORATE',
            badge: 'Global Accounting & Compliance',
            tagline: 'Statutory Cost Audit, Cost Control & Regulatory Governance Platform',
            description: 'Architected and built the corporate digital ecosystem for CWC India, a leading accounting and audit authority. Features verified testimonial and compliance documentation system, multi-service inquiry engine, and enterprise regulatory trust architecture.',
            deliverables: [
                'Corporate Service Directory (Cost Audit, Tax & ESG Compliance)',
                'Verified Testimonial & Document Verification Vault',
                'Multi-Channel Corporate Inquiry Engine for Domestic & Global MNCs',
                'SEO-Optimized Regulatory Resource Repository',
                'High-Security Corporate Grade Architecture'
            ],
            tech: ['Enterprise Web Architecture', 'Fastify / Node.js', 'Document Vault', 'Technical SEO', 'Corporate UI'],
            metrics: 'Trusted by Global MNCs • Verified Testimonials • Regulatory Compliance',
            gradient: 'from-blue-900/40 via-cyan-900/30 to-black',
            accent: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
        },
        {
            id: 'sharkedutech',
            name: 'Sharkedutech',
            client: 'Sharkedutech - Hospitality Education & Career Platform',
            url: 'https://sharkedutech.com/',
            category: 'EDTECH',
            badge: 'Hospitality Education & LMS',
            tagline: 'Premier Hospitality Career Training & Placement Portal',
            description: 'Engineered an interactive student learning and admission platform for Sharkedutech. Features dynamic course curriculum exploration, direct student lead enrollment funnels, automated counselor WhatsApp routing, and placement success showcase.',
            deliverables: [
                'Interactive Hospitality Course Explorer & Syllabus Viewer',
                'High-Conversion Student Admission & Lead Funnel',
                'Automated WhatsApp Counselor Routing & Inquiries',
                'Student Placement Success Stories & Institutional Badges',
                'Mobile-Optimized Experience for Prospective Applicants'
            ],
            tech: ['Modern Web App', 'CRM Lead Integration', 'WhatsApp API Routing', 'Curriculum Engine', 'High-Speed UI'],
            metrics: 'High Conversion Leads • Instant WhatsApp Routing • 100% Student Accessibility',
            gradient: 'from-emerald-900/40 via-teal-900/30 to-black',
            accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
        }
    ];

    const filteredProjects = activeCategory === 'ALL'
        ? projects
        : projects.filter(p => p.category === activeCategory);

    return (
        <div className="bg-[#030712] text-slate-300 font-sans min-h-screen relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(14px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .hero-gradient-text {
                    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .glow-indigo {
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                }
                .glow-emerald {
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
                }
            `}</style>

            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute -top-[15%] -left-[10%] w-[65%] h-[65%] glow-indigo"></div>
                <div className="absolute bottom-0 right-0 w-[55%] h-[55%] glow-emerald"></div>
            </div>

            {/* Floating Navigation Pill */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                <div className="glass max-w-7xl w-full flex items-center justify-between px-6 sm:px-8 py-4 rounded-full shadow-2xl border border-white/10">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="agnecyos / dhandaeasy" className="h-8 sm:h-9 w-auto object-contain rounded-lg border border-white/10 shadow-sm" />
                    </Link>
                    <div className="hidden md:flex items-center gap-7">
                        <Link href="/workflow" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Workflow</Link>
                        <Link href="/features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</Link>
                        <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
                        <Link href="/portfolio" className="text-white text-sm font-bold flex items-center gap-1.5 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                            Projects Showcase
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="#quote-calculator"
                            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5"
                        >
                            <Calculator size={15} /> Request Quote
                        </a>
                        <Link href="/login">
                            <button className="hidden sm:inline-block text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all">
                                Login
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Showcase Hero */}
            <main className="relative pt-36 sm:pt-44 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
                {/* Hero Header */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                        <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                        Software Projects Built by Dhandaeasy
                    </div>
                    <h1 className="hero-gradient-text text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                        Proven Software Products &amp; Client Projects
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Explore high-performance corporate platforms, LMS portals, and visual studio platforms engineered by Dhandaeasy. Real client architectures delivering sub-second speed and measurable business results.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <a
                            href="#client-projects"
                            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center gap-2"
                        >
                            <span>View Live Client Projects</span>
                            <ArrowRight size={16} />
                        </a>
                        <a
                            href="#quote-calculator"
                            className="px-6 py-3 rounded-2xl glass text-white font-bold text-xs sm:text-sm hover:bg-white/5 border border-white/10 transition-all flex items-center gap-2"
                        >
                            <Calculator size={16} className="text-indigo-400" />
                            <span>Instant Quote Calculator (INR ₹)</span>
                        </a>
                        <a
                            href="#contact-section"
                            className="px-6 py-3 rounded-2xl glass text-emerald-400 font-bold text-xs sm:text-sm hover:bg-emerald-500/10 border border-emerald-500/20 transition-all flex items-center gap-2"
                        >
                            <Phone size={16} />
                            <span>Contact Us</span>
                        </a>
                    </div>

                    {/* Trust Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/[0.06] text-left">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="text-2xl font-extrabold text-white font-mono">100%</div>
                            <div className="text-xs text-gray-400 mt-1">Custom Engineered (No Generic Templates)</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="text-2xl font-extrabold text-emerald-400 font-mono">&lt; 0.8s</div>
                            <div className="text-xs text-gray-400 mt-1">Global Page Speed &amp; Optimized CDN</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="text-2xl font-extrabold text-indigo-400 font-mono">₹ INR</div>
                            <div className="text-xs text-gray-400 mt-1">Transparent Indian Currency Pricing</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <div className="text-2xl font-extrabold text-purple-400 font-mono">24/7</div>
                            <div className="text-xs text-gray-400 mt-1">Deployment Support &amp; SLA Guarantee</div>
                        </div>
                    </div>
                </div>

                {/* Section 1: Delivered Client Projects */}
                <section id="client-projects" className="space-y-10 scroll-mt-32">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Production Work</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                                Featured Client Projects
                            </h2>
                            <p className="text-sm text-gray-400 mt-1 max-w-xl">
                                Live web platforms engineered for national &amp; global organizations. Click any project to inspect the live site.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass border border-white/10 overflow-x-auto scrollbar-none">
                            {['ALL', 'CORPORATE', 'EDTECH', 'CREATIVE'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                        activeCategory === cat
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {cat === 'ALL' ? 'All Projects' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Project Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((p) => (
                            <div
                                key={p.id}
                                className={`rounded-3xl border border-white/[0.08] hover:border-indigo-500/40 bg-gradient-to-b ${p.gradient} p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl relative group overflow-hidden`}
                            >
                                <div className="space-y-6">
                                    {/* Top Card Badge & Action */}
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${p.accent}`}>
                                            {p.badge}
                                        </span>
                                        <a
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-colors border border-white/10 group-hover:border-indigo-500/40"
                                            title={`Visit ${p.name}`}
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>

                                    {/* Title & Tagline */}
                                    <div>
                                        <h3 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                                            {p.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-indigo-400/90 mt-1">
                                            {p.tagline}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {p.description}
                                    </p>

                                    {/* Key Deliverables List */}
                                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                            Engineering Deliverables:
                                        </div>
                                        {p.deliverables.map((d, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                                                <span>{d}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tech Stack Pills */}
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {p.tech.map((t, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] text-gray-300 border border-white/10"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer with Live Link */}
                                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
                                    <span className="text-[11px] text-gray-400 font-mono">
                                        {p.metrics}
                                    </span>
                                    <a
                                        href={p.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-white hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors group-hover:translate-x-1"
                                    >
                                        <span>Live Site</span>
                                        <ArrowUpRight size={15} className="text-indigo-400" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 2: Software Products & Solutions with Indian Currency (₹ INR) Pricing */}
                <section id="software-pricing" className="space-y-10 scroll-mt-32">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Transparent Indian Pricing</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Software Products &amp; Packages (₹ INR)
                        </h2>
                        <p className="text-sm text-gray-400">
                            Fixed scope, enterprise reliability, and full intellectual property ownership. Prices are in Indian Currency (₹ INR) with zero hidden fees.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Product 1: Studio */}
                        <div className="rounded-3xl glass p-7 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-xl">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        <Camera size={22} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                                        Studio &amp; Visual
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white">Creative Studio &amp; Portfolio</h3>
                                    <p className="text-xs text-gray-400 mt-1">Modeled after StudioCloudChild architecture.</p>
                                </div>

                                <div>
                                    <div className="text-3xl font-extrabold text-white font-mono">₹45,000</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">One-time development &amp; deploy</div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-300 border-t border-white/[0.06] pt-4">
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Ultra-fast 4K media showcase</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Interactive booking &amp; inquiries</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Custom luxury dark typography</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Mobile &amp; tablet responsive viewer</div>
                                </div>
                            </div>

                            <a
                                href="#quote-calculator"
                                onClick={() => setSelectedProjectTier('studio')}
                                className="mt-6 w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold text-center block transition-all border border-white/10"
                            >
                                Calculate Custom Quote &rarr;
                            </a>
                        </div>

                        {/* Product 2: Corporate */}
                        <div className="rounded-3xl glass p-7 border border-cyan-500/30 bg-cyan-950/10 flex flex-col justify-between hover:border-cyan-500/60 transition-all shadow-xl relative">
                            <div className="absolute top-4 right-4">
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                                    Most Popular
                                </span>
                            </div>

                            <div className="space-y-5">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
                                    <Building2 size={22} />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white">Corporate Compliance &amp; Web Portal</h3>
                                    <p className="text-xs text-gray-400 mt-1">Modeled after CWC India governance platform.</p>
                                </div>

                                <div>
                                    <div className="text-3xl font-extrabold text-cyan-400 font-mono">₹65,000</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Enterprise statutory setup &amp; SEO</div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-300 border-t border-white/[0.06] pt-4">
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Multi-page service &amp; practice catalog</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Verified testimonial document repository</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> High-security corporate lead routing</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Complete technical SEO audit (95+ score)</div>
                                </div>
                            </div>

                            <a
                                href="#quote-calculator"
                                onClick={() => setSelectedProjectTier('corporate')}
                                className="mt-6 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold text-center block transition-all shadow-lg shadow-cyan-600/30"
                            >
                                Calculate Custom Quote &rarr;
                            </a>
                        </div>

                        {/* Product 3: EdTech */}
                        <div className="rounded-3xl glass p-7 border border-white/10 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        <BookOpen size={22} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
                                        EdTech / LMS
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white">EdTech Academy &amp; Admission Portal</h3>
                                    <p className="text-xs text-gray-400 mt-1">Modeled after Sharkedutech academy platform.</p>
                                </div>

                                <div>
                                    <div className="text-3xl font-extrabold text-white font-mono">₹79,000</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Course platform + lead routing</div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-300 border-t border-white/[0.06] pt-4">
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Interactive course syllabus explorer</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Automated student enrollment funnels</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> WhatsApp admission counselor routing</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Placement &amp; recruiter partner showcase</div>
                                </div>
                            </div>

                            <a
                                href="#quote-calculator"
                                onClick={() => setSelectedProjectTier('edtech')}
                                className="mt-6 w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold text-center block transition-all border border-white/10"
                            >
                                Calculate Custom Quote &rarr;
                            </a>
                        </div>

                        {/* Product 4: AgnecyOS */}
                        <div className="rounded-3xl glass p-7 border border-indigo-500/30 bg-indigo-950/15 flex flex-col justify-between hover:border-indigo-500/60 transition-all shadow-xl">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        <Layers size={22} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase">
                                        Flagship ERP
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white">AgnecyOS - Agency Operating System</h3>
                                    <p className="text-xs text-gray-400 mt-1">Complete multi-department ERP &amp; Client Portal.</p>
                                </div>

                                <div>
                                    <div className="text-3xl font-extrabold text-indigo-400 font-mono">₹89,000</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Turnkey deployment &amp; code ownership</div>
                                </div>

                                <div className="space-y-2 text-xs text-gray-300 border-t border-white/[0.06] pt-4">
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Scope locking, deliverables &amp; revisions</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Milestone GST invoicing &amp; payment audit</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Client sign-off approval portal with audit log</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Team duty attendance check-in &amp; chat</div>
                                </div>
                            </div>

                            <a
                                href="#quote-calculator"
                                onClick={() => setSelectedProjectTier('agnecyos')}
                                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center block transition-all shadow-lg shadow-indigo-600/30"
                            >
                                Calculate Custom Quote &rarr;
                            </a>
                        </div>

                        {/* Product 5: Custom SaaS MVP */}
                        <div className="rounded-3xl glass p-7 border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl md:col-span-2 lg:col-span-2">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <Code2 size={22} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                                        Full-Stack Custom
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white">Custom SaaS Web App / MVP Architecture</h3>
                                    <p className="text-xs text-gray-400 mt-1">From napkin idea to deployed enterprise cloud application.</p>
                                </div>

                                <div>
                                    <div className="text-3xl font-extrabold text-amber-400 font-mono">₹1,25,000+</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">Estimated starting investment</div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 border-t border-white/[0.06] pt-4">
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> PostgreSQL + Prisma Database design</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> High-speed Fastify / Node.js API</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Next.js App Router with server actions</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Role-based authentication (Admin/Staff/Client)</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Automated SMTP notifications &amp; alerts</div>
                                    <div className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Docker / Cloud deployment (Vercel / Render / AWS)</div>
                                </div>
                            </div>

                            <a
                                href="#quote-calculator"
                                onClick={() => setSelectedProjectTier('custom')}
                                className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold text-center block transition-all shadow-lg shadow-amber-600/30"
                            >
                                Calculate Custom Quote &rarr;
                            </a>
                        </div>
                    </div>
                </section>

                {/* Section 3: Interactive Instant Quote Calculator & Request Form */}
                <section id="quote-calculator" className="space-y-10 scroll-mt-32">
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Interactive Estimator</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                            Instant Project Quote Calculator
                        </h2>
                        <p className="text-sm text-gray-400">
                            Configure your project specifications below for an immediate estimate in ₹ INR, then submit your brief to lock in priority sprint dates.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Configuration Column */}
                        <div className="lg:col-span-7 glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-7">
                            {/* Step 1: Select Software Project Type */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                                    <span>1. Select Software Architecture</span>
                                    <span className="text-[11px] text-indigo-400 font-mono font-normal">Base Investment</span>
                                </label>
                                <div className="space-y-2">
                                    {Object.entries(baseTiers).map(([key, val]) => {
                                        const isSelected = selectedProjectTier === key;
                                        const TierIcon = val.icon;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setSelectedProjectTier(key)}
                                                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 ${
                                                    isSelected
                                                        ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-600/10'
                                                        : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
                                                        <TierIcon size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-white truncate">{val.name}</div>
                                                        <div className="text-xs text-gray-400 truncate">{val.desc}</div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-extrabold text-white font-mono shrink-0">
                                                    ₹{val.basePrice.toLocaleString('en-IN')}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 2: Add-On Features */}
                            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                                    2. Modular Add-On Integrations
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {addonOptions.map((addon) => {
                                        const isChecked = selectedAddons.includes(addon.id);
                                        return (
                                            <button
                                                key={addon.id}
                                                type="button"
                                                onClick={() => toggleAddon(addon.id)}
                                                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                                                    isChecked
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                                        : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                                        isChecked ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : 'border-white/20'
                                                    }`}>
                                                        {isChecked && '✓'}
                                                    </div>
                                                    <span className="font-medium truncate">{addon.label}</span>
                                                </div>
                                                <span className="font-mono text-[11px] shrink-0 font-bold">
                                                    +₹{(addon.price / 1000)}k
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 3: Timeline Sprints */}
                            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                                    3. Delivery Sprint Timeline
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {Object.entries(timelineMultipliers).map(([key, val]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setSelectedTimeline(key)}
                                            className={`p-3 rounded-xl border text-center text-xs transition-all ${
                                                selectedTimeline === key
                                                    ? 'bg-indigo-600 text-white font-bold border-indigo-400'
                                                    : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {val.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Summary & Lead Submission Column */}
                        <div className="lg:col-span-5 glass rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-b from-[#0e162e] to-[#0a0f1d] shadow-2xl space-y-6 sticky top-28">
                            <div className="border-b border-white/[0.08] pb-5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Live Estimated Quote</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                                        ₹{estimatedTotal.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">INR (All inclusive)</span>
                                </div>
                                <p className="text-xs text-indigo-300/80 mt-1">
                                    Includes code repository transfer, staging server testing &amp; 30-day post-launch warranty.
                                </p>
                            </div>

                            {/* Brief summary breakdown */}
                            <div className="space-y-2 text-xs text-gray-400 border-b border-white/[0.08] pb-4">
                                <div className="flex justify-between">
                                    <span>Selected Base:</span>
                                    <span className="font-semibold text-white">{currentTier.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Add-ons ({selectedAddons.length}):</span>
                                    <span className="font-mono text-white">+₹{addonsTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sprint Schedule:</span>
                                    <span className="text-indigo-300 font-medium">{timelineMultipliers[selectedTimeline]?.label}</span>
                                </div>
                            </div>

                            {/* Quote Submission Form */}
                            {quoteSubmitted ? (
                                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                                    <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                                    <h4 className="text-base font-bold text-white">Quote Request Received!</h4>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {quoteSuccessMsg} Our technical founder will review your specifications and contact you with a detailed scope of work.
                                    </p>
                                    <div className="pt-2">
                                        <a
                                            href={`https://wa.me/919147384054?text=${encodeURIComponent(`Hi Dhandaeasy Team, I just configured a project quote on your website for ${currentTier.name} (Est: ₹${estimatedTotal.toLocaleString('en-IN')}). My name is ${quoteFormData.name}.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                                        >
                                            <MessageSquare size={14} /> Chat Instantly on WhatsApp
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleQuoteSubmit} className="space-y-3">
                                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                                        Submit Brief to Lock Price &amp; Dates:
                                    </div>

                                    <div>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Your Full Name *"
                                            value={quoteFormData.name}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, name: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <input
                                            required
                                            type="email"
                                            placeholder="Work Email *"
                                            value={quoteFormData.email}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, email: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="WhatsApp / Phone"
                                            value={quoteFormData.phone}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, phone: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Company / Organization (Optional)"
                                            value={quoteFormData.company}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, company: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <textarea
                                            rows={2}
                                            placeholder="Any special requirements, existing tech stack or deadline notes..."
                                            value={quoteFormData.notes}
                                            onChange={(e) => setQuoteFormData({ ...quoteFormData, notes: e.target.value })}
                                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingQuote}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                    >
                                        {submittingQuote ? (
                                            <span>Submitting Inquiry...</span>
                                        ) : (
                                            <>
                                                <span>Request Official Scope &amp; Quote</span>
                                                <Send size={14} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-gray-500 text-center">
                                        ⚡ We respond within 2-4 hours with a comprehensive technical scope and milestones.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section 4: Direct Contact Us Section */}
                <section id="contact-section" className="space-y-10 scroll-mt-32">
                    <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                            {/* Contact Info */}
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                                    <Phone size={13} /> Direct Contact Lines
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                    Let&apos;s Build Your Next Digital Product
                                </h2>

                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Whether you need a custom corporate platform, high-converting portfolio, or an enterprise operating system like AgnecyOS, we engineer solutions with precision, speed, and clean code.
                                </p>

                                <div className="space-y-4 pt-2">
                                    <a
                                        href="https://wa.me/919147384054"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 transition-all group"
                                    >
                                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium">WhatsApp / Instant Chat</div>
                                            <div className="text-base font-bold text-white group-hover:text-emerald-300 font-mono">+91 9147384054</div>
                                        </div>
                                    </a>

                                    <a
                                        href="mailto:aalokshaw2003@gmail.com"
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 transition-all group"
                                    >
                                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium">Direct Engineering Email</div>
                                            <div className="text-base font-bold text-white group-hover:text-indigo-300 font-mono">aalokshaw2003@gmail.com</div>
                                        </div>
                                    </a>

                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium">Headquarters &amp; Coverage</div>
                                            <div className="text-sm font-bold text-white">Kolkata, India • Serving Clients Nationwide &amp; Globally</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Message Form */}
                            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
                                {contactSubmitted ? (
                                    <div className="p-8 text-center space-y-3">
                                        <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                                        <h3 className="text-xl font-bold text-white">Message Sent Successfully!</h3>
                                        <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                                            Thank you for reaching out to Dhandaeasy. We have received your inquiry and our engineering team will get back to you shortly.
                                        </p>
                                        <a
                                            href="https://wa.me/919147384054"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                                        >
                                            <MessageSquare size={14} /> Quick WhatsApp Follow-up
                                        </a>
                                    </div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Send Us a Direct Message</h3>
                                            <p className="text-xs text-gray-400">Tell us about your organization and project vision.</p>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Your Name *</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Rahul Sharma"
                                                value={contactFormData.name}
                                                onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Email Address *</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="rahul@company.com"
                                                    value={contactFormData.email}
                                                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Phone / WhatsApp</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    value={contactFormData.phone}
                                                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Company / Project Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. My Next Venture / SaaS"
                                                value={contactFormData.company}
                                                onChange={(e) => setContactFormData({ ...contactFormData, company: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-300 block mb-1">Project Details / Message *</label>
                                            <textarea
                                                required
                                                rows={3}
                                                placeholder="Describe your requirements, goals, and ideal delivery timeline..."
                                                value={contactFormData.message}
                                                onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submittingContact}
                                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {submittingContact ? (
                                                <span>Sending Message...</span>
                                            ) : (
                                                <>
                                                    <span>Send Direct Inquiry</span>
                                                    <Send size={14} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/[0.08] bg-[#02050e] py-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="agnecyos / dhandaeasy" className="h-7 w-auto object-contain rounded" />
                        <span className="font-bold text-white">Dhandaeasy Digital Engineering</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link href="/portfolio" className="hover:text-white transition-colors">Showcase</Link>
                        <Link href="/workflow" className="hover:text-white transition-colors">Workflow</Link>
                        <Link href="/features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Client Login</Link>
                    </div>

                    <div className="text-gray-500">
                        © {new Date().getFullYear()} Dhandaeasy. Engineered with precision.
                    </div>
                </div>
            </footer>
        </div>
    );
}
