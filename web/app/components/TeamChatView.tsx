'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Send, Hash, Users, User, ShieldCheck,
    Clock, RefreshCw, Paperclip, CheckCheck, Smile, Trash2
} from 'lucide-react';
import { api } from '@/src/api/client';

interface TeamChatViewProps {
    user: any;
}

export default function TeamChatView({ user }: TeamChatViewProps) {
    const [channels, setChannels] = useState([
        { id: 'general', name: 'general-announcements', department: 'ALL', desc: 'Company-wide updates & team wins' },
        { id: 'sales', name: 'sales-pipeline', department: 'SALES', desc: 'Deal closures, leads & targets' },
        { id: 'operations', name: 'operations-delivery', department: 'OPERATIONS', desc: 'Client workflows & milestones' },
        { id: 'dev-tech', name: 'tech-dev', department: 'DEVELOPMENT', desc: 'Engineering, architecture & features' },
        { id: 'management', name: 'executive-management', department: 'MANAGEMENT', desc: 'Admin strategy & planning' }
    ]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [activeChannel, setActiveChannel] = useState<string>('general');
    const [activeDirectUser, setActiveDirectUser] = useState<any | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTeamDirectory();
    }, []);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000); // Polling for real-time chatter
        return () => clearInterval(interval);
    }, [activeChannel, activeDirectUser]);

    useEffect(() => {
        // Internal container scroll only - NEVER scrolls the window or page
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages.length, activeChannel, activeDirectUser]);

    const fetchTeamDirectory = async () => {
        try {
            const { data } = await api.get('/messages/team-directory');
            if (data?.members) {
                // Filter out current user from direct messaging list
                setTeamMembers(data.members.filter((m: any) => m.email?.toLowerCase() !== user?.email?.toLowerCase()));
            }
        } catch (err) {
            console.error('Failed to load team directory:', err);
        }
    };

    const handleDeleteUser = async (member: any) => {
        if (!window.confirm(`Permanently delete user "${member.name || member.email}"?\nThis cannot be undone.`)) return;
        setDeletingUserId(member.id);
        try {
            await api.delete(`/auth/users/${member.id}`);
            setTeamMembers(prev => prev.filter(m => m.id !== member.id));
            if (activeDirectUser?.id === member.id) setActiveDirectUser(null);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete user.');
        } finally {
            setDeletingUserId(null);
        }
    };

    const fetchMessages = async () => {
        try {
            const query = activeDirectUser
                ? `/messages?directWith=${encodeURIComponent(activeDirectUser.email)}`
                : `/messages?channel=${activeChannel}`;
            const { data } = await api.get(query);
            setMessages(data || []);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || sending) return;

        setSending(true);
        try {
            await api.post('/messages', {
                channel: activeDirectUser ? undefined : activeChannel,
                recipientEmail: activeDirectUser ? activeDirectUser.email : undefined,
                content: messageInput.trim()
            });
            setMessageInput('');
            await fetchMessages();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const getDepartmentBadge = (dept: string) => {
        const d = (dept || 'SALES').toUpperCase();
        const styles: Record<string, string> = {
            SALES: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            OPERATIONS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            DEVELOPMENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
            DESIGN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            MANAGEMENT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        };
        return styles[d] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <MessageSquare className="text-indigo-400" /> Inter-Department Team Collaboration
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Connected workspace for {user?.companyName || user?.email?.split('@')[0]} • Cross-department chat &amp; direct messages.
                    </p>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="h-[calc(100vh-170px)] min-h-[480px] max-h-[660px] bg-[#0a0f1d] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
                {/* Left Channels / Direct Message Sidebar */}
                <div className="w-full md:w-72 bg-[#060a14] border-r border-white/[0.06] flex flex-col justify-between shrink-0">
                    <div className="p-4 space-y-6 overflow-y-auto">
                        {/* Company Badge */}
                        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                                {(user?.companyName || user?.email || 'DE').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white uppercase tracking-wider truncate">
                                    {user?.companyName || user?.email?.split('@')[0]}
                                </div>
                                <div className="text-[10px] text-gray-500">Live Team Channels</div>
                            </div>
                        </div>

                        {/* Channels Section */}
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                                Channels
                            </div>
                            <div className="space-y-1">
                                {channels.map((chan) => {
                                    const isActive = !activeDirectUser && activeChannel === chan.id;
                                    return (
                                        <button
                                            key={chan.id}
                                            onClick={() => {
                                                setActiveDirectUser(null);
                                                setActiveChannel(chan.id);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <Hash size={14} className={isActive ? 'text-white' : 'text-gray-500'} />
                                            <span className="truncate">{chan.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Direct Messages Section */}
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                                <span>Direct Messages</span>
                                <span className="text-gray-500 font-mono text-[9px]">{teamMembers.length} Colleagues</span>
                            </div>
                            {teamMembers.length === 0 ? (
                                <div className="text-[11px] text-gray-500 px-2 py-3 italic">
                                    No other team members yet. Add team members in the Admin dashboard.
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {teamMembers.map((member) => {
                                        const isActive = activeDirectUser?.email === member.email;
                                        const isDeleting = deletingUserId === member.id;
                                        return (
                                            <div
                                                key={member.id || member.email}
                                                className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                    isActive
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                                                        : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => setActiveDirectUser(member)}
                                                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                                >
                                                    <div className="relative shrink-0">
                                                        <div className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">
                                                            {(member.name || member.email).charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#060a14]"></span>
                                                    </div>
                                                    <div className="min-w-0 text-left flex-1">
                                                        <div className="truncate font-medium">{member.name || member.email.split('@')[0]}</div>
                                                        <div className="text-[9px] text-gray-400 uppercase truncate">
                                                            {member.department || member.role}
                                                        </div>
                                                    </div>
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteUser(member); }}
                                                        disabled={isDeleting}
                                                        title={`Delete ${member.name || member.email}`}
                                                        className={`shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${
                                                            isDeleting
                                                                ? 'opacity-100 cursor-wait'
                                                                : 'hover:bg-red-500/20 hover:text-red-400 text-gray-500'
                                                        }`}
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current User Footnote */}
                    <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] flex items-center gap-2 text-xs">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-white font-bold truncate text-[11px]">{user?.name || user?.email}</div>
                            <div className="text-[9px] text-emerald-400 truncate">● Online • {user?.role || 'ADMIN'}</div>
                        </div>
                    </div>
                </div>

                {/* Right Chat Conversation Box */}
                <div className="flex-1 flex flex-col justify-between bg-[#0a0f1d]">
                    {/* Channel / Conversation Header */}
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-2.5">
                            {activeDirectUser ? (
                                <>
                                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                                        {(activeDirectUser.name || activeDirectUser.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            <span>{activeDirectUser.name || activeDirectUser.email}</span>
                                            <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold border ${getDepartmentBadge(activeDirectUser.department)}`}>
                                                {activeDirectUser.department || 'TEAM'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono">{activeDirectUser.email}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                                        <Hash size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            <span>#{channels.find(c => c.id === activeChannel)?.name || activeChannel}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {channels.find(c => c.id === activeChannel)?.desc || 'Inter-department channel'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Live Synced</span>
                        </span>
                    </div>

                    {/* Messages Body */}
                    <div ref={messagesContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                                <MessageSquare size={36} className="text-gray-600 mb-2" />
                                <div className="text-sm font-bold text-white mb-1">
                                    {activeDirectUser ? `Direct conversation with ${activeDirectUser.name}` : `Welcome to #${activeChannel}`}
                                </div>
                                <p className="text-xs text-gray-400 max-w-sm">
                                    {activeDirectUser
                                        ? 'Start a private direct conversation. Discuss proposals, handoffs, or tasks.'
                                        : 'Post announcements, share lead updates, or coordinate work across departments.'}
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isSelf = msg.senderEmail?.toLowerCase() === user?.email?.toLowerCase();
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isSelf && (
                                            <div className="w-8 h-8 rounded-xl bg-white/[0.08] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-white/10">
                                                {(msg.senderName || msg.senderEmail || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className={`max-w-[75%] space-y-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-center gap-2 text-[10px] ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                <span className="font-bold text-gray-300">
                                                    {isSelf ? 'You' : msg.senderName || msg.senderEmail.split('@')[0]}
                                                </span>
                                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${getDepartmentBadge(msg.senderDepartment)}`}>
                                                    {msg.senderDepartment || 'SALES'}
                                                </span>
                                                <span className="text-gray-500 font-mono">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div
                                                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                                    isSelf
                                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                                                        : 'bg-white/[0.05] border border-white/[0.08] text-gray-200 rounded-tl-none'
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Chat Input Composer */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={
                                    activeDirectUser
                                        ? `Message ${activeDirectUser.name || activeDirectUser.email}...`
                                        : `Message #${channels.find(c => c.id === activeChannel)?.name || activeChannel}...`
                                }
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                            />

                            <button
                                type="submit"
                                disabled={!messageInput.trim() || sending}
                                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-40 flex items-center gap-1.5"
                            >
                                <Send size={14} />
                                <span className="hidden sm:inline">Send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
