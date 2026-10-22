import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Search,
    Globe2,
    Layers,
    BarChart3,
    Bookmark,
    Settings,
    Radio,
    ShieldCheck,
    ExternalLink,
    BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    className?: string;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
    const { url } = usePage();

    const navItems = [
        { label: 'Global Dashboard', href: '/', icon: LayoutDashboard, exact: true },
        { label: 'Advanced Search', href: '/search', icon: Search },
        { label: 'Browse Countries', href: '/countries', icon: Globe2 },
        { label: 'Browse Categories', href: '/categories', icon: Layers },
        { label: 'News Analytics', href: '/analytics', icon: BarChart3 },
        { label: 'News Quiz', href: '/quiz', icon: BrainCircuit },
        { label: 'Saved Articles', href: '/bookmarks', icon: Bookmark },
        { label: 'Settings & Feeds', href: '/settings', icon: Settings },
    ];

    const isActive = (href: string, exact = false) => {
        if (exact) {
            return url === href || url === '/dashboard';
        }
        return url.startsWith(href);
    };

    return (
        <aside
            className={cn(
                'flex flex-col w-72 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl h-screen select-none',
                className
            )}
        >
            {/* Brand Logo & Radar Header */}
            <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/60">
                <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                    <Radio className="w-5 h-5 text-white animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            PulseNews
                        </h1>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Live
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono tracking-tight">World Monitor v2.4</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Intelligence Feeds
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                'flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                                active
                                    ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 text-white font-semibold shadow-sm border border-indigo-500/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                            )}
                            <Icon
                                className={cn(
                                    'w-5 h-5 transition-colors duration-200',
                                    active
                                        ? 'text-indigo-400'
                                        : 'text-slate-400 group-hover:text-slate-200'
                                )}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* System Status & Engine Health */}
            <div className="p-4 m-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-300">Engine Online</span>
                    </div>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    Auto-normalizing global timestamps across 54 sovereign territories.
                </p>
            </div>
        </aside>
    );
};
