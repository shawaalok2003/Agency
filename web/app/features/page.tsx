'use client';

import React from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
    return (
        <div className="bg-[#030712] text-slate-300 font-sans overflow-x-hidden min-h-screen selection:bg-indigo-500 selection:text-white">
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .bento-glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }
                .bento-glass:hover {
                    border-color: rgba(30, 19, 236, 0.4);
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 20px rgba(30, 19, 236, 0.1);
                }
                .glow-orb {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    filter: blur(120px);
                    z-index: 0;
                    opacity: 0.15;
                }
                .glow-bg-indigo {
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                }
                .glow-bg-emerald {
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
                }
            `}</style>

            {/* Atmospheric Background Elements (Matching Landing Page) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] glow-bg-indigo"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] glow-bg-emerald"></div>
                {/* Retain original accent blobs but soften them or integrate them */}
                <div className="glow-orb bg-[#1e13ec] top-[-100px] left-[-100px] opacity-20"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Top Navigation (Landing Page Style) */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
                    <div className="glass max-w-7xl w-full flex items-center justify-between px-8 py-4 rounded-full">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <Link href="/" className="text-white text-xl font-bold tracking-tight">Agency OS</Link>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/workflow" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Workflow</Link>
                            <Link href="/features" className="text-white text-sm font-medium transition-colors">Features</Link>
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

                {/* Main Content */}
                <main className="flex-1 max-w-7xl mx-auto px-6 pt-48 pb-24 w-full">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                                Agency OS Bento Features
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                A high-performance operating system designed for modern creative agencies. Scale your operations with modular, data-driven intelligence.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="bg-white/5 border border-[rgba(255,255,255,0.05)] hover:bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all">
                                View Documentation
                            </button>
                        </div>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 grid-rows-auto gap-4 lg:gap-6 h-auto">

                        {/* Financial Intelligence (Large Card) */}
                        <div className="bento-glass rounded-xl p-8 col-span-1 md:col-span-4 lg:col-span-4 lg:row-span-2 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#1e13ec]/20 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#1e13ec]">
                                                <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0zm9.75-12c.831 0 1.62.13 2.36.37l-2.36 2.37V1.5zM15 4.5l-2.25 2.25a.75.75 0 01-1.06-1.06l2.25-2.25a8.22 8.22 0 011.06 1.06zM6.75 6.75a.75.75 0 011.06-1.06l2.25 2.25a.75.75 0 01-1.06 1.06L6.75 6.75z" clipRule="evenodd" />
                                                <path d="M12.75 9.75V3a9.71 9.71 0 014.654 2.846l-4.654 3.904zM16.5 9.75l2.25-2.25a.75.75 0 011.06 1.06l-2.25 2.25a.75.75 0 01-1.06-1.06z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold">Financial Intelligence</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">$1,284,500</p>
                                        <p className="text-green-400 text-sm font-medium flex items-center justify-end">
                                            <span className="text-sm">↗</span> +15.4%
                                        </p>
                                    </div>
                                </div>
                                {/* Chart Visualization */}
                                <div className="grid grid-cols-12 gap-2 h-48 items-end px-2 mb-4">
                                    {[60, 45, 75, 65, 30, 90, 85, 55, 100, 40, 70, 80].map((h, i) => (
                                        <div key={i} className={`bg-[#1e13ec]/${i % 2 === 0 ? '40' : '60'} rounded-t-lg hover:bg-[#1e13ec]/80 transition-all cursor-help relative group`} style={{ height: `${h}%` }}>
                                            {i === 0 && (
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded hidden group-hover:block whitespace-nowrap">$84k</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Advanced predictive analytics that help you forecast cash flow, track profit margins, and manage agency expenses in real-time.
                                </p>
                            </div>
                        </div>

                        {/* Team Performance (Medium Card) */}
                        <div className="bento-glass rounded-xl p-8 col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-400">
                                            <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                                            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold">Team Performance</h3>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { name: 'Alex Rivera', role: 'Product Design', cap: '84%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-ZKsup7mTaWkY05Rj-AgBfbxHI7CwZWgEWTJtOvRvi085WtXo9Z2AJUmkqasbqQ2-MfsD4Ck7jis_CKFqMjRDo7dwShHrWTeEbwH7i_cJdifsRGR0axD190D86VxOoSVTXgs8qsuVt7leV58Nxusfjue8nSUyJqrFXFoRWUpsRy9EWtvBp0RySxcTH_XhLlBuUMBCaZRa7o8ud_0aoq_b9JdHgUV9uCwqdZ49dJcbu5odlDkLZDZl2F6Kg6CC6fTQVLtZmBoDu9Y', status: 'bg-green-500' },
                                        { name: 'Sarah Chen', role: 'Engineering', cap: '92%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5yI9vhCgc7vJGu4Fm7GFlfOvUpPTW8XJx9w9yNyoFIdgBebUVMLAe5fwFNeuxHsCIsauC9-ljY0ItN3kEUoJ_iW2yWwTIXnmVQJNT2WMK6mi25DsgMA-AV_pc89ca-QllBWCecS0nopskhB-PZu9mI6fmsSNDvyp-le7epNzr_J6IAN9HaaVtpMe2QlSahnooUfO_DKrDpXHh733ewwIWTzwWBMdZQEWHMFpNBrKVOULQs1CP82w0e6-JE2h_FH--ereJieNj79o', status: 'bg-green-500' },
                                        { name: 'Marcus Wright', role: 'Strategy', cap: '45%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDC5wHcMGS55Ae2eN7KBMfQv6FZhMZUQ1Uk_RackkVZzT4rnjyBlv6FnigCx0hqr_4Vu1DHwkwHVSzK784cTw3UH6nyjdQ9zXUSr2ArsBottqCNWcFHRAxzE2PeN9juLjUoHg082MYczz65RwlbGZmMiAJbt_iuxK0qpGiAYxfZ0FJjIPA4LbHQ56KgvcVTtqYMLBQ8yzWOOgU0VHyeYwnhghV35pVSgvfSzswMXl460bDee6Ry1dlHnDcegXnK50SXQVoOegKorHE', status: 'bg-yellow-500' },
                                        { name: 'Jordan Lee', role: 'Management', cap: '68%', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJvC8r_hBxkbvD7DQBE-UPXf7mppuKAMmmMIf0VHWKPHTWKifo47fjl2m1510sqnMRGPNjBByYWXg7gTqykp-Ilqn3FCW56cyr34bkE5R-1NdLEwG5Dih_92nK3IJ5Kvf3_9hzGeCwAuMh7lT2W_fk2m38UWOjBDsnvBvnQErmdA-aIpjmAhGubaAoyZSzN30GaTxZ-kDu1u1SeuLI07Ay1xz8vaWwfgG70TBhwL0tFrA9XAWG0hygQh7gcdqNeFnw6LsW2nE2p0', status: 'bg-green-500' },
                                    ].map((member, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-[rgba(255,255,255,0.05)]" style={{ backgroundImage: `url('${member.img}')` }}></div>
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${member.status} rounded-full border-2 border-[#050505]`}></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.name}</p>
                                                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono text-[#1e13ec]">{member.cap} Capacity</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                                <p className="text-gray-400 text-sm">Real-time activity feeds and automated workload balancing.</p>
                            </div>
                        </div>

                        {/* Global Search (Small Card) */}
                        <div className="bento-glass rounded-xl p-6 col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
                                        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold">Global Search</h3>
                            </div>
                            <div className="bg-white/5 border border-[rgba(255,255,255,0.05)] rounded-lg p-3 flex items-center justify-between mb-4">
                                <span className="text-xs text-gray-500">Quick action...</span>
                                <div className="flex gap-1">
                                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-300 font-mono">⌘</span>
                                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-gray-300 font-mono">K</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs">Search across files, projects, and people instantly.</p>
                        </div>

                        {/* API Access (Small Card) */}
                        <div className="bento-glass rounded-xl p-6 col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#1e13ec]/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#1e13ec]">
                                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28-.53a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-2.25 2.25z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold">API Access</h3>
                            </div>
                            <div className="font-mono text-[10px] text-[#1e13ec] bg-[#1e13ec]/5 p-3 rounded-lg mb-4 overflow-hidden whitespace-nowrap border border-[#1e13ec]/10">
                                GET /v1/agency/projects
                            </div>
                            <p className="text-gray-400 text-xs">Connect your custom stack with our robust GraphQL & REST APIs.</p>
                        </div>

                        {/* Custom Branding (Small Card) */}
                        <div className="bento-glass rounded-xl p-6 col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-pink-500/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-pink-400">
                                        <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 00-3.471 2.987 10.04 10.04 0 014.815 4.815 18.748 18.748 0 002.987-3.472l3.386-5.079A1.902 1.902 0 0020.599 1.5zm-8.3 14.025a18.76 18.76 0 001.886.954.75.75 0 000-1.215 19.096 19.096 0 00-1.886-.954zm-2.25.954a18.76 18.76 0 00-1.886-.954.75.75 0 000 1.215 19.096 19.096 0 001.886.954z" clipRule="evenodd" />
                                        <path d="M5.4 18.764L1.734 22.09a.75.75 0 001.09 1.03l2.844-3.553a.75.75 0 00-1.268-.803zM16.48 4.225l-2.455 1.637a11.536 11.536 0 00-3.542 3.542 11.536 11.536 0 00-1.638 2.455.75.75 0 001.248.832 10.036 10.036 0 011.383-2.074 10.036 10.036 0 012.074-1.383.75.75 0 00-.832-1.248zM12 21.75a9.75 9.75 0 01-9.75-9.75.75.75 0 00-1.5 0 11.25 11.25 0 1011.25 11.25.75.75 0 000-1.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold">Custom Branding</h3>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <div className="w-6 h-6 rounded-full bg-[#1e13ec] ring-2 ring-white/20"></div>
                                <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                                <div className="w-6 h-6 rounded-full bg-pink-500"></div>
                                <div className="w-6 h-6 rounded-full bg-orange-400"></div>
                                <div className="w-6 h-6 rounded-full bg-emerald-400"></div>
                            </div>
                            <p className="text-gray-400 text-xs">White-label your dashboard to match your agency's visual identity.</p>
                        </div>
                    </div>

                    {/* Bottom CTA Section */}
                    <div className="mt-20 bento-glass rounded-2xl p-12 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#1e13ec]/5 group-hover:bg-[#1e13ec]/10 transition-colors"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to optimize your agency?</h2>
                            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                                Join 500+ top-tier agencies already using OS to drive their growth and manage their creative talent.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/login">
                                    <button className="w-full sm:w-auto bg-[#1e13ec] hover:bg-[#1e13ec]/90 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105">
                                        Start Your Free Trial
                                    </button>
                                </Link>
                                <button className="w-full sm:w-auto bg-white/5 border border-[rgba(255,255,255,0.05)] hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all">
                                    Talk to Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-auto px-8 lg:px-20 py-12 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-[#1e13ec] rounded flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <p className="text-sm font-bold">Agency OS</p>
                            <p className="text-gray-500 text-sm ml-4 border-l border-[rgba(255,255,255,0.05)] pl-4">© 2024 Agency OS Inc.</p>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-500">
                            <a className="hover:text-white transition-colors" href="#">Privacy</a>
                            <a className="hover:text-white transition-colors" href="#">Terms</a>
                            <a className="hover:text-white transition-colors" href="#">Twitter</a>
                            <a className="hover:text-white transition-colors" href="#">LinkedIn</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
