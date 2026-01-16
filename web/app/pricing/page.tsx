'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

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
                    border: 1px solid rgba(255, 255, 255, 0.1);
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
                .pro-glow {
                    box-shadow: 0 0 40px -10px rgba(80, 72, 229, 0.4);
                    border: 1px solid rgba(80, 72, 229, 0.5);
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20;
                }
            `}</style>

            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] glow-indigo"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] glow-emerald"></div>
            </div>

            {/* Navigation (Floating Pill from LandingPage) */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                <div className="glass max-w-7xl w-full flex items-center justify-between px-8 py-4 rounded-full">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                                <path fillRule="evenodd" d="M9.315 2.894a43.08 43.08 0 0110.873 5.346l.004.002.003.003v.001l.001.001v.001a44.026 44.026 0 01-3.619 11.233.75.75 0 01-.735.485c-.947 0-1.874-.066-2.778-.19l-.353-.049-2.025-4.502.663-3.644-2.766-2.073-1.63 3.398-3.085.343a24.288 24.288 0 01-1.488-8.156.75.75 0 01.62-.843c1.782-.26 3.73-.393 5.776-.393.18 0 .363.001.547.004h.001zM4.25 10.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3zM15 16.5a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <Link href="/" className="text-white text-xl font-bold tracking-tight">Agency OS</Link>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/workflow" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Workflow</Link>
                        <Link href="/features" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Features</Link>
                        <Link href="/pricing" className="text-white text-sm font-medium transition-colors">Pricing</Link>
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

            <main className="max-w-7xl mx-auto px-6 py-48 relative">
                {/* Page Heading */}
                <div className="text-center mb-16">
                    <h1 className="hero-gradient-text text-5xl md:text-7xl font-black tracking-tight mb-6">Scalable Pricing for <br /><span className="text-indigo-500">Modern Agencies</span></h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        The all-in-one operating system for your creative business. Choose a plan that grows with your team.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-20">
                    <div className="relative flex items-center p-1 bg-white/5 rounded-xl w-fit border border-white/10">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${billingInterval === 'monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${billingInterval === 'yearly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white'}`}
                        >
                            Yearly
                        </button>
                        <div className="absolute -right-24 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-500/20">
                            Save 20%
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-32">
                    {/* Starter */}
                    <div className="glass-card rounded-3xl p-8 flex flex-col h-fit transition-transform hover:-translate-y-2">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2 text-white">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">${billingInterval === 'monthly' ? '49' : '39'}</span>
                                <span className="text-slate-500 text-sm font-medium">/mo</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-4 leading-relaxed">Perfect for solo practitioners and small teams just starting out.</p>
                        </div>
                        <Link href="/login">
                            <button className="w-full py-4 px-6 rounded-xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-all mb-8 border border-white/5 text-white">
                                Get Started
                            </button>
                        </Link>
                        <div className="space-y-4">
                            {[
                                'Up to 5 Projects',
                                'Basic CRM Tools',
                                '2 Team Seats',
                                'Community Support'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro (Featured) */}
                    <div className="glass-card pro-glow rounded-3xl p-8 flex flex-col relative md:scale-110 z-10 bg-[#0b0f19]/80 transition-transform hover:-translate-y-2">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-lg shadow-indigo-600/20">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2 text-white">Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-6xl font-black text-white">${billingInterval === 'monthly' ? '99' : '79'}</span>
                                <span className="text-slate-500 text-sm font-medium">/mo</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-4 leading-relaxed">Everything you need to scale your agency operations effectively.</p>
                        </div>
                        <Link href="/login">
                            <button className="w-full py-4 px-6 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 mb-8">
                                Start 14-Day Free Trial
                            </button>
                        </Link>
                        <div className="space-y-4">
                            {[
                                'Unlimited Projects',
                                'Advanced Automation',
                                '10 Team Seats',
                                'Priority Email Support',
                                'Custom Workflows'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-semibold text-white">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enterprise */}
                    <div className="glass-card rounded-3xl p-8 flex flex-col h-fit transition-transform hover:-translate-y-2">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2 text-white">Enterprise</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">Custom</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-4 leading-relaxed">Tailored solutions for large-scale creative agencies with custom needs.</p>
                        </div>
                        <button className="w-full py-4 px-6 rounded-xl bg-white/5 text-sm font-bold hover:bg-white/10 transition-all mb-8 border border-white/5 text-white">
                            Contact Sales
                        </button>
                        <div className="space-y-4">
                            {[
                                'White-label Portal',
                                'Unlimited Seats',
                                'Dedicated Success Manager',
                                'SSO & SAML Security'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Comparison Table Section */}
                <div className="mb-32">
                    <h2 className="text-3xl font-bold mb-12 text-center text-white">Compare Plan Features</h2>
                    <div className="overflow-x-auto rounded-3xl glass-card border border-white/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Features</th>
                                    <th className="p-6 text-sm font-bold text-center text-white">Starter</th>
                                    <th className="p-6 text-sm font-bold text-center text-indigo-400">Pro</th>
                                    <th className="p-6 text-sm font-bold text-center text-white">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-sm text-slate-300">Active Projects</td>
                                    <td className="p-6 text-sm text-center text-slate-300">5</td>
                                    <td className="p-6 text-sm text-center font-bold text-white">Unlimited</td>
                                    <td className="p-6 text-sm text-center text-slate-300">Unlimited</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-sm text-slate-300">CRM & Pipeline</td>
                                    <td className="p-6 text-sm text-center"><span className="material-symbols-outlined text-emerald-500 text-lg">check</span></td>
                                    <td className="p-6 text-sm text-center"><span className="material-symbols-outlined text-emerald-500 text-lg">check</span></td>
                                    <td className="p-6 text-sm text-center"><span className="material-symbols-outlined text-emerald-500 text-lg">check</span></td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-sm text-slate-300">Financial Reporting</td>
                                    <td className="p-6 text-sm text-center text-slate-300">Basic</td>
                                    <td className="p-6 text-sm text-center font-bold text-white">Advanced</td>
                                    <td className="p-6 text-sm text-center text-slate-300">Custom</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-sm text-slate-300">Automations</td>
                                    <td className="p-6 text-sm text-center text-slate-500">—</td>
                                    <td className="p-6 text-sm text-center font-bold text-white">Unlimited</td>
                                    <td className="p-6 text-sm text-center text-slate-300">Unlimited</td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-sm text-slate-300">White-labeling</td>
                                    <td className="p-6 text-sm text-center text-slate-500">—</td>
                                    <td className="p-6 text-sm text-center text-slate-500">—</td>
                                    <td className="p-6 text-sm text-center"><span className="material-symbols-outlined text-emerald-500 text-lg">check</span></td>
                                </tr>
                                <tr className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6 text-sm text-slate-300">Support</td>
                                    <td className="p-6 text-sm text-center text-slate-300">Email</td>
                                    <td className="p-6 text-sm text-center font-bold text-white">Priority</td>
                                    <td className="p-6 text-sm text-center text-slate-300">24/7 Phone</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center text-white">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="glass-card rounded-2xl p-6 cursor-pointer group hover:border-indigo-500/50 transition-all border border-white/5">
                            <details className="group">
                                <summary className="flex items-center justify-between list-none cursor-pointer">
                                    <h4 className="font-bold text-white">Can I switch plans later?</h4>
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-indigo-500 transition-colors group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="mt-4 text-sm text-slate-400 leading-relaxed">
                                    Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                                </div>
                            </details>
                        </div>
                        <div className="glass-card rounded-2xl p-6 cursor-pointer group hover:border-indigo-500/50 transition-all border border-white/5">
                            <details className="group" open>
                                <summary className="flex items-center justify-between list-none cursor-pointer">
                                    <h4 className="font-bold text-white">Is there a free trial available?</h4>
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-indigo-500 transition-colors group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="mt-4 text-sm text-slate-400 leading-relaxed">
                                    Absolutely. We offer a 14-day free trial on the Pro plan so you can experience the full power of Agency OS before committing.
                                </div>
                            </details>
                        </div>
                        <div className="glass-card rounded-2xl p-6 cursor-pointer group hover:border-indigo-500/50 transition-all border border-white/5">
                            <details className="group">
                                <summary className="flex items-center justify-between list-none cursor-pointer">
                                    <h4 className="font-bold text-white">What kind of support do you offer?</h4>
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-indigo-500 transition-colors group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="mt-4 text-sm text-slate-400 leading-relaxed">
                                    Our data-driven support system includes community access for Starter plans, priority email for Pro, and dedicated phone support for Enterprise clients.
                                </div>
                            </details>
                        </div>
                        <div className="glass-card rounded-2xl p-6 cursor-pointer group hover:border-indigo-500/50 transition-all border border-white/5">
                            <details className="group">
                                <summary className="flex items-center justify-between list-none cursor-pointer">
                                    <h4 className="font-bold text-white">Do you offer discounts for non-profits?</h4>
                                    <span className="material-symbols-outlined text-slate-500 group-hover:text-indigo-500 transition-colors group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="mt-4 text-sm text-slate-400 leading-relaxed">
                                    Yes! We love supporting organizations that do good. Contact our sales team with proof of your non-profit status for a special discount.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
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
                    <div className="flex gap-8 text-sm text-slate-500 hover:text-white transition-colors">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/5">
                    <p className="text-slate-500 text-sm">© 2024 Agency OS. Built for the modern web.</p>
                </div>
            </footer>
        </div>
    );
}
