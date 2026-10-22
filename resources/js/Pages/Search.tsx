import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { NewsCard } from '@/Components/News/NewsCard';
import { ArticleModal } from '@/Components/News/ArticleModal';
import { FilterPanel } from '@/Components/News/FilterPanel';
import { EmptyState } from '@/Components/News/EmptyState';
import {
    Country,
    NewsArticleItem,
    SearchFilters,
    ProviderLimitations
} from '@/types';
import {
    Search as SearchIcon,
    Calendar,
    CalendarDays,
    SlidersHorizontal,
    Globe,
    Layers,
    ChevronLeft,
    ChevronRight,
    X,
    Info,
    Sparkles
} from 'lucide-react';
import { WEEKDAY_NAMES } from '@/lib/utils';

interface SearchPageProps {
    articles: NewsArticleItem[];
    totalResults: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: SearchFilters;
    countries: Country[];
    categories: string[];
    bookmarkedUrls: string[];
    providerNote?: string | null;
    limitations: ProviderLimitations;
}

export default function SearchPage({
    articles = [],
    totalResults = 0,
    page = 1,
    pageSize = 18,
    totalPages = 1,
    filters,
    countries = [],
    categories = [],
    bookmarkedUrls = [],
    providerNote = null,
    limitations = {},
}: SearchPageProps) {
    const [modalArticle, setModalArticle] = useState<NewsArticleItem | null>(null);
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedUrls));
    const [showFilters, setShowFilters] = useState(true);
    const [keyword, setKeyword] = useState(filters.q || '');

    const handleApplyFilters = (updated: Partial<SearchFilters>) => {
        router.get('/search', {
            ...filters,
            ...updated,
            q: keyword,
            page: 1, // reset to page 1 on filter change
        }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setKeyword('');
        router.get('/search', {}, { preserveState: true });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        router.get('/search', {
            ...filters,
            q: keyword,
            page: newPage,
        }, { preserveState: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleApplyFilters({ q: keyword });
    };

    const handleBookmarkToggled = (url: string, newState: boolean) => {
        const next = new Set(bookmarks);
        if (newState) next.add(url);
        else next.delete(url);
        setBookmarks(next);
    };

    // Calculate active filter count for badge
    const activeFiltersCount = [
        filters.country && filters.country !== 'all',
        filters.category && filters.category !== 'all',
        filters.datePreset && filters.datePreset !== 'all',
        filters.weekdays && filters.weekdays.length > 0,
        filters.q && filters.q.trim().length > 0,
    ].filter(Boolean).length;

    const selectedCountryObj = countries.find((c) => c.code.toLowerCase() === filters.country?.toLowerCase());

    return (
        <AppLayout title="Advanced News Search & Date Filtering">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                            Multi-Dimensional Engine
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            • {totalResults} Dispatches Found
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Advanced Date & Day Filtering
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Filter news across custom calendar dates, specific weekdays (Mon, Wed, Fri), countries, and domains.
                    </p>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors shadow-sm self-start md:self-auto"
                >
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <span>{showFilters ? 'Hide Filter Controls' : 'Show Filter Controls'}</span>
                    {activeFiltersCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Keyword Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search keywords, events, companies, topics (e.g. 'Semiconductor', 'AI Hub', 'Quantum')..."
                        className="w-full pl-12 pr-28 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xl"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-3 duration-200">
                    <FilterPanel
                        filters={filters}
                        countries={countries}
                        categories={categories}
                        onApply={handleApplyFilters}
                        onReset={handleResetFilters}
                    />
                </div>
            )}

            {/* Active Filters Pill Bar */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">
                        Active Filter Matrix:
                    </span>

                    {filters.country && filters.country !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
                            <span>{selectedCountryObj?.flag}</span>
                            <span>{selectedCountryObj?.name || filters.country}</span>
                            <button
                                onClick={() => handleApplyFilters({ country: 'all' })}
                                className="hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {filters.category && filters.category !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 capitalize font-medium">
                            <span>{filters.category}</span>
                            <button
                                onClick={() => handleApplyFilters({ category: 'all' })}
                                className="hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {filters.datePreset && filters.datePreset !== 'all' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium">
                            <Calendar className="w-3 h-3" />
                            <span className="capitalize">
                                {filters.datePreset === 'custom' && filters.from && filters.to
                                    ? `${filters.from} to ${filters.to}`
                                    : filters.datePreset === 'specific' && filters.specificDate
                                    ? filters.specificDate
                                    : filters.datePreset}
                            </span>
                            <button
                                onClick={() => handleApplyFilters({ datePreset: 'all', from: null, to: null, specificDate: null })}
                                className="hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {filters.weekdays && filters.weekdays.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                            <CalendarDays className="w-3 h-3" />
                            <span>
                                {filters.weekdays
                                    .map((id) => WEEKDAY_NAMES.find((w) => w.id === id)?.short)
                                    .filter(Boolean)
                                    .join(', ')}
                            </span>
                            <button
                                onClick={() => handleApplyFilters({ weekdays: [] })}
                                className="hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    <button
                        onClick={handleResetFilters}
                        className="text-[11px] text-slate-400 hover:text-rose-400 underline underline-offset-2 ml-auto"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Provider limitation or live note */}
            {providerNote && (
                <div className="mb-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{providerNote}</span>
                </div>
            )}

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <EmptyState
                    title="No Matching News Articles"
                    description="No articles matched the combined country, category, date range, and weekday criteria. Try broadening your filters or clearing weekdays."
                    actionLabel="Reset Filter Matrix"
                    onAction={handleResetFilters}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, idx) => (
                        <NewsCard
                            key={article.canonical_url || idx}
                            article={article}
                            isBookmarked={!!article.canonical_url && bookmarks.has(article.canonical_url)}
                            onOpenModal={(a) => setModalArticle(a)}
                            onBookmarkToggled={handleBookmarkToggled}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
                    <div className="text-xs text-slate-400 font-mono">
                        Page {page} of {totalPages} ({totalResults} total articles)
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-200 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-200 transition-colors"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Article Modal */}
            <ArticleModal
                article={modalArticle}
                isBookmarked={!!modalArticle?.canonical_url && bookmarks.has(modalArticle.canonical_url)}
                onClose={() => setModalArticle(null)}
                onToggleBookmark={(article) => {
                    if (article.canonical_url) {
                        const newState = !bookmarks.has(article.canonical_url);
                        handleBookmarkToggled(article.canonical_url, newState);
                    }
                }}
            />
        </AppLayout>
    );
}
