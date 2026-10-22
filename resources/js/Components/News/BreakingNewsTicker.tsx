import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { NewsArticleItem } from '@/types';

interface BreakingNewsTickerProps {
    articles: NewsArticleItem[];
    onSelectArticle: (article: NewsArticleItem) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
    articles,
    onSelectArticle,
}) => {
    if (!articles || articles.length === 0) return null;

    return (
        <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-indigo-950/40 border border-rose-500/20 p-4 overflow-hidden shadow-lg shadow-rose-950/10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Badge */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        Breaking Wires
                    </span>
                    <div className="hidden sm:block h-4 w-px bg-rose-500/30 ml-1" />
                </div>

                {/* News Items Carousel / Quick List */}
                <div className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
                    {articles.map((item, idx) => (
                        <button
                            key={item.canonical_url || idx}
                            onClick={() => onSelectArticle(item)}
                            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white shrink-0 group transition-colors text-left"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80 group-hover:bg-rose-400" />
                            <span className="font-medium group-hover:underline line-clamp-1 max-w-[280px] sm:max-w-[360px]">
                                {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                ({item.source_name || 'Wire'})
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
