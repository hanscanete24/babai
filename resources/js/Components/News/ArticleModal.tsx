import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { X, ExternalLink, Calendar, User, Globe, Tag, Bookmark, FlaskConical, BookOpen, BrainCircuit, Clock } from 'lucide-react';
import { NewsArticleItem } from '@/types';
import { formatNewsDate, CATEGORY_COLORS } from '@/lib/utils';

interface ArticleModalProps {
    article: NewsArticleItem | null;
    isBookmarked: boolean;
    onClose: () => void;
    onToggleBookmark: (article: NewsArticleItem) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
    article,
    isBookmarked,
    onClose,
    onToggleBookmark,
}) => {
    const [readMode, setReadMode] = useState(false);

    if (!article) return null;

    const catStyle = CATEGORY_COLORS[article.category || 'general'] || CATEGORY_COLORS.general;
    const isDemo = article.is_seeded === true;
    const wordCount = article.description ? article.description.split(' ').length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
            <div
                className={`relative w-full ${readMode ? 'max-w-3xl' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Toolbar: Read Mode toggle + Close */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/60">
                    <button
                        onClick={() => setReadMode((v) => !v)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            readMode
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        {readMode ? 'Exit Reader' : 'Read Mode'}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 sm:p-8 pt-4">
                    {/* Article Image */}
                    {article.image_url ? (
                        <div className="relative h-60 w-full mb-6 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                            <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                            {article.is_breaking && (
                                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-600/90 text-white shadow-lg backdrop-blur-sm">
                                    Breaking News
                                </span>
                            )}
                            {isDemo && (
                                <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/90 text-slate-900 shadow-lg backdrop-blur-sm flex items-center gap-1">
                                    <FlaskConical className="w-3 h-3" />
                                    Demo
                                </span>
                            )}
                        </div>
                    ) : null}

                    {/* Badges & Meta */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {article.category && (
                            <span
                                className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-lg border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                            >
                                {article.category}
                            </span>
                        )}
                        {article.country && (
                            <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 uppercase font-mono">
                                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                                {article.country}
                            </span>
                        )}
                        {article.source_name && (
                            <span className="px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-800/60 rounded-lg">
                                {article.source_name}
                            </span>
                        )}
                        {readMode && (
                            <span className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{readTime} min read
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className={`font-bold text-white tracking-tight leading-snug mb-4 ${readMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                        {article.title}
                    </h2>

                    {/* Meta details */}
                    <div className="flex flex-wrap items-center gap-4 py-3 mb-6 border-y border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>{formatNewsDate(article.published_at)}</span>
                        </div>
                        {article.author && (
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="truncate max-w-[200px]">{article.author}</span>
                            </div>
                        )}
                    </div>

                    {/* Article content — compact or reading mode */}
                    {readMode ? (
                        <div className="text-slate-200 text-[16px] leading-9 mb-6 space-y-5 font-[system-ui]">
                            <p>{article.description || 'No summary provided.'}</p>
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-400 flex items-start gap-2.5">
                                <Tag className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <span>
                                    This is a publisher summary. PulseNews displays licensed summaries only.
                                    Configure a <code className="text-indigo-300 font-mono text-xs">NEWS_API_KEY</code> to access live full-text articles.
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-300 text-sm leading-relaxed mb-6 space-y-3">
                            <p>{article.description || 'No extended summary provided by publisher.'}</p>
                            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
                                <Tag className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <span>
                                    PulseNews complies with publisher terms by displaying licensed summaries only. Access the full article via the official publisher link below.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Demo data notice */}
                    {isDemo && (
                        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                            <FlaskConical className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-amber-300 mb-1">Demo / Sample Article</p>
                                <p className="text-xs text-amber-200/70 leading-relaxed">
                                    This article is part of the local demo dataset and does not have a real publisher URL.
                                    To access live articles with working external links, add a valid{' '}
                                    <code className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">NEWS_API_KEY</code>{' '}
                                    in your <code className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">.env</code> file.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quiz CTA */}
                    <div className="mb-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
                        <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
                        <p className="text-xs text-indigo-200/80 flex-1">
                            Think you understood this article? Test yourself on the latest news!
                        </p>
                        <Link
                            href="/quiz"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap"
                        >
                            <BrainCircuit className="w-3.5 h-3.5" />
                            Take Quiz
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                        <button
                            onClick={() => onToggleBookmark(article)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                                isBookmarked
                                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                            }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-indigo-400' : ''}`} />
                            <span>{isBookmarked ? 'Saved in Bookmarks' : 'Save for Later'}</span>
                        </button>

                        {/* Only show external link for real (non-seeded) articles with a valid URL */}
                        {!isDemo && article.canonical_url && (
                            <a
                                href={article.canonical_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                            >
                                <span>Read Full Story on Publisher</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
