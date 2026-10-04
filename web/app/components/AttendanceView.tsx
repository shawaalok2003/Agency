'use client';

import React, { useState, useEffect } from 'react';
import { Clock, UserCheck, CheckCircle2, AlertCircle, RefreshCw, Users, Shield, Calendar, Search } from 'lucide-react';
import { api } from '@/src/api/client';

export default function AttendanceView() {
    const [data, setData] = useState<any>({
        totalMembers: 0,
        onDutyCount: 0,
        records: [],
        roster: []
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await api.get('/checkin/company-today');
            setData(res.data);
        } catch (e) {
            console.error('Failed to load company attendance:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        const interval = setInterval(fetchAttendance, 15000); // Polling every 15s for live status
        return () => clearInterval(interval);
    }, []);

    const roster = data.roster || [];

    const filteredRoster = roster.filter((member: any) => {
        const matchesDept = departmentFilter === 'ALL' || (member.department || '').toUpperCase() === departmentFilter;
        const matchesSearch = !searchQuery.trim() ||
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
    });

    const getDepartmentBadge = (dept: string) => {
        const d = (dept || 'SALES').toUpperCase();
        if (d.includes('SALES')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        if (d.includes('DEV') || d.includes('TECH')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        if (d.includes('OPS') || d.includes('OPERAT')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        if (d.includes('DESIGN') || d.includes('CREATIVE')) return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    };

    const calculateShiftDuration = (inTime: string, outTime?: string | null) => {
        if (!inTime) return '-';
        const start = new Date(inTime).getTime();
        const end = outTime ? new Date(outTime).getTime() : Date.now();
        const diff = Math.max(0, end - start);
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hrs}h ${mins}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <UserCheck size={18} />
                        </span>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Live Team Attendance & Check-Ins
                        </h2>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Real-time duty monitor • Track who is online, shift durations, and daily staff attendance.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchAttendance}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors shadow-sm"
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh Attendance</span>
                    </button>
                </div>
            </div>

            {/* Attendance KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Total Team</span>
                        <Users size={16} className="text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-white mt-2 font-mono">
                        {data.totalMembers || 0}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Registered members</div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-[#070b18] border border-emerald-500/30 shadow-lg">
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Currently On Duty
                        </span>
                        <Clock size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-300 mt-2 font-mono">
                        {data.onDutyCount || 0}
                    </div>
                    <div className="text-[11px] text-emerald-400/70 mt-1">Active right now</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Completed Shift</span>
                        <CheckCircle2 size={16} className="text-blue-400" />
                    </div>
                    <div className="text-2xl font-black text-blue-300 mt-2 font-mono">
                        {roster.filter((m: any) => m.status === 'CHECKED_OUT').length}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Checked out today</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070b18] border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
                        <span>Not Checked In</span>
                        <AlertCircle size={16} className="text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
                        {roster.filter((m: any) => m.status === 'NOT_CHECKED_IN').length}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Pending attendance</div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {[
                        { id: 'ALL', label: 'All Departments' },
                        { id: 'SALES', label: '🔥 Sales' },
                        { id: 'DEVELOPMENT', label: '💻 Tech / Dev' },
                        { id: 'OPERATIONS', label: '⚡ Operations' },
                        { id: 'MANAGEMENT', label: '👑 Leadership' },
                    ].map(dept => (
                        <button
                            type="button"
                            key={dept.id}
                            onClick={() => setDepartmentFilter(dept.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                departmentFilter === dept.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {dept.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search team member..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="rounded-2xl bg-[#050814] border border-white/10 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                <th className="py-3 px-4">Staff Member</th>
                                <th className="py-3 px-4">Department</th>
                                <th className="py-3 px-4">Duty Status</th>
                                <th className="py-3 px-4">Check-In Time</th>
                                <th className="py-3 px-4">Check-Out Time</th>
                                <th className="py-3 px-4 text-right">Today's Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-xs">
                            {filteredRoster.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        No team members found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredRoster.map((m: any) => {
                                    const isOnline = m.status === 'ONLINE';
                                    const isCheckedOut = m.status === 'CHECKED_OUT';

                                    return (
                                        <tr key={m.memberId || m.email} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-700 to-purple-700 flex items-center justify-center font-bold text-white text-xs border border-white/10">
                                                        {(m.name || 'M').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-1.5">
                                                            {m.name}
                                                            {isOnline && (
                                                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-mono">
                                                            {m.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDepartmentBadge(m.department)}`}>
                                                    {m.department || 'SALES'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {isOnline ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                        </span>
                                                        ON DUTY
                                                    </span>
                                                ) : isCheckedOut ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                                        <CheckCircle2 size={11} />
                                                        COMPLETED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-gray-400 border border-white/10">
                                                        OFFLINE
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-gray-300">
                                                {m.checkInAt
                                                    ? new Date(m.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : <span className="text-gray-600">-</span>
                                                }
                                            </td>

                                            <td className="py-3.5 px-4 font-mono text-gray-300">
                                                {m.checkOutAt
                                                    ? new Date(m.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : <span className="text-gray-600">-</span>
                                                }
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-300">
                                                {calculateShiftDuration(m.checkInAt, m.checkOutAt)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
