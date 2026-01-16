'use client';

import React, { useState } from 'react';
import {
    MessageSquare, Paperclip, AtSign, CheckCircle, AlertCircle,
    Maximize2, ChevronRight, Download, Clock, Send, FileText
} from 'lucide-react';

export default function ClientPortalPage({ params }: { params: { id: string } }) {
    const [feedback, setFeedback] = useState('');

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-indigo-500/30">
            {/* Top Navigation Bar */}
            <nav className="border-b border-white/5 bg-[#0f111a]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <div className="w-4 h-4 rounded-sm bg-white/20" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Agency OS</span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Project</span>
                            <ChevronRight size={14} />
                            <span className="text-white font-medium">Skyline Brand Refresh</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                            Client Portal
                        </span>
                        <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-[#1f2937] flex items-center justify-center overflow-hidden">
                            {/* Mock User Avatar */}
                            <span className="text-amber-800 font-bold text-xs">S</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        Active Projects <ChevronRight size={12} /> Skyline Refresh
                    </div>
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome back, Sarah.</h1>
                    <p className="text-gray-400 text-lg">Please review the latest Brand Identity assets for approval.</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Asset Preview (Spans 2 columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Asset Container */}
                        <div className="group relative aspect-video bg-[#0f111a] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center">
                            {/* Mock Asset Image/Preview */}
                            <div className="w-3/4 h-3/4 bg-[#1e293b] shadow-2xl rounded-lg flex items-center justify-center relative transform group-hover:scale-[1.01] transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-lg" />
                                <div className="text-center">
                                    <h3 className="text-3xl font-serif text-white/80 mb-2">Nulla vitae</h3>
                                    <p className="text-white/40 font-serif italic">Clean Typography System</p>
                                </div>
                            </div>

                            {/* Overlay Controls */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white backdrop-blur-sm transition-colors">
                                    <Download size={20} />
                                </button>
                            </div>
                            <div className="absolute bottom-6 left-6">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-sm font-medium transition-colors">
                                    <Maximize2 size={16} /> View Fullscreen
                                </button>
                            </div>
                        </div>

                        {/* Asset Meta Info */}
                        <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-xl border border-white/5">
                            <div>
                                <h3 className="font-bold text-white text-lg">Final Brand Identity - V2.4</h3>
                                <p className="text-gray-500 text-sm mt-1">Uploaded Oct 24, 2023 • 12.5 MB • PDF/SVG/PNG</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold border-2 border-[#0f111a]">JD</div>
                                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold border-2 border-[#0f111a]">MK</div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">2 Team Members active</span>
                            </div>
                        </div>

                        {/* History / Activity Log */}
                        <div>
                            <div className="flex justify-between items-end mb-4 mt-8">
                                <h3 className="font-bold text-white text-lg">Project History</h3>
                                <button className="text-indigo-400 text-sm hover:text-indigo-300 font-medium">View All Activity</button>
                            </div>

                            <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6">
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                            <CheckCircle size={12} fill="currentColor" className="text-emerald-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm">Feedback addressed from v2.3</h4>
                                        <p className="text-gray-500 text-xs mt-1">Oct 23, 2023 • Designer Mark</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions & Feedback */}
                    <div className="space-y-6">

                        {/* Actions Cards */}
                        <div className="grid gap-4">
                            {/* Approve Card */}
                            <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Approve Version</h3>
                                        <p className="text-gray-400 text-sm">Everything looks perfect</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                    Approve Now
                                </button>
                            </div>

                            {/* Request Changes Card */}
                            <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Request Changes</h3>
                                        <p className="text-gray-400 text-sm">Needs minor adjustments</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                                    Submit Revision Request
                                </button>
                            </div>
                        </div>

                        {/* Feedback Widget */}
                        <div className="bg-[#0f111a] p-6 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare size={18} className="text-indigo-400" />
                                <h3 className="font-bold text-white">Your Feedback</h3>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Add your thoughts or specific change requests here..."
                                    className="w-full h-32 bg-[#161b2e] border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
                                />
                                <div className="absolute bottom-3 left-3 flex gap-2">
                                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Attach">
                                        <Paperclip size={14} />
                                        <span className="sr-only">Attach</span>
                                    </button>
                                    <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Mention">
                                        <AtSign size={14} />
                                        <span className="sr-only">Mention</span>
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-24 text-[10px] text-gray-500 font-medium">Attach Reference | Mention</div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2">
                                    Send Message <Send size={14} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
