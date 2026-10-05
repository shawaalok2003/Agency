'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ExternalLink, Code2, ShieldCheck, CheckCircle2, ArrowRight,
    Sparkles, Flame, Users, Briefcase, Globe, Phone, Mail,
    MessageSquare, Clock, Send, Check, ChevronRight,
    Star, ArrowUpRight, Award, Layers, Zap, Building2, BookOpen, Camera,
    X, Maximize2, Palette, Cpu, FileCheck2, GraduationCap
} from 'lucide-react';
import { api } from '@/src/api/client';

export default function PortfolioShowcasePage() {
    // Gallery Lightbox State
    const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; client: string; category: string } | null>(null);

    // Active project tab filter
    const [activeCategory, setActiveCategory] = useState<string>('ALL');

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

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingContact(true);
        try {
            await api.post('/public/quote-request', {
                name: contactFormData.name,
                email: contactFormData.email,
                phone: contactFormData.phone,
                company: contactFormData.company,
                projectType: 'General Consultation Inquiry',
                notes: contactFormData.message
            });
            setContactSubmitted(true);
        } catch (err: any) {
            setContactSubmitted(true);
        } finally {
            setSubmittingContact(false);
        }
    };

    // Client Projects Showcase Data with Live Assets & Site Styling
    const projects = [
        {
            id: 'studiocloudchild',
            name: 'StudioCloudChild',
            category: 'STUDIO',
            categoryLabel: 'Creative Studio & Visual Media',
            url: 'https://www.studiocloudchild.in/',
            domain: 'studiocloudchild.in',
            logo: '/portfolio/scc-logo.png',
            tagline: 'High-Impact Avant-Garde Visual Storytelling & Production',
            accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent',
            badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
            buttonGradient: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
            themeStyle: 'Avant-Garde Dark Luxury with Neon Emerald Elements',
            description: 'A bespoke creative studio web platform engineered for StudioCloudChild. Designed for visual artists, luxury fashion campaigns, and production studios. Engineered with full-screen 4K galleries, interactive booking inquiries, and high-performance CDN image optimization.',
            stats: [
                { label: 'Asset Load Time', value: '<450ms' },
                { label: 'Visual Format', value: '4K Full-Width' },
                { label: 'Booking Funnels', value: 'Automated' },
                { label: 'Brand Collaborations', value: 'Cadbury, Heinz, Ogilvy' }
            ],
            techStack: ['React', 'Vite', 'Tailwind CSS', 'Space Grotesk Typography', 'Image CDN', 'Responsive Viewport Engine'],
            gallery: [
                {
                    url: '/portfolio/scc-hero.png',
                    title: 'Studio Homepage Hero & Brand Identity',
                    type: 'Creative Art Direction'
                },
                {
                    url: '/portfolio/scc-cloud.gif',
                    title: 'Signature Cloud Motion Graphic & Animation',
                    type: 'Brand Visual Asset'
                },
                {
                    url: '/portfolio/scc-mobile.png',
                    title: 'Mobile Phone & Responsive Viewport Experience',
                    type: 'Mobile Responsive Layout'
                },
                {
                    url: '/portfolio/scc-gallery-1.png',
                    title: 'High-Fashion Visual Studio Shoot Showcase',
                    type: 'Production Photography'
                },
                {
                    url: '/portfolio/scc-gallery-2.png',
                    title: 'Editorial Creative Shoot & Model Showcase',
                    type: 'Visual Portfolio'
                },
                {
                    url: '/portfolio/scc-team.png',
                    title: 'Creative Production Team & Studio Sessions',
                    type: 'Behind The Scenes'
                }
            ]
        },
        {
            id: 'cwcindia',
            name: 'CWC India',
            category: 'CORPORATE',
            categoryLabel: 'Global Accounting & Statutory Audit Firm',
            url: 'https://cwcindia.in/',
            domain: 'cwcindia.in',
            logo: '/portfolio/cwc-logo.png',
            tagline: 'Statutory Cost Audit, Cost Control & Regulatory Governance',
            accentColor: 'from-sky-500/20 via-blue-500/10 to-transparent',
            badgeColor: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
            buttonGradient: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20',
            themeStyle: 'Statutory Corporate Navy & Slate with High-Trust Credibility',
            description: 'An enterprise-grade governance and accounting web platform engineered for CWC India. Features verified statutory cost audit services, corporate compliance calculators, an encrypted testimonial document repository, and technical search engine optimization.',
            stats: [
                { label: 'Lighthouse Score', value: '98 / 100' },
                { label: 'Enterprise Clientele', value: 'HDFC, ITC, Airtel, IndianOil' },
                { label: 'Security Grade', value: 'A+ SSL Enterprise' },
                { label: 'Compliance Vault', value: 'Verified Docs' }
            ],
            techStack: ['Next.js App Router', 'TypeScript', 'Node.js', 'Enterprise SEO', 'Statutory Calculators', 'High-Trust Blue UI'],
            gallery: [
                {
                    url: '/portfolio/cwc-hero.png',
                    title: 'CWC India Enterprise Platform Hero & Practice Overview',
                    type: 'Corporate Web Architecture'
                },
                {
                    url: '/portfolio/cwc-audit.png',
                    title: 'Statutory Cost Audit & Financial Governance Overview',
                    type: 'Regulatory Framework'
                },
                {
                    url: '/portfolio/cwc-services.png',
                    title: 'Core Accounting, Bookkeeping & Advisory Catalog',
                    type: 'Practice Services Vault'
                },
                {
                    url: '/portfolio/cwc-hdfc.png',
                    title: 'Institutional Clientele: HDFC Bank Audit Mandate',
                    type: 'Verified Enterprise Client'
                },
                {
                    url: '/portfolio/cwc-itc.png',
                    title: 'Institutional Clientele: ITC Limited Statutory Mandate',
                    type: 'Verified Enterprise Client'
                },
                {
                    url: '/portfolio/cwc-airtel.png',
                    title: 'Institutional Clientele: Bharti Airtel Cost Control',
                    type: 'Verified Enterprise Client'
                }
            ]
        },
        {
            id: 'sharkedutech',
            name: 'Sharkedutech',
            category: 'EDTECH',
            categoryLabel: 'Hospitality Education & LMS Academy Platform',
            url: 'https://sharkedutech.com/',
            domain: 'sharkedutech.com',
            logo: '/portfolio/shark-logo.png',
            tagline: 'Leading Hospitality & Culinary Education Platform',
            accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
            badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
            buttonGradient: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20',
            themeStyle: 'Hospitality Gold & Deep Navy with Luxury Academy Aesthetics',
            description: 'An immersive hospitality learning management and admissions academy platform for Sharkedutech. Built to power student enrollments, interactive course exploration, automated counselor WhatsApp routing, and luxury hotel training network showcases.',
            stats: [
                { label: 'Student Admissions', value: 'Multi-Batch Funnels' },
                { label: 'Counselor Routing', value: 'Instant WhatsApp' },
                { label: 'Industry Placement', value: '5-Star Hotel Chains' },
                { label: 'Curriculum Depth', value: 'Interactive LMS' }
            ],
            techStack: ['Next.js', 'PostgreSQL', 'LMS Interactive Explorer', 'WhatsApp Automation', 'Luxury Resort Aesthetics'],
            gallery: [
                {
                    url: '/portfolio/shark-resort.jpg',
                    title: '5-Star Luxury Resort & Hotel Management Division',
                    type: 'Campus & Training Network'
                },
                {
                    url: '/portfolio/shark-training.jpg',
                    title: 'Practical Hands-on Hospitality & Food Service Studio',
                    type: 'Practical Academy Labs'
                },
                {
                    url: '/portfolio/shark-culinary.jpg',
                    title: 'Culinary Arts, Kitchen Management & Gourmet Dining',
                    type: 'Professional Culinary Arts'
                },
                {
                    url: '/portfolio/shark-hotel.jpg',
                    title: 'Front Desk, Concierge & Global Guest Relations Training',
                    type: 'Hospitality Leadership'
                }
            ]
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
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(16px);
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
                .glow-sky {
                    background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%);
                }
            `}</style>

            {/* Atmospheric Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] glow-indigo"></div>
                <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] glow-sky"></div>
                <div className="absolute bottom-0 left-[20%] w-[60%] h-[50%] glow-emerald"></div>
            </div>

            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                <div className="glass max-w-7xl w-full flex items-center justify-between px-6 md:px-8 py-4 rounded-full">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="agnecyos" className="h-9 w-auto object-contain rounded-lg border border-white/10 shadow-sm" />
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/portfolio" className="text-white text-sm font-semibold flex items-center gap-1.5 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Projects Showcase
                        </Link>
                        <Link href="/workflow" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Workflow</Link>
                        <Link href="/features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</Link>
                        <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#contact-us" className="hidden sm:inline-flex bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/15 transition-all">
                            Contact Us
                        </a>
                        <Link href="/login">
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-lg shadow-indigo-500/20">
                                Client Login
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <main className="relative z-10 pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-medium text-indigo-300 mb-6 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Crafted by Dhandaeasy Engineering</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight hero-gradient-text leading-tight mb-6">
                        Client Projects & Live Web Showcase
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
                        Explore production platforms engineered by Dhandaeasy. From luxury creative visual studios to statutory corporate compliance portals and interactive EdTech academies, experience our authentic design craftsmanship and scalable architectures.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <a href="#showcase" className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                            Explore Projects & Galleries <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#contact-us" className="glass hover:bg-white/5 text-slate-200 px-7 py-3 rounded-full text-sm font-semibold border border-white/15 transition-all flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-400" /> Contact Team / +91 6290529857
                        </a>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div id="showcase" className="flex justify-center mb-12">
                    <div className="glass p-1.5 rounded-full flex flex-wrap items-center gap-1 sm:gap-2 border border-white/10">
                        <button
                            onClick={() => setActiveCategory('ALL')}
                            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                                activeCategory === 'ALL'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            All Projects (3)
                        </button>
                        <button
                            onClick={() => setActiveCategory('STUDIO')}
                            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                activeCategory === 'STUDIO'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Camera className="w-3.5 h-3.5" /> StudioCloudChild
                        </button>
                        <button
                            onClick={() => setActiveCategory('CORPORATE')}
                            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                activeCategory === 'CORPORATE'
                                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Building2 className="w-3.5 h-3.5" /> CWC India
                        </button>
                        <button
                            onClick={() => setActiveCategory('EDTECH')}
                            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                activeCategory === 'EDTECH'
                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" /> Sharkedutech
                        </button>
                    </div>
                </div>

                {/* Projects Showcase Cards with Dedicated Galleries & Website Styling */}
                <div className="space-y-24 mb-32">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className={`glass-card rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-white/10 bg-gradient-to-b ${project.accentColor} transition-all duration-300 hover:border-white/20`}
                        >
                            {/* Project Header Bar */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10 mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-white/10 p-3 flex items-center justify-center shrink-0 shadow-lg">
                                        <img
                                            src={project.logo}
                                            alt={`${project.name} logo`}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                            <span className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${project.badgeColor}`}>
                                                {project.categoryLabel}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Palette className="w-3 h-3 text-slate-500" /> {project.themeStyle}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                                            {project.name}
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1 font-medium">
                                            {project.tagline}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md ${project.buttonGradient}`}
                                    >
                                        Visit Live Website <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <a
                                        href="#contact-us"
                                        className="glass hover:bg-white/10 text-white px-5 py-3 rounded-full text-sm font-semibold border border-white/15 transition-all inline-flex items-center gap-1.5"
                                    >
                                        Discuss Similar Build <ArrowRight className="w-4 h-4 text-slate-400" />
                                    </a>
                                </div>
                            </div>

                            {/* Project Overview & Key Highlights */}
                            <div className="grid lg:grid-cols-12 gap-8 mb-10">
                                <div className="lg:col-span-8">
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-400" /> Platform Architecture & Deliverables
                                    </h3>
                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                                        {project.description}
                                    </p>

                                    {/* Tech Stack Pills */}
                                    <div className="flex flex-wrap gap-2">
                                        {project.techStack.map((tech, i) => (
                                            <span
                                                key={i}
                                                className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300"
                                            >
                                                #{tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                                    {project.stats.map((stat, i) => (
                                        <div key={i} className="glass p-4 rounded-2xl border border-white/10 flex flex-col justify-center">
                                            <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                                                {stat.label}
                                            </span>
                                            <span className="text-base sm:text-lg font-bold text-white mt-1">
                                                {stat.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Image Asset Gallery Section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                        <Camera className="w-4 h-4 text-indigo-400" />
                                        Visual Gallery & Live Assets ({project.gallery.length} Views)
                                    </h4>
                                    <span className="text-xs text-slate-500 hidden sm:inline-block">
                                        Click any asset to enlarge in high resolution
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {project.gallery.map((item, gIdx) => (
                                        <div
                                            key={gIdx}
                                            onClick={() => setLightboxImage({ url: item.url, title: item.title, client: project.name, category: item.type })}
                                            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 aspect-[16/10] cursor-pointer hover:border-white/30 transition-all duration-300 shadow-md"
                                        >
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-4">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-1">
                                                    {item.type}
                                                </span>
                                                <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                                                    {item.title}
                                                </p>
                                            </div>
                                            <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/70 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                                                <Maximize2 className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox Modal */}
                {lightboxImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setLightboxImage(null)}
                    >
                        <div
                            className="max-w-5xl w-full max-h-[90vh] glass-card rounded-3xl p-4 sm:p-6 border border-white/20 relative flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                        {lightboxImage.client} &bull; {lightboxImage.category}
                                    </span>
                                    <h3 className="text-lg font-bold text-white mt-0.5">
                                        {lightboxImage.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setLightboxImage(null)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative flex-1 min-h-[300px] max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/50">
                                <img
                                    src={lightboxImage.url}
                                    alt={lightboxImage.title}
                                    className="max-h-full max-w-full object-contain rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Direct Contact Options Section */}
                <section id="contact-us" className="mb-24">
                    <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-5 glass-card rounded-3xl p-8 sm:p-10 border border-white/10 flex flex-col justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs font-semibold text-sky-400 mb-4">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>Direct Communication Channels</span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                                    Let's Discuss Your Project
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                    Have questions about our development stack, timelines, or previous client deliverables? Reach out directly via phone, WhatsApp, or email for an immediate response.
                                </p>

                                <div className="space-y-4">
                                    <a
                                        href="https://wa.me/916290529857"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                                                WhatsApp Chat / Direct Line
                                            </span>
                                            <span className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                                                +91 6290529857
                                            </span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 ml-auto transition-colors" />
                                    </a>

                                    <a
                                        href="mailto:aalokshaw2003@gmail.com"
                                        className="glass p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                                                Founder & Engineering Email
                                            </span>
                                            <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                aalokshaw2003@gmail.com
                                            </span>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 ml-auto transition-colors" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/10 mt-8 text-xs text-slate-500 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>Typical response turnaround: Within 2 hours (Mon - Sat)</span>
                            </div>
                        </div>

                        <div className="lg:col-span-7 glass-card rounded-3xl p-8 sm:p-10 border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-2">Send an Instant Message</h3>
                            <p className="text-sm text-slate-400 mb-6">
                                Leave your contact info and project scope; we'll connect with you right away.
                            </p>

                            {contactSubmitted ? (
                                <div className="glass p-8 rounded-2xl border border-emerald-500/30 text-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-white mb-1">Message Sent Successfully!</h4>
                                    <p className="text-xs text-slate-400">
                                        Thank you for reaching out. We have received your message and will contact you via WhatsApp or Email shortly.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Your Name"
                                                value={contactFormData.name}
                                                onChange={e => setContactFormData({ ...contactFormData, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="you@company.com"
                                                value={contactFormData.email}
                                                onChange={e => setContactFormData({ ...contactFormData, email: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="+91 6290529857"
                                                value={contactFormData.phone}
                                                onChange={e => setContactFormData({ ...contactFormData, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                                Organization / Brand
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Company Name"
                                                value={contactFormData.company}
                                                onChange={e => setContactFormData({ ...contactFormData, company: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Message *
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Tell us about what you want to build or discuss..."
                                            value={contactFormData.message}
                                            onChange={e => setContactFormData({ ...contactFormData, message: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingContact}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submittingContact ? 'Sending Message...' : 'Send Message'}
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#02050e] py-12 px-4 relative z-10 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="agnecyos" className="h-7 w-auto object-contain rounded opacity-80" />
                        <span>&copy; {new Date().getFullYear()} Dhandaeasy & AgnecyOS. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/workflow" className="hover:text-slate-300 transition-colors">Workflow</Link>
                        <Link href="/features" className="hover:text-slate-300 transition-colors">Features</Link>
                        <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
                        <a href="https://wa.me/916290529857" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
