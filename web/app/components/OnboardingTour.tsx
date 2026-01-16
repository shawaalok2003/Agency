'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Flag, FileText, Share2, Rocket, LayoutGrid, Users, DollarSign, Target, PlusCircle, Github, CheckCircle, Upload } from 'lucide-react';

interface Step {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const steps: Step[] = [
    {
        title: "Welcome to Agency OS",
        description: "The complete operating system for your creative business. This quick tour will show you how to manage your entire agency lifecycle from lead to payment.",
        icon: <Rocket size={48} className="text-indigo-400" />
    },
    {
        title: "1. Command Center",
        description: "Your Dashboard is your mission control. Monitor Total Revenue, Active Projects, and Pending Invoices in real-time. Use the 'Quick Actions' to jump straight into work.",
        icon: <LayoutGrid size={48} className="text-blue-400" />
    },
    {
        title: "2. CRM & Client Management",
        description: "Track potential deals in the 'Leads' pipeline. Once won, convert them to 'Contacts'. Keep all your client emails, roles, and company details in one secure directory.",
        icon: <Users size={48} className="text-pink-400" />
    },
    {
        title: "3. Create a Project",
        description: "Start a new workspace for every job. Assign a client, set a deadline, and invite team members. This becomes the central hub for all files, tasks, and communications.",
        icon: <Flag size={48} className="text-emerald-400" />
    },
    {
        title: "4. Define Detailed Scope",
        description: "Avoid scope creep. Use the 'Scope' tab to list every deliverable and its price. You can lock scopes once approved to ensure everyone stays on the same page.",
        icon: <Target size={48} className="text-orange-400" />
    },
    {
        title: "5. Manage Tasks & Code",
        description: "Break down work into Tasks and Subtasks. Developer? Connect your GitHub repository to see commits and PRs directly inside the project dashboard.",
        icon: <Github size={48} className="text-slate-200" />
    },
    {
        title: "6. Upload Deliverables",
        description: "Post your designs or documents in the 'Deliverables' tab. Clients can view them, request changes, or mark them as 'Approved' with a full audit trail.",
        icon: <Upload size={48} className="text-cyan-400" />
    },
    {
        title: "7. Automated Invoicing",
        description: "Turn your approved Scope into a professional Invoice with one click. Agency OS handles the math. Track status from 'Draft' to 'Sent' to 'Paid'.",
        icon: <DollarSign size={48} className="text-green-400" />
    },
    {
        title: "8. Team Collaboration",
        description: "Invite unlimited team members. Assign them specific roles and projects. They see only what they need to work on, keeping your financials private if needed.",
        icon: <PlusCircle size={48} className="text-violet-400" />
    },
    {
        title: "9. Share Client Portal",
        description: "Impress your clients. Generate a branded, secure link where they can log in to view project progress, approve deliverables, and pay invoices.",
        icon: <Share2 size={48} className="text-purple-400" />
    },
    {
        title: "10. Get to Work",
        description: "You're all set! Explore the features at your own pace. If you ever need help, checking the 'Docs' or 'Support' section is just a click away.",
        icon: <CheckCircle size={48} className="text-teal-400" />
    }
];

export default function OnboardingTour({ userId }: { userId?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const hasSeenTour = localStorage.getItem(`hasSeenOnboarding_${userId}`);
        if (!hasSeenTour) {
            setIsVisible(true);
        }
    }, [userId]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        if (userId) {
            localStorage.setItem(`hasSeenOnboarding_${userId}`, 'true');
        }
    };

    if (!isVisible) return null;

    // Calculate progress percentage
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-[#030712]/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            ></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {/* Icon Container */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center shadow-inner shadow-black/50 relative overflow-hidden">
                            {/* Glow effect behind icon */}
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                            <div className="relative z-10 scale-110 transition-transform duration-500 key={currentStep}">
                                {steps[currentStep].icon}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-4 mb-8">
                        <h2 className="text-2xl font-bold text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-300 key={currentStep}">
                            {steps[currentStep].title}
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm animate-in fade-in slide-in-from-bottom-3 duration-500 key={currentStep}">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors ${currentStep === 0
                                ? 'text-slate-700 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>

                        <div className="flex gap-1.5">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-indigo-500 w-4' : 'bg-slate-700'
                                        }`}
                                ></div>
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                        >
                            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                            {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
