import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { NewsCard } from '@/Components/News/NewsCard';
import { BreakingNewsTicker } from '@/Components/News/BreakingNewsTicker';
import { ArticleModal } from '@/Components/News/ArticleModal';
import { EmptyState } from '@/Components/News/EmptyState';
import { CountrySelector } from '@/Components/News/CountrySelector';
import {
    Country,
    NewsArticleItem,
    ProviderLimitations
} from '@/types';
import {
    Globe,
    Layers,
    SlidersHorizontal,
    TrendingUp,
    ShieldAlert,
    Sparkles,
    Check
} from 'lucide-react';

interface DashboardProps {
    articles: NewsArticleItem[];
    breakingNews: NewsArticleItem[];
    selectedCountry: string;
    selectedCategory: string;
    countries: Country[];
    categories: string[];
    provider: string;
    limitations: ProviderLimitations;
    bookmarkedUrls: string[];
    totalArticles: number;
    apiError?: string | null;
}

export default function Dashboard({
    articles = [],
    breakingNews = [],
    selectedCountry = 'us',
    selectedCategory = 'all',
    countries = [],
    categories = [],
    provider = 'PulseNews Engine',
    limitations = {},
    bookmarkedUrls = [],
    totalArticles = 0,
    apiError = null,
}: DashboardProps) {
    const [modalArticle, setModalArticle] = useState<NewsArticleItem | null>(null);
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedUrls));

    const handleCountryChange = (countryCode: string) => {
        router.get('/', {
            country: countryCode,
            category: selectedCategory,
        }, { preserveState: true });
    };

    const handleCategoryClick = (cat: string) => {
        router.get('/', {
            country: selectedCountry,
            category: cat,
        }, { preserveState: true });
    };

    const handleBookmarkToggled = (url: string, newState: boolean) => {
        const next = new Set(bookmarks);
        if (newState) {
            next.add(url);
        } else {
            next.delete(url);
        }
        setBookmarks(next);
    };

    return (
        <AppLayout title="Global News Dashboard">
            {/* Top Stat Banner & Introduction */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            Live Telemetry Feed
                        </span>
                        <span className="text-xs text-slate-400 font-mono">• 24/7 Ingestion</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Global News Monitoring
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Synthesizing verified news reports from 54 countries with multi-dimensional date filtering.
                    </p>
                </div>

                {/* Country Quick Switcher Dropdown */}
                <div className="w-full sm:w-72">
                    <CountrySelector
                        countries={countries}
                        selectedCountry={selectedCountry}
                        onChange={handleCountryChange}
                        label="Broadcast Territory"
                        allowAll={true}
                    />
                </div>
            </div>

            {/* API Warning Notice if any */}
            {apiError && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <div className="font-semibold text-amber-300">Data Provider Notice</div>
                        <p className="mt-0.5 text-amber-200/80 leading-relaxed">
                            {apiError} Displaying verified local monitoring records.
                        </p>
                    </div>
                </div>
            )}

            {/* Live Breaking News Ticker */}
            <BreakingNewsTicker
                articles={breakingNews}
                onSelectArticle={(article) => setModalArticle(article)}
            />

            {/* Category Filter Pills Bar */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button
                        onClick={() => handleCategoryClick('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                            selectedCategory === 'all'
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                        }`}
                    >
                        All Categories
                    </button>
                    {categories.map((cat) => {
                        const active = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all border ${
                                    active
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => router.get('/search', { country: selectedCountry, category: selectedCategory })}
                    className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 transition-colors"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Advanced Filter</span>
                </button>
            </div>

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <EmptyState
                    title="No News Available for This Territory"
                    description="No dispatches found for the selected country and category. Try choosing Worldwide or resetting the category."
                    onAction={() => handleCountryChange('all')}
                    actionLabel="View Worldwide News"
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

            {/* Article Detail Reader Modal */}
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
