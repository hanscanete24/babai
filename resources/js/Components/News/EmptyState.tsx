import React from 'react';
import { Newspaper, SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No News Dispatches Found',
    description = 'No articles match the current filter matrix or date range. Try broadening your keywords or adjusting the weekday selection.',
    actionLabel = 'Reset All Filters',
    onAction,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 my-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
                <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                {title}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                {description}
            </p>
            {onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{actionLabel}</span>
                </button>
            )}
        </div>
    );
};

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4">
                    <div className="h-44 bg-slate-800/60 rounded-xl" />
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                        <div className="h-4 bg-slate-800/80 rounded w-1/2" />
                    </div>
                    <div className="space-y-1.5 pt-2">
                        <div className="h-3 bg-slate-800/40 rounded w-full" />
                        <div className="h-3 bg-slate-800/40 rounded w-5/6" />
                    </div>
                </div>
            ))}
        </div>
    );
};
