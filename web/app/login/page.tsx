'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/api/client';
import {
    ArrowRight, Lock, Mail, CheckCircle2,
    ArrowLeft, Globe, ArrowUpRight,
    Sparkles, Layers, BarChart3, Zap
} from 'lucide-react';

export default function Login() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!isLogin && password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin 
                ? { email: email.trim().toLowerCase(), password } 
                : { email: email.trim().toLowerCase(), password, role: 'OWNER' };
            
            const { data } = await api.post(endpoint, payload);

            if (data.token) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                setSuccessMessage(isLogin ? 'Login successful! Redirecting to dashboard...' : 'Account created! Redirecting to workspace...');
                setTimeout(() => {
                    router.push('/');
                }, 300);
            } else {
                setError('Authentication failed. No access token received.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || (isLogin ? 'Invalid email or password' : 'Registration failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[140px]" />
            </div>

            {/* ============================================================ */}
            {/* LEFT SIDE: Image Showcase & Go To Website Option (Desktop) */}
            {/* ============================================================ */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 relative bg-[#070b19]/90 border-r border-white/[0.08] overflow-hidden">
                {/* Subtle Grid Backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

                {/* Left Top Bar: Brand Logo & Go to Website Button */}
                <div className="flex items-center justify-between relative z-10">
                    <Link href="/" className="inline-block group">
                        <img
                            src="/logo.png"
                            alt="agnecyos"
                            className="h-9 w-auto object-contain rounded-lg border border-white/10 group-hover:border-indigo-500/40 transition-all shadow-md"
                        />
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-gray-200 hover:text-white transition-all shadow-sm group"
                    >
                        <Globe size={14} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                        <span>Go to Website</span>
                        <ArrowUpRight size={14} className="text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Left Middle: Hero Illustration & Features */}
                <div className="space-y-6 my-auto py-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                        <Sparkles size={13} className="text-indigo-400" />
                        <span>Next-Gen Operating System</span>
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Powering modern agencies from <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">pitch to profit.</span>
                    </h2>

                    <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                        agnecyos unifies sales CRM pipelines, live client deliverable approvals, GST compliant billing, and real-time profitability tracking.
                    </p>

                    {/* Showcase Image Frame */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/80 group mt-4 bg-[#0a0f24]">
                        <img
                            src="/auth-hero.jpg"
                            alt="agnecyos workspace preview"
                            className="w-full h-auto max-h-[380px] object-cover object-top transform group-hover:scale-[1.02] transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070b19] via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-gray-300 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-semibold text-white">Live Client Portal & Workflow Engine</span>
                            </div>
                            <span className="text-[11px] text-indigo-300 font-mono font-bold">v2.4 Pro</span>
                        </div>
                    </div>

                    {/* Value Proposition Pills */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs mb-1">
                                <Layers size={13} /> Approvals
                            </div>
                            <div className="text-[11px] text-gray-400">One-click client signs</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                                <Zap size={13} /> GST Billing
                            </div>
                            <div className="text-[11px] text-gray-400">Invoices & payments</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                            <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs mb-1">
                                <BarChart3 size={13} /> Margins
                            </div>
                            <div className="text-[11px] text-gray-400">Real-time ledger & ROI</div>
                        </div>
                    </div>
                </div>

                {/* Left Bottom Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-6 border-t border-white/[0.06] relative z-10">
                    <span>© 2026 agnecyos. All rights reserved.</span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> All systems operational
                    </span>
                </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT SIDE: Authentication Form (Direct Sign In & Sign Up) */}
            {/* ============================================================ */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-14 relative bg-[#030712] overflow-y-auto">
                {/* Right Top Bar: Mobile Logo & "Go to Website" link */}
                <div className="flex items-center justify-between w-full mb-6">
                    <div className="lg:hidden">
                        <Link href="/">
                            <img src="/logo.png" alt="agnecyos" className="h-8 w-auto rounded border border-white/10" />
                        </Link>
                    </div>

                    <div className="hidden lg:block">
                        <span className="text-xs text-gray-500 font-medium tracking-wide">
                            agnecyos Secure Access
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-sm group"
                    >
                        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span>Go to Website</span>
                    </Link>
                </div>

                {/* Form Card Container */}
                <div className="w-full max-w-md mx-auto my-auto py-4">
                    {/* Header Branding */}
                    <div className="text-center mb-7">
                        <img
                            src="/logo.png"
                            alt="agnecyos"
                            className="h-12 w-auto mx-auto mb-4 object-contain rounded-xl border border-white/10 shadow-xl shadow-indigo-500/20"
                        />
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {isLogin
                                ? 'Enter your credentials to access your agency workspace'
                                : 'Start your 14-day free trial with full Pro access'}
                        </p>
                    </div>

                    {/* Alerts & Notifications */}
                    {error && (
                        <div className="bg-red-500/10 text-red-200 p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-500/10 text-emerald-200 p-3.5 rounded-xl mb-5 text-sm flex items-center gap-2 border border-emerald-500/20">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">
                                Work Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="you@agnecyos.io"
                                    required
                                />
                                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                    minLength={isLogin ? 1 : 8}
                                />
                                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                            </div>
                            {!isLogin && (
                                <span className="text-[11px] text-gray-500 ml-1 mt-1 block">
                                    Password must be at least 8 characters
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer mt-2"
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Mode Toggle */}
                    <div className="mt-8 text-center border-t border-white/[0.08] pt-6">
                        <button
                            onClick={toggleMode}
                            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            {isLogin ? (
                                <>Don't have an account? <span className="text-indigo-400 font-semibold hover:underline">Sign up</span></>
                            ) : (
                                <>Already have an account? <span className="text-indigo-400 font-semibold hover:underline">Sign in</span></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Bottom Footer Note */}
                <div className="text-center text-[11px] text-gray-500 pt-6">
                    By signing in, you agree to agnecyos Terms of Service & Privacy Policy.
                </div>
            </div>
        </div>
    );
}
