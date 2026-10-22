import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { NewsCard } from '@/Components/News/NewsCard';
import { ArticleModal } from '@/Components/News/ArticleModal';
import { CountrySelector } from '@/Components/News/CountrySelector';
import { EmptyState } from '@/Components/News/EmptyState';
import { Country, NewsArticleItem } from '@/types';
import {
    Globe,
    ArrowLeftRight,
    Sparkles,
    Search,
    SlidersHorizontal,
    X
} from 'lucide-react';

interface CountriesPageProps {
    primaryCountry: string;
    compareCountry?: string | null;
    primaryArticles: NewsArticleItem[];
    compareArticles: NewsArticleItem[];
    countries: Country[];
    countryCounts: Record<string, number>;
    bookmarkedUrls: string[];
}

export default function CountriesPage({
    primaryCountry = 'us',
    compareCountry = null,
    primaryArticles = [],
    compareArticles = [],
    countries = [],
    countryCounts = {},
    bookmarkedUrls = [],
}: CountriesPageProps) {
    const [modalArticle, setModalArticle] = useState<NewsArticleItem | null>(null);
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedUrls));
    const [searchCountry, setSearchCountry] = useState('');
    const [compareMode, setCompareMode] = useState(!!compareCountry);

    const handlePrimaryChange = (code: string) => {
        router.get('/countries', {
            country: code,
            compare: compareCountry,
        }, { preserveState: true });
    };

    const handleCompareChange = (code: string) => {
        router.get('/countries', {
            country: primaryCountry,
            compare: code === 'none' ? null : code,
        }, { preserveState: true });
    };

    const handleBookmarkToggled = (url: string, newState: boolean) => {
        const next = new Set(bookmarks);
        if (newState) next.add(url);
        else next.delete(url);
        setBookmarks(next);
    };

    const primaryObj = countries.find((c) => c.code.toLowerCase() === primaryCountry.toLowerCase());
    const compareObj = countries.find((c) => c.code.toLowerCase() === compareCountry?.toLowerCase());

    const filteredCountries = countries.filter(
        (c) =>
            c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
            c.code.toLowerCase().includes(searchCountry.toLowerCase())
    );

    return (
        <AppLayout title="Browse News by Country & Sovereign Comparison">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            Sovereign Coverage
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            • 54 Recognized Media Territories
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Geographic Intelligence & Comparison
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Inspect national press coverage or compare stories between two countries side-by-side.
                    </p>
                </div>

                {/* Compare Mode Toggle */}
                <button
                    onClick={() => {
                        const newMode = !compareMode;
                        setCompareMode(newMode);
                        if (!newMode) {
                            handleCompareChange('none');
                        } else if (!compareCountry) {
                            handleCompareChange('ph'); // default compare
                        }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-md self-start lg:self-auto ${
                        compareMode
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>{compareMode ? 'Exit Comparison Mode' : 'Compare Two Countries'}</span>
                </button>
            </div>

            {/* Country Selectors Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
                <CountrySelector
                    countries={countries}
                    selectedCountry={primaryCountry}
                    onChange={handlePrimaryChange}
                    label="Primary Country / Territory"
                    allowAll={true}
                />

                {compareMode ? (
                    <div className="relative">
                        <CountrySelector
                            countries={countries}
                            selectedCountry={compareCountry || 'ph'}
                            onChange={handleCompareChange}
                            label="Comparison Country / Territory"
                            allowAll={false}
                        />
                        <button
                            onClick={() => {
                                setCompareMode(false);
                                handleCompareChange('none');
                            }}
                            className="absolute -top-1 right-0 text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            <span>Close Compare</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
                        <div className="font-semibold text-slate-300 mb-0.5">Dual Country Comparison Available</div>
                        <p className="text-[11px] text-slate-400">
                            Click 'Compare Two Countries' above to align newsfeeds from two different nations simultaneously.
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Country Grid Explorer (Browse all countries with counts) */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Quick Territory Directory ({countries.length})
                    </h3>
                    <div className="relative w-48">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchCountry}
                            onChange={(e) => setSearchCountry(e.target.value)}
                            placeholder="Filter territories..."
                            className="w-full pl-7 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <button
                        onClick={() => handlePrimaryChange('all')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            primaryCountry === 'all'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Worldwide</span>
                    </button>
                    {filteredCountries.map((c) => {
                        const active = primaryCountry.toLowerCase() === c.code.toLowerCase();
                        const count = countryCounts[c.code.toLowerCase()] || 0;
                        return (
                            <button
                                key={c.code}
                                onClick={() => handlePrimaryChange(c.code)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    active
                                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                }`}
                            >
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                                {count > 0 && (
                                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800/80 text-slate-400 font-mono">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Articles Display (Single vs Comparison Mode) */}
            {compareMode && compareObj ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Primary Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-indigo-500/30">
                            <span className="text-xl">{primaryObj?.flag || '🌐'}</span>
                            <h2 className="text-lg font-bold text-white tracking-tight">
                                {primaryObj?.name || 'Worldwide News'}
                            </h2>
                            <span className="ml-auto text-xs text-slate-400 font-mono">
                                {primaryArticles.length} articles
                            </span>
                        </div>

                        {primaryArticles.length === 0 ? (
                            <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                                No articles found for this country.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {primaryArticles.map((article, idx) => (
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
                    </div>

                    {/* Comparison Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyan-500/30">
                            <span className="text-xl">{compareObj.flag}</span>
                            <h2 className="text-lg font-bold text-white tracking-tight">
                                {compareObj.name}
                            </h2>
                            <span className="ml-auto text-xs text-slate-400 font-mono">
                                {compareArticles.length} articles
                            </span>
                        </div>

                        {compareArticles.length === 0 ? (
                            <div className="p-8 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                                No articles found for this country.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {compareArticles.map((article, idx) => (
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
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{primaryObj?.flag || '🌐'}</span>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    {primaryObj ? `Latest Headlines from ${primaryObj.name}` : 'Worldwide News Feed'}
                                </h2>
                                <p className="text-xs text-slate-400 font-mono">
                                    ISO Code: {primaryCountry.toUpperCase()} • {primaryArticles.length} dispatches retrieved
                                </p>
                            </div>
                        </div>
                    </div>

                    {primaryArticles.length === 0 ? (
                        <EmptyState
                            title="No Articles Cataloged for this Country"
                            description="No news articles found for this specific territory. Try choosing another country or viewing worldwide news."
                            onAction={() => handlePrimaryChange('all')}
                            actionLabel="View Worldwide"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {primaryArticles.map((article, idx) => (
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
