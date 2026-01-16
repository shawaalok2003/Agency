'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, CheckCircle } from 'lucide-react'; // Assuming lucide-react is available, otherwise will use SVGs if needed

export default function WorkflowPage() {
    return (
        <div className="bg-[#030712] text-slate-300 font-sans min-h-screen relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(80, 72, 229, 0.15);
                }
                .glow-indigo {
                    box-shadow: 0 0 30px rgba(80, 72, 229, 0.2);
                }
                .glow-bg-indigo {
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                }
                .glow-bg-emerald {
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
                }
                .step-connector {
                    background: linear-gradient(180deg, #5048e5 0%, rgba(80, 72, 229, 0) 100%);
                    width: 2px;
                    height: 100px;
                    margin: 0 auto;
                }
                html {
                    scroll-behavior: smooth;
                }
            `}</style>

            {/* Background Glows (Matching Landing Page) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] glow-bg-indigo"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] glow-bg-emerald"></div>
            </div>

            {/* Top Navigation (Landing Page Style) */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                <div className="glass max-w-7xl w-full flex items-center justify-between px-8 py-4 rounded-full">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Layers size={20} className="text-white" />
                        </div>
                        <Link href="/" className="text-white text-xl font-bold tracking-tight">Agency OS</Link>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/workflow" className="text-white text-sm font-medium transition-colors">Workflow</Link>
                        <Link href="/features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</Link>
                        <Link href="/pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <button className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Login</button>
                        </Link>
                        <Link href="/login">
                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-48 pb-24">
                {/* Hero Intro */}
                <div className="max-w-4xl mx-auto px-6 text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-[#5048e5]/10 text-[#5048e5] text-xs font-bold uppercase tracking-wider mb-6">Workflow Details</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        One System to Rule Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5048e5] to-indigo-400">Whole Agency</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Stop juggling tools. From the first handshake to the final invoice, Agency OS orchestrates your entire operation in a single unified workspace.
                    </p>
                </div>

                {/* Sticky Secondary Nav */}
                <div className="sticky top-24 z-40 mb-20 px-4">
                    <div className="max-w-fit mx-auto glass-card rounded-full p-1.5 flex gap-1 bg-black/40 backdrop-blur-xl border border-white/10">
                        <a className="px-6 py-2 rounded-full text-sm font-bold bg-[#5048e5] text-white shadow-lg shadow-[#5048e5]/30 hover:opacity-90 transition-opacity" href="#pipeline">Pipeline</a>
                        <a className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors" href="#deliverables">Deliverables</a>
                        <a className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors" href="#portal">Client Portal</a>
                        <a className="px-6 py-2 rounded-full text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors" href="#payments">Payments</a>
                    </div>
                </div>

                {/* Workflow Sections Container */}
                <div className="max-w-6xl mx-auto px-6 space-y-24">
                    {/* Step 1: Pipeline */}
                    <section className="scroll-mt-40" id="pipeline">
                        <div className="glass-card rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden bg-[#0a0f1e]">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#5048e5]/10 blur-[100px] rounded-full"></div>
                            <div className="flex-1 space-y-6 relative z-10">
                                <div className="flex items-center gap-4 text-[#5048e5]">
                                    <span className="text-xs font-bold px-2 py-1 border border-[#5048e5]/30 rounded uppercase tracking-widest">Step 01</span>
                                    <div className="h-px flex-1 bg-[#5048e5]/20"></div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Master Your Pipeline</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Convert leads into loyal clients with high-velocity sales automation. Our CRM doesn't just track contacts—it moves them forward automatically.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        'Unified lead capture from 20+ sources',
                                        'Automated email nurturing & follow-ups',
                                        'Drag-and-drop visual deal pipelines'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                            <span className="font-medium text-slate-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full max-w-md relative z-10">
                                <div className="aspect-video glass-card rounded-lg overflow-hidden relative glow-indigo group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#5048e5]/20 to-transparent opacity-50"></div>
                                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDdOPcndIYdNkO9DrFaYIamNNJYU9uGVqScWcZDZ6m9eIY7_lEBhV3mis_rDJVgmpfIqRIAvwcFj4wGXndl0Ff2N_KajhfQ3VgTaxeAK-J15j_Q9KZqyHeF9Ix0TbHfKIQqWy60LbenyPMUyoEWHg4FVUR59g8RxnacqIlJqg8S4W7EvfeDT8qIWvUhZXqK5dpPLeHCWfBPfWCw1TsgMr-LC0F5izSjh65Rmex_5ZCI9V6CPOUjaCE-Ltom-2ueCWRHYanlrd0sII')" }}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="step-connector"></div>
                    </section>

                    {/* Step 2: Deliverables */}
                    <section className="scroll-mt-40" id="deliverables">
                        <div className="glass-card rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row-reverse gap-12 items-center relative overflow-hidden bg-[#0a0f1e]">
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                            <div className="flex-1 space-y-6 relative z-10">
                                <div className="flex items-center gap-4 text-[#5048e5]">
                                    <span className="text-xs font-bold px-2 py-1 border border-[#5048e5]/30 rounded uppercase tracking-widest">Step 02</span>
                                    <div className="h-px flex-1 bg-[#5048e5]/20"></div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Unrivaled Deliverables</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Stop manual task creation. When a contract is signed, Agency OS automatically builds the project structure, assigns leads, and sets deadlines.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        'Project blueprint templates for instant setup',
                                        'Smart resource allocation & capacity tracking',
                                        'Kanban, List, and Timeline project views'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                            <span className="font-medium text-slate-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full max-w-md relative z-10">
                                <div className="aspect-video glass-card rounded-lg overflow-hidden relative glow-indigo group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#5048e5]/20 to-transparent opacity-50"></div>
                                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0Fy65sJswmdYzHleI_1khcVtLLmVHO0PNI2SaFlgGZemL_UJlJQJAF_06vz3jrHkqqKKyseWf55zUOK6NMaP2nF5WS_TURkR_cxzRK7cpseNZkxSKs9r6kqlEqJkyK6mnGkcxGbQzdXs76kIPbX1ldcQjLnxfDhokinE4Jw1bUwcr0Qtcs8TeM-nVLT0OitZV_5nyLzDAXlTR5ZUky-5lu0Pd6ioewcW7hdnh5952nvVldfqCQimdKyi-NIN70fm93TGVo7Dx1SE')" }}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="step-connector"></div>
                    </section>

                    {/* Step 3: Client Portal */}
                    <section className="scroll-mt-40" id="portal">
                        <div className="glass-card rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden bg-[#0a0f1e]">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#5048e5]/10 blur-[100px] rounded-full"></div>
                            <div className="flex-1 space-y-6 relative z-10">
                                <div className="flex items-center gap-4 text-[#5048e5]">
                                    <span className="text-xs font-bold px-2 py-1 border border-[#5048e5]/30 rounded uppercase tracking-widest">Step 03</span>
                                    <div className="h-px flex-1 bg-[#5048e5]/20"></div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">The Client Experience</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    A white-labeled space for your clients to feel at home. Transparent progress, easy file sharing, and 1-click approvals eliminate email threads.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        'Fully white-labeled custom domain portal',
                                        'Shared asset libraries & cloud storage',
                                        'Real-time collaboration & feedback loops'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                            <span className="font-medium text-slate-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full max-w-md relative z-10">
                                <div className="aspect-video glass-card rounded-lg overflow-hidden relative glow-indigo group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#5048e5]/20 to-transparent opacity-50"></div>
                                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNwdwWJtCPDKK5k55vP4RLKt53rLh9EEmh0-jJz6OpZeGA5qMLPgFbOgpHdxqFgtW4QVSUHnsZyQQ3EgoQ1Bv9Hyxb8Zrn1jlDJubAbTXYKlnwTvI3vNDWZ-OncPrbdduZPfAFLfDP0PyabPaSIBstU3e3G8nBmhOI7L0eABNt26S60sxaGgWC8m5J__vQqHHH5PikDg5q3npnVVcOlJbeFMtv6l0DX364escAFstyQRpLYAv3I__r2XNlxPG7lPj7CDVj07rFoG8')" }}>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="step-connector"></div>
                    </section>

                    {/* Step 4: Payments */}
                    <section className="scroll-mt-40" id="payments">
                        <div className="glass-card rounded-xl p-8 lg:p-12 flex flex-col lg:flex-row-reverse gap-12 items-center relative overflow-hidden bg-[#0a0f1e]">
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
                            <div className="flex-1 space-y-6 relative z-10">
                                <div className="flex items-center gap-4 text-[#5048e5]">
                                    <span className="text-xs font-bold px-2 py-1 border border-[#5048e5]/30 rounded uppercase tracking-widest">Step 04</span>
                                    <div className="h-px flex-1 bg-[#5048e5]/20"></div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Frictionless Finance</h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Stop chasing invoices. Automate recurring billing, collect payments via Stripe or PayPal, and view your agency's financial health in real-time.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        'Automated recurring subscription billing',
                                        'Instant financial reporting & MRR tracking',
                                        'Multi-currency & tax compliance built-in'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                            <span className="font-medium text-slate-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full max-w-md relative z-10">
                                <div className="aspect-video glass-card rounded-lg overflow-hidden relative glow-indigo group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#5048e5]/20 to-transparent opacity-50"></div>
                                    <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4AuomK3ISM54T_QIx-TESZ4S-sX-8IEKjfb-4nEGB36FAuLDmLWHVfsqXa49ARGnTc7uUD9ZVn5sqTnD8jUc-3STQdOA5zI_prcwc9SRxVL5__XT5UVHT26G2LvOKoco5Lndg9suelgDHe45Awab20vQ2KPVoprthkIBtGLcFmkypwzmXVV51uDoAnFJn3Kv935ROdlbf0l7k1_aObh4cc01Or6G71E3TgYISVVSuFMItOJjUcGb7RUAG66YQ8zVwKay6qJKrank')" }}>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer CTA */}
                <div className="mt-32 max-w-5xl mx-auto px-6">
                    <div className="bg-[#5048e5] rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-[#5048e5]/30">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight relative z-10">
                            Ready to install the operating<br />system for your growth?
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link href="/login">
                                <button className="bg-white text-[#5048e5] px-10 py-4 rounded-xl font-extrabold text-lg shadow-xl hover:scale-105 transition-transform w-full sm:w-auto">
                                    Get Agency OS Now
                                </button>
                            </Link>
                            <button className="bg-[#5048e5]/50 backdrop-blur-sm border border-white/20 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                                Book a Demo
                            </button>
                        </div>
                        <p className="mt-8 text-white/70 text-sm font-medium relative z-10">Join 1,200+ top-tier agencies already scaling on Agency OS.</p>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#5048e5]/20 rounded-lg flex items-center justify-center text-[#5048e5]">
                            <Layers size={18} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">Agency OS</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <a className="hover:text-[#5048e5] transition-colors" href="#">Twitter</a>
                        <a className="hover:text-[#5048e5] transition-colors" href="#">LinkedIn</a>
                        <a className="hover:text-[#5048e5] transition-colors" href="#">Terms</a>
                        <a className="hover:text-[#5048e5] transition-colors" href="#">Privacy</a>
                    </div>
                    <p className="text-sm text-slate-500">© 2024 Agency OS Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
