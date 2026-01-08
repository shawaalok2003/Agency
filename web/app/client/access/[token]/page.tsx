'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/src/api/client';
import { CheckCircle, XCircle, FileText, Download, MessageSquare } from 'lucide-react';

// Reusing interfaces (simplified for read-only)
interface Project {
    id: string;
    name: string;
    clientEmail: string;
    scopes: any[];
    deliverables: any[];
}

export default function ClientPortal() {
    const params = useParams();
    const token = params.token as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Approval Modal State
    const [selectedDeliv, setSelectedDeliv] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'APPROVE' | 'REQUEST_CHANGES'>('APPROVE');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProjectData();
    }, [token]);

    const fetchProjectData = async () => {
        try {
            // Note: We bypass the standard axios interceptor because default api client sends Bearer token.
            // For this public route, we might need a separate instance or just simple fetch, 
            // BUT our backend `GET /client/access/:token` is public.
            // However, client.ts adds header if localStorage has token. 
            // Clients likely won't have a JWT. So it works.
            const { data } = await api.get(`/client/access/${token}`);
            setProject(data);
        } catch (err) {
            setError('Invalid or expired project link.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDeliv) return;
        setSubmitting(true);

        try {
            await api.post(`/client/deliverables/${selectedDeliv}/approve`, {
                action: actionType,
                comments
            }, {
                headers: { 'x-client-token': token } // Backend expects this header for verification
            });

            setSelectedDeliv(null);
            setComments('');
            fetchProjectData(); // Refresh UI
            alert(actionType === 'APPROVE' ? 'Deliverable approved!' : 'Changes requested.');
        } catch (err) {
            console.error(err);
            alert('Action failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50">Loading Project...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-gray-50 text-red-600">{error}</div>;
    if (!project) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">Client Portal</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Active Project
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* LATEST DELIVERABLES */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Download size={20} className="text-gray-400" />
                        Deliverables for Review
                    </h2>
                    <div className="space-y-4">
                        {project.deliverables.length === 0 ? (
                            <p className="text-gray-500 italic">No deliverables uploaded yet.</p>
                        ) : (
                            project.deliverables.map((del: any) => {
                                const isApproved = del.approvals.some((a: any) => a.action === 'APPROVE');
                                const isRequested = del.approvals.some((a: any) => a.action === 'REQUEST_CHANGES');

                                return (
                                    <div key={del.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">Version {del.version}</span>
                                                    <span className="text-gray-400 text-sm">• {new Date(del.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {del.notes && <p className="text-gray-600 mb-3">{del.notes}</p>}
                                                <a href={del.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
                                                    View File <Download size={14} />
                                                </a>
                                            </div>

                                            <div>
                                                {isApproved ? (
                                                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg font-bold border border-green-100">
                                                        <CheckCircle size={20} /> APPROVED
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { setSelectedDeliv(del.id); setActionType('REQUEST_CHANGES'); }}
                                                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                                        >
                                                            Request Changes
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedDeliv(del.id); setActionType('APPROVE'); }}
                                                            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Approval History / Comments */}
                                        {del.approvals.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 -m-6 -mt-0 p-4 rounded-b-xl">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">History</h4>
                                                <div className="space-y-3">
                                                    {del.approvals.map((audit: any) => (
                                                        <div key={audit.id} className="flex gap-3 text-sm">
                                                            <div className={`mt-0.5 ${audit.action === 'APPROVE' ? 'text-green-600' : 'text-orange-600'}`}>
                                                                {audit.action === 'APPROVE' ? <CheckCircle size={16} /> : <MessageSquare size={16} />}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold">{audit.action === 'APPROVE' ? 'Approved' : 'Changes Requested'}</span>
                                                                <span className="text-gray-400 mx-2">{new Date(audit.createdAt).toLocaleString()}</span>
                                                                {audit.comments && <p className="text-gray-600 mt-1">"{audit.comments}"</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* SCOPE SECTION */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-gray-400" />
                        Project Scope
                    </h2>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {project.scopes.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {project.scopes.map((scope: any) => (
                                    <div key={scope.id} className="p-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">v{scope.version}</span>
                                            <div className="text-right">
                                                <span className="font-bold text-gray-900 block">${scope.price}</span>
                                                <span className="text-sm text-gray-400">{new Date(scope.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <p className="whitespace-pre-wrap text-gray-700">{scope.content}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">No scope definition visible.</div>
                        )}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
                Powered by Agency OS
            </footer>

            {/* ACTION MODAL */}
            {selectedDeliv && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white flex flex-col w-full max-w-md rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold">
                                {actionType === 'APPROVE' ? 'Confirm Approval' : 'Request Changes'}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                {actionType === 'APPROVE'
                                    ? 'Checking this logs your formal acceptance of the deliverable.'
                                    : 'Please describe the changes needed.'}
                            </p>
                        </div>

                        <form onSubmit={handleAction} className="p-6 pt-4">
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none text-gray-800 placeholder-gray-400"
                                placeholder={actionType === 'APPROVE' ? 'Optional comments...' : 'Describe what needs to be fixed...'}
                                required={actionType === 'REQUEST_CHANGES'}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDeliv(null)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-6 py-2 text-white font-bold rounded-lg shadow-sm transition-all transform active:scale-95 ${actionType === 'APPROVE'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-orange-600 hover:bg-orange-700'
                                        }`}
                                >
                                    {submitting ? 'Processing...' : (actionType === 'APPROVE' ? 'Approve Deliverable' : 'Submit Request')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
