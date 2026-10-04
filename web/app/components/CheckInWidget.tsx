'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, LogOut, Play, Shield, Sparkles } from 'lucide-react';
import { api } from '@/src/api/client';

interface CheckInWidgetProps {
    user?: any;
    onStatusChange?: () => void;
    compact?: boolean;
}

export default function CheckInWidget({ user, onStatusChange, compact = false }: CheckInWidgetProps) {
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<string>('0h 0m');

    const fetchStatus = async () => {
        try {
            const res = await api.get('/checkin/my-status');
            setIsCheckedIn(res.data.isCheckedIn);
            setActiveSession(res.data.activeSession);
        } catch (e) {
            // Silently fail if endpoint loading
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Update elapsed timer every minute
    useEffect(() => {
        if (!isCheckedIn || !activeSession?.checkInAt) return;

        const updateTimer = () => {
            const start = new Date(activeSession.checkInAt).getTime();
            const now = Date.now();
            const diffMs = Math.max(0, now - start);
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setElapsedTime(`${hours}h ${minutes}m`);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 60000);
        return () => clearInterval(timer);
    }, [isCheckedIn, activeSession]);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await api.post('/checkin', {});
            await fetchStatus();
            onStatusChange?.();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!confirm('Are you ready to check out and conclude your shift for today?')) return;
        setLoading(true);
        try {
            await api.post('/checkout', {});
            await fetchStatus();
            onStatusChange?.();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Check-out failed');
        } finally {
            setLoading(false);
        }
    };

    const checkInTimeFormatted = activeSession?.checkInAt
        ? new Date(activeSession.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {isCheckedIn ? (
                    <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <div className="text-[11px] font-bold text-emerald-300">
                            On Duty <span className="text-gray-400 font-normal">({elapsedTime})</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCheckOut}
                            disabled={loading}
                            className="ml-1 text-[10px] font-semibold text-gray-300 hover:text-white px-2 py-0.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/10 transition-colors"
                        >
                            End Shift
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleCheckIn}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md shadow-emerald-900/30 border border-emerald-400/30 transition-all active:scale-95"
                    >
                        <Play size={12} className="fill-white" />
                        <span>Check In</span>
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0b1021] to-[#050814] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
                            isCheckedIn
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        }`}
                    >
                        <Clock size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                Attendance & Duty Tracker
                            </span>
                            {isCheckedIn && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                                    LIVE ON DUTY
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-semibold text-white mt-0.5">
                            {isCheckedIn ? (
                                <span>
                                    Checked In at <span className="text-emerald-400 font-mono font-bold">{checkInTimeFormatted}</span> • Worked <span className="text-indigo-300 font-bold">{elapsedTime}</span> today
                                </span>
                            ) : (
                                <span className="text-gray-300">
                                    You have not checked in today. Click below to begin your work shift.
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    {isCheckedIn ? (
                        <button
                            type="button"
                            onClick={handleCheckOut}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-200 border border-white/10 hover:border-red-500/30 transition-all active:scale-95 shadow-md"
                        >
                            <LogOut size={14} />
                            <span>Check Out (End Shift)</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white border border-emerald-400/40 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                            <Play size={13} className="fill-white" />
                            <span>Check In (Start Duty)</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
