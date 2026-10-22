import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { PageProps } from '@/types';

interface AppLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ title, children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { flash } = usePage<PageProps>().props;

    return (
        <div className="h-screen max-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
            <Head title={title} />

            {/* Desktop Sidebar — pinned to the left, does not scroll with page content */}
            <div className="hidden lg:flex lg:flex-shrink-0 h-screen sticky top-0 z-40 select-none">
                <Sidebar />
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative z-50 flex flex-col w-72 max-w-full h-full">
                        <Sidebar onClose={() => setMobileOpen(false)} />
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900/90 border border-slate-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area — scrolls independently while the sidebar stays fixed */}
            <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-y-auto overflow-x-hidden">
                <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />

                {/* Flash Message Banner */}
                {flash?.success && (
                    <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>

                {/* Footer */}
                <footer className="mt-auto border-t border-slate-900/80 px-6 py-6 text-center text-xs text-slate-400">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
                        <p>© 2026 PulseNews World Monitoring System. All rights reserved.</p>
                        <div className="flex items-center gap-4 text-slate-400">
                            <span>Free Tier / Sovereign Analytics</span>
                            <span>•</span>
                            <span>API Rate Conscious</span>
                            <span>•</span>
                            <a
                                href="https://newsapi.org"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-slate-300 underline underline-offset-2"
                            >
                                NewsAPI Integration
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};
