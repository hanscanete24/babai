import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Menu,
    Search,
    Clock,
    Globe,
    Bell,
    Sparkles,
    SlidersHorizontal
} from 'lucide-react';
import { PageProps } from '@/types';

interface HeaderProps {
    onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
    const { auth } = usePage<PageProps>().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState<string>('');

    // Update live clock every second
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                })
            );
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/search', { q: searchQuery.trim() });
        }
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
            {/* Left: Mobile Toggle & Quick Search */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    aria-label="Toggle navigation menu"
                    className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search headlines, geopolitical events, technologies... (Press Enter)"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 text-sm text-slate-200 placeholder-slate-400 rounded-xl border border-slate-800 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-inner"
                    />
                </form>
            </div>

            {/* Right: Live Clock, Status & User Pill */}
            <div className="flex items-center gap-4">
                {/* Real-time World Clock */}
                <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-slate-300 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{currentTime || '00:00:00 UTC'}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Local</span>
                </div>

                {/* Filter shortcut */}
                <button
                    onClick={() => router.get('/search')}
                    title="Open Advanced Filters"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Filter Engine</span>
                </button>

                {/* User Profile Badge */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-white/20">
                        {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="hidden xl:block text-left">
                        <div className="text-xs font-semibold text-slate-200 leading-tight">
                            {auth?.user?.name || 'Lead News Analyst'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                            {auth?.user?.email || 'analyst@pulsenews.io'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
