<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Services\News\NewsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryNewsController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function index(Request $request): Response
    {
        $selectedCategory = $request->input('category', 'technology');
        $country = $request->input('country', 'all');

        // 1. First fetch live articles from NewsAPI
        $apiResult = $this->newsService->getHeadlines([
            'category' => $selectedCategory !== 'all' ? $selectedCategory : null,
            'country'  => $country !== 'all' ? $country : 'us',
            'pageSize' => 24,
        ]);
        $articlesData = $apiResult['articles'] ?? [];

        // 2. Fall back to database records if API returned empty
        if (empty($articlesData)) {
            $articles = NewsArticle::query()
                ->when($selectedCategory !== 'all', fn($q) => $q->where('category', $selectedCategory))
                ->when($country !== 'all', fn($q) => $q->where('country', strtolower($country)))
                ->orderByDesc('published_at')
                ->limit(24)
                ->get();

            $articlesData = $articles->map(fn($a) => [
                'id'            => $a->id,
                'title'         => $a->title,
                'description'   => $a->description,
                'author'        => $a->author,
                'source_name'   => $a->source_name,
                'image_url'     => $a->image_url,
                'canonical_url' => $a->canonical_url,
                'country'       => $a->country,
                'category'      => $a->category,
                'published_at'  => $a->published_at?->toIso8601String(),
                'is_breaking'   => (bool) $a->is_breaking,
                'is_seeded'     => (bool) ($a->is_seeded ?? false),
            ])->toArray();
        }

        // Stats by category
        $categoryCounts = NewsArticle::selectRaw('category, count(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        $user = $request->user();
        $bookmarkedUrls = $user ? $user->bookmarkedArticles()->pluck('canonical_url')->toArray() : [];

        return Inertia::render('Categories', [
            'selectedCategory' => $selectedCategory,
            'selectedCountry'  => $country,
            'articles'         => $articlesData,
            'categories'       => $this->newsService->getCategories(),
            'categoryCounts'   => $categoryCounts,
            'countries'        => $this->newsService->getSupportedCountries(),
            'bookmarkedUrls'   => $bookmarkedUrls,
        ]);
    }
}
