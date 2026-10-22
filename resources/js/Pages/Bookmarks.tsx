import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { NewsCard } from '@/Components/News/NewsCard';
import { ArticleModal } from '@/Components/News/ArticleModal';
import { EmptyState } from '@/Components/News/EmptyState';
import { NewsArticleItem } from '@/types';
import { Bookmark, Trash2, Globe, Layers, ArrowRight } from 'lucide-react';

interface BookmarksPageProps {
    articles: NewsArticleItem[];
    selectedCountry: string;
    selectedCategory: string;
}

export default function BookmarksPage({
    articles = [],
    selectedCountry = 'all',
    selectedCategory = 'all',
}: BookmarksPageProps) {
    const [modalArticle, setModalArticle] = useState<NewsArticleItem | null>(null);

    // Extract unique countries and categories present in user's saved items
    const countriesInBookmarks = Array.from(
        new Set(articles.map((a) => a.country).filter(Boolean))
    ) as string[];

    const categoriesInBookmarks = Array.from(
        new Set(articles.map((a) => a.category).filter(Boolean))
    ) as string[];

    const handleCountryFilter = (country: string) => {
        router.get('/bookmarks', {
            country,
            category: selectedCategory,
        }, { preserveState: true });
    };

    const handleCategoryFilter = (category: string) => {
        router.get('/bookmarks', {
            country: selectedCountry,
            category,
        }, { preserveState: true });
    };

    return (
        <AppLayout title="Saved Articles & Research Bookmarks">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono flex items-center gap-1.5">
                            <Bookmark className="w-3 h-3 fill-current text-indigo-400" />
                            Personal Archive
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            • {articles.length} Saved Records
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Saved Dispatches & Bookmarks
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Curate, categorize, and preserve essential international news dispatches for ongoing analysis.
                    </p>
                </div>
            </div>

            {/* Filter and organize bar */}
            {articles.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Country filter */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Globe className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Country:</span>
                            <select
                                value={selectedCountry}
                                onChange={(e) => handleCountryFilter(e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="all">All Saved Countries</option>
                                {countriesInBookmarks.map((c) => (
                                    <option key={c} value={c}>
                                        {c.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category filter */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Category:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 capitalize focus:outline-none focus:border-indigo-500"
                            >
                                <option value="all">All Domains</option>
                                {categoriesInBookmarks.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                        {articles.length} dispatches displayed
                    </span>
                </div>
            )}

            {/* Articles Grid or Empty State */}
            {articles.length === 0 ? (
                <EmptyState
                    title="No Saved Articles in Your Archive"
                    description="You haven't bookmarked any news dispatches yet. While browsing the Global Dashboard or Search, click the bookmark icon on any card to save it here."
                    onAction={() => router.get('/')}
                    actionLabel="Discover Global News"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, idx) => (
                        <NewsCard
                            key={article.canonical_url || idx}
                            article={article}
                            isBookmarked={true}
                            onOpenModal={(a) => setModalArticle(a)}
                            onBookmarkToggled={() => {
                                // Reload page to update bookmarks list
                                router.reload();
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Article Detail Reader Modal */}
            <ArticleModal
                article={modalArticle}
                isBookmarked={true}
                onClose={() => setModalArticle(null)}
                onToggleBookmark={() => {
                    router.reload();
                }}
            />
        </AppLayout>
    );
}
