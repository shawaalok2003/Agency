'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/src/api/client';
import { ArrowLeft, ExternalLink, FolderPlus, ShieldCheck, Activity } from 'lucide-react';

export default function ClientPortalPreviewRouter() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/projects')
            .then(res => {
                const projs = res.data || [];
                setProjects(projs);
                // If there's an active project with client access token, redirect immediately to that real client portal
                if (projs.length === 1 && projs[0].clientAccessParam) {
                    router.replace(`/client/access/${projs[0].clientAccessParam}`);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
                <div className="flex items-center gap-3 text-indigo-400">
                    <Activity className="animate-spin" size={20} />
                    <span>Loading real client portal...</span>
                </div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="min-h-screen bg-[#030712] text-white p-6 flex flex-col items-center justify-center">
                <div className="max-w-md w-full bg-[#0a0f1d] border border-white/[0.08] p-8 rounded-2xl text-center">
                    <FolderPlus size={36} className="text-indigo-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold mb-2">No Projects Created Yet</h2>
                    <p className="text-xs text-gray-400 mb-6">
                        Client portals are automatically created for each real project. Create your first project to access its unique client portal link.
                    </p>
                    <Link
                        href="/?view=projects"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030712] text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div>
                        <Link href="/?view=dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mb-1">
                            <ArrowLeft size={13} /> Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">Real Client Portals</h1>
                        <p className="text-xs text-gray-400">Select any active project below to open its real client-facing portal link.</p>
                    </div>
                    <img
                        src="/logo.png"
                        alt="agnecyos"
                        className="h-8 w-auto object-contain rounded border border-white/10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {projects.map(proj => (
                        <div key={proj.id} className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/[0.08] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                                        {proj.name.charAt(0)}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {proj.status || 'ACTIVE'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base text-white mb-1">{proj.name}</h3>
                                <p className="text-xs text-gray-400 mb-4">{proj.clientEmail || 'No client email assigned'}</p>
                            </div>

                            <Link
                                href={`/client/access/${proj.clientAccessParam}`}
                                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                            >
                                Open Real Portal <ExternalLink size={13} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
