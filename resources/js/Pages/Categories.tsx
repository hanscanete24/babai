import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { NewsCard } from '@/Components/News/NewsCard';
import { ArticleModal } from '@/Components/News/ArticleModal';
import { EmptyState } from '@/Components/News/EmptyState';
import { Country, NewsArticleItem } from '@/types';
import {
    Layers,
    Cpu,
    Briefcase,
    Activity,
    FlaskConical,
    Trophy,
    Film,
    Globe,
    Check
} from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/utils';

interface CategoriesPageProps {
    selectedCategory: string;
    selectedCountry: string;
    articles: NewsArticleItem[];
    categories: string[];
    categoryCounts: Record<string, number>;
    countries: Country[];
    bookmarkedUrls: string[];
}

export default function CategoriesPage({
    selectedCategory = 'technology',
    selectedCountry = 'all',
    articles = [],
    categories = [],
    categoryCounts = {},
    countries = [],
    bookmarkedUrls = [],
}: CategoriesPageProps) {
    const [modalArticle, setModalArticle] = useState<NewsArticleItem | null>(null);
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(bookmarkedUrls));

    const categoryIcons: Record<string, React.ReactNode> = {
        technology: <Cpu className="w-5 h-5" />,
        business: <Briefcase className="w-5 h-5" />,
        health: <Activity className="w-5 h-5" />,
        science: <FlaskConical className="w-5 h-5" />,
        sports: <Trophy className="w-5 h-5" />,
        entertainment: <Film className="w-5 h-5" />,
        general: <Globe className="w-5 h-5" />,
    };

    const handleCategoryClick = (cat: string) => {
        router.get('/categories', {
            category: cat,
            country: selectedCountry,
        }, { preserveState: true });
    };

    const handleCountryChange = (countryCode: string) => {
        router.get('/categories', {
            category: selectedCategory,
            country: countryCode,
        }, { preserveState: true });
    };

    const handleBookmarkToggled = (url: string, newState: boolean) => {
        const next = new Set(bookmarks);
        if (newState) next.add(url);
        else next.delete(url);
        setBookmarks(next);
    };

    return (
        <AppLayout title="Browse News by Domain & Category">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                            Subject Taxonomy
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            • 7 Global Topics
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Domain & Topic Classification
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Explore specialized intelligence across Technology, Business, Healthcare, Science, and World Affairs.
                    </p>
                </div>

                {/* Country Filter for Category */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Territory:</span>
                    <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">Worldwide</option>
                        {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category Topic Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-10">
                {categories.map((cat) => {
                    const active = selectedCategory === cat;
                    const count = categoryCounts[cat] || 0;
                    const style = CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;

                    return (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 border text-center ${
                                active
                                    ? `bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10 ring-1 ring-indigo-500/50`
                                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <div className={`p-2.5 rounded-xl mb-2.5 ${active ? 'bg-indigo-500 text-white' : style.bg + ' ' + style.text}`}>
                                {categoryIcons[cat] || <Layers className="w-5 h-5" />}
                            </div>
                            <span className="text-xs font-bold capitalize tracking-tight mb-1">
                                {cat}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                {count} {count === 1 ? 'article' : 'articles'}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Category Headline Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold font-mono">
                        Active Category Feed:
                    </span>
                    <span className="text-lg font-bold text-white capitalize">
                        {selectedCategory}
                    </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                    Showing {articles.length} dispatches
                </span>
            </div>

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <EmptyState
                    title={`No Dispatches in ${selectedCategory.toUpperCase()}`}
                    description="No articles found for this topic and country filter. Try selecting 'Worldwide' or exploring another domain."
                    onAction={() => handleCountryChange('all')}
                    actionLabel="View Worldwide"
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
