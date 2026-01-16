'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="bg-[#030712] text-slate-300 font-sans min-h-screen relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .hero-gradient-text {
                    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .glow-indigo {
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                }
                .glow-emerald {
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
                }
                .tilted-dashboard {
                    transform: perspective(1000px) rotateX(10deg) rotateY(-10deg) rotateZ(2deg);
                    box-shadow: -20px 20px 50px rgba(0, 0, 0, 0.5);
                }
                .bento-card {
                    @apply glass rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative;
                }
            `}</style>

            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] glow-indigo"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] glow-emerald"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                <div className="glass max-w-7xl w-full flex items-center justify-between px-8 py-4 rounded-full">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            {/* Rocket Icon Replacement */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                <path fillRule="evenodd" d="M9.315 2.894a43.08 43.08 0 0110.873 5.346l.004.002.003.003v.001l.001.001v.001a44.026 44.026 0 01-3.619 11.233.75.75 0 01-.735.485c-.947 0-1.874-.066-2.778-.19l-.353-.049-2.025-4.502.663-3.644-2.766-2.073-1.63 3.398-3.085.343a24.288 24.288 0 01-1.488-8.156.75.75 0 01.62-.843c1.782-.26 3.73-.393 5.776-.393.18 0 .363.001.547.004h.001zM4.25 10.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3zM15 16.5a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-bold tracking-tight">Agency OS</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/workflow" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Workflow</Link>
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

            <main className="relative pt-48 pb-32 px-4">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20 animate-fade-in-up">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                            Redefining Agency Ops
                        </div>
                        <h1 className="hero-gradient-text text-5xl md:text-7xl font-black leading-[1.05] tracking-tight animate-fade-in-up delay-100">
                            The Operating System for Modern Agencies
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200">
                            Unify your projects, clients, and financials in one ultra-high-performance interface. Built for teams that scale fast.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
                            <Link href="/login">
                                <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] transition-all w-full sm:w-auto animate-pulse-slow">
                                    Start 14-Day Free Trial
                                </button>
                            </Link>
                            <button className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto border border-white/10 hover:border-white/20">
                                Book a Demo
                            </button>
                        </div>
                    </div>
                    <div className="relative group mt-12 lg:mt-0 animate-fade-in-up delay-300">
                        <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full animate-pulse-slow"></div>
                        <div className="tilted-dashboard glass p-2 rounded-[2rem] overflow-hidden border border-white/10 animate-float">
                            <div className="w-full aspect-[4/3] bg-slate-900 rounded-[1.5rem] bg-cover bg-center overflow-hidden relative">
                                {/* Mockup Content Placeholder or Image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                    <img src="/images/image.png" alt="Dashboard Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -left-8 glass p-6 rounded-2xl hidden md:block border border-white/10 shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                        <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 01.968-.432l5.942 2.28a.75.75 0 01.431.97l-2.28 5.941a.75.75 0 11-1.4-.537l1.63-4.251-1.086.483a6 6 0 00-2.738 7.056L19.5 20.25l-.75.75-2.55-2.763a6 6 0 00-7.056-2.738l-.75 3.518a.75.75 0 11-1.47-.297l.75-3.518a7.5 7.5 0 013.417-8.82l.607-2.853z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-white font-bold">+124% Efficiency</div>
                                    <div className="text-slate-500 text-xs uppercase font-bold tracking-tighter">Average Agency Growth</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="py-32 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-white text-4xl md:text-5xl font-black tracking-tight mb-4">Engineered for your workflow</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Four stages of mastery to take your agency from chaos to control.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Pipeline', icon: 'view_kanban', desc: 'Visualize every lead from first contact to signed contract with smart Kanban automation.', step: '01' },
                            { title: 'Deliverables', icon: 'layers', desc: 'Centralize project tasks and assets. Keep your production team aligned and moving fast.', step: '02' },
                            { title: 'Client Portal', icon: 'share', desc: 'A white-labeled destination for approvals, communication, and shared documentation.', step: '03' },
                            { title: 'Payments', icon: 'credit_card', desc: 'Auto-generate invoices and collect recurring revenue without lifting a finger.', step: '04' },
                        ].map((item, i) => (
                            <div key={i} className="glass p-8 rounded-[2rem] relative group hover:border-indigo-500/50 transition-all border border-white/5 bg-[#0a0d16]">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 font-bold text-2xl">
                                    {/* Using simple placeholder logic for icons or lucide if available, sticking to emojis/svgs for standalone safety */}
                                    {i === 0 ? '⊞' : i === 1 ? '📚' : i === 2 ? '🌐' : '💳'}
                                </div>
                                <h3 className="text-white text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                <div className="absolute top-8 right-8 text-white/5 text-6xl font-black">{item.step}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 px-4 bg-slate-950/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                        <div className="md:col-span-7 glass rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-white/5 bg-[#0a0f1e]">
                            <div className="z-10">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 font-bold text-xl">
                                    $
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-4 leading-tight">Financial Intelligence</h3>
                                <p className="text-slate-400 max-w-md text-lg">Track real-time profitability, overhead, and margins for every client project automatically.</p>
                            </div>
                            <div className="mt-8 z-10">
                                <div className="flex gap-2">
                                    <div className="h-1.5 w-12 rounded-full bg-emerald-500"></div>
                                    <div className="h-1.5 w-6 rounded-full bg-emerald-500/30"></div>
                                    <div className="h-1.5 w-6 rounded-full bg-emerald-500/30"></div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-5 glass rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-white/5 bg-[#0a0f1e]">
                            <div className="z-10">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 font-bold text-xl">
                                    ∞
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Unlimited Projects</h3>
                                <p className="text-slate-400">Scale without limits. No per-project fees, no matter how large your roster grows.</p>
                            </div>
                            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/10 blur-3xl"></div>
                        </div>
                        <div className="md:col-span-5 glass rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-white/5 bg-[#0a0f1e]">
                            <div className="z-10">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 font-bold text-xl">
                                    👥
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">Team Collaboration</h3>
                                <p className="text-slate-400">Integrated team chat and resource planning to avoid burnout and maximize output.</p>
                            </div>
                        </div>
                        <div className="md:col-span-7 glass rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-white/5 bg-gradient-to-br from-indigo-900/20 to-transparent">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                                <div className="text-center md:text-left">
                                    <div className="text-5xl font-black text-white mb-2">99.9%</div>
                                    <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">Uptime Guaranteed</p>
                                </div>
                                <div className="flex -space-x-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800"></div>
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-700"></div>
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-600"></div>
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">+5k</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 glow-indigo opacity-30"></div>
                <div className="glass p-16 md:p-24 rounded-[3.5rem] relative overflow-hidden border border-white/10">
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-white text-5xl md:text-6xl font-black tracking-tight leading-tight">
                            Start your 14-day free trial.<br />No credit card required.
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                            Experience the future of agency management. Join 2,000+ teams who have optimized their operations with Agency OS.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href="/login">
                                <button className="w-full sm:w-auto px-12 py-5 bg-white text-[#030712] font-black text-lg rounded-2xl hover:bg-slate-200 transition-all shadow-xl">
                                    Get Started Now
                                </button>
                            </Link>
                            <button className="w-full sm:w-auto px-12 py-5 glass text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                                Talk to an Expert
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-6 pt-4">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <span className="text-emerald-500 text-lg">✓</span>
                                Instant Setup
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <span className="text-emerald-500 text-lg">✓</span>
                                Full Access
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 relative">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                    <path fillRule="evenodd" d="M9.315 2.894a43.08 43.08 0 0110.873 5.346l.004.002.003.003v.001l.001.001v.001a44.026 44.026 0 01-3.619 11.233.75.75 0 01-.735.485c-.947 0-1.874-.066-2.778-.19l-.353-.049-2.025-4.502.663-3.644-2.766-2.073-1.63 3.398-3.085.343a24.288 24.288 0 01-1.488-8.156.75.75 0 01.62-.843c1.782-.26 3.73-.393 5.776-.393.18 0 .363.001.547.004h.001zM4.25 10.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3zM15 16.5a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="text-white text-xl font-bold">Agency OS</h2>
                        </div>
                        <p className="text-slate-500 max-w-sm">The world's most advanced agency management platform for teams that demand excellence.</p>
                    </div>
                    {/* Footers links */}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/5">
                    <p className="text-slate-500 text-sm">© 2024 Agency OS. Built for the modern web.</p>
                </div>
            </footer>
        </div>
    );
}
