import React, { useState } from 'react';
import { ExternalLink, Bookmark, Calendar, ArrowUpRight, Globe, Sparkles } from 'lucide-react';
import { NewsArticleItem } from '@/types';
import { formatTimeAgo, formatNewsDate, CATEGORY_COLORS } from '@/lib/utils';
import axios from 'axios';

interface NewsCardProps {
    article: NewsArticleItem;
    isBookmarked: boolean;
    onOpenModal?: (article: NewsArticleItem) => void;
    onBookmarkToggled?: (url: string, newState: boolean) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
    article,
    isBookmarked,
    onOpenModal,
    onBookmarkToggled,
}) => {
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [loadingBookmark, setLoadingBookmark] = useState(false);
    const [imgError, setImgError] = useState(false);

    const catStyle = CATEGORY_COLORS[article.category || 'general'] || CATEGORY_COLORS.general;

    const handleBookmarkClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!article.canonical_url || loadingBookmark) return;

        setLoadingBookmark(true);
        const previous = bookmarked;
        setBookmarked(!previous); // optimistic

        try {
            const res = await axios.post('/api/bookmarks/toggle', {
                canonical_url: article.canonical_url,
                title: article.title,
                description: article.description,
                author: article.author,
                source_name: article.source_name,
                image_url: article.image_url,
                country: article.country,
                category: article.category,
                published_at: article.published_at,
            });

            const newState = res.data.bookmarked;
            setBookmarked(newState);
            if (onBookmarkToggled && article.canonical_url) {
                onBookmarkToggled(article.canonical_url, newState);
            }
        } catch (err) {
            setBookmarked(previous); // rollback
            console.error('Failed to toggle bookmark', err);
        } finally {
            setLoadingBookmark(false);
        }
    };

    return (
        <article
            onClick={() => onOpenModal?.(article)}
            className="group relative flex flex-col bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer"
        >
            {/* Thumbnail Header */}
            <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                {article.image_url && !imgError ? (
                    <img
                        src={article.image_url}
                        alt={article.title}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 text-slate-400 p-4 text-center">
                        <Globe className="w-8 h-8 mb-2 text-indigo-400/40" />
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                            {article.source_name || 'Global Media'}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                {/* Breaking News Tag */}
                {article.is_breaking && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500 text-white shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        Breaking
                    </span>
                )}

                {/* Top Actions: Bookmark */}
                <button
                    type="button"
                    onClick={handleBookmarkClick}
                    disabled={loadingBookmark}
                    title={bookmarked ? 'Remove Bookmark' : 'Save Article'}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                        bookmarked
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                >
                    <Bookmark
                        className={`w-4 h-4 transition-transform ${bookmarked ? 'fill-current scale-110' : ''}`}
                    />
                </button>

                {/* Bottom Badges */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                        {article.category && (
                            <span
                                className={`px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md border backdrop-blur-md ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                                {article.category}
                            </span>
                        )}
                        {article.country && (
                            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-950/70 border border-slate-700/60 text-slate-300 backdrop-blur-md font-mono uppercase">
                                {article.country}
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-md">
                        {formatTimeAgo(article.published_at)}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex flex-col p-5">
                <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-300 truncate max-w-[160px]">
                        {article.source_name || 'International Wire'}
                    </span>
                    <span>•</span>
                    <span title={formatNewsDate(article.published_at)}>
                        {article.published_at ? article.published_at.substring(0, 10) : 'Live'}
                    </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 line-clamp-2 leading-snug tracking-tight mb-2 transition-colors">
                    {article.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                    {article.description || 'Access the full article coverage directly from the publisher.'}
                </p>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] text-slate-400 italic truncate max-w-[160px]">
                        {article.author ? `By ${article.author}` : 'Correspondent Report'}
                    </span>

                    {article.canonical_url && (
                        <a
                            href={article.canonical_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open original story on publisher site"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 font-medium transition-colors"
                        >
                            <span>Source</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
};
