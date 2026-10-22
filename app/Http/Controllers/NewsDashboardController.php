<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Services\News\NewsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsDashboardController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function index(Request $request): Response
    {
        $country = $request->input('country', 'us');
        $category = $request->input('category', 'all');

        $newsResult = $this->newsService->getHeadlines([
            'country'  => $country,
            'category' => $category,
            'pageSize' => 24,
        ]);

        // If API returned 0 articles (e.g. no API key configured or rate limit),
        // fallback to stored database articles so the user immediately sees a working, populated dashboard!
        $articles = $newsResult['articles'];
        if (empty($articles)) {
            $dbArticles = NewsArticle::query()
                ->when($country !== 'all', fn($q) => $q->where('country', strtolower($country)))
                ->when($category !== 'all', fn($q) => $q->where('category', $category))
                ->orderByDesc('published_at')
                ->limit(24)
                ->get()
                ->map(fn($a) => [
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
                ]);

            if ($dbArticles->isNotEmpty()) {
                $articles = $dbArticles->toArray();
            }
        }

        // Detect breaking news (top 3 newest articles or flagged)
        $breakingNews = collect($articles)->take(4)->values()->toArray();

        // Stored bookmarks for authenticated user or guest session
        $user = $request->user();
        $bookmarkedUrls = [];
        if ($user) {
            $bookmarkedUrls = $user->bookmarkedArticles()->pluck('canonical_url')->toArray();
        }

        return Inertia::render('Dashboard', [
            'articles'           => $articles,
            'breakingNews'       => $breakingNews,
            'selectedCountry'    => $country,
            'selectedCategory'   => $category,
            'countries'          => $this->newsService->getSupportedCountries(),
            'categories'         => $this->newsService->getCategories(),
            'provider'           => $newsResult['provider'] ?? 'PulseNews Engine',
            'limitations'        => $newsResult['limitations'] ?? [],
            'bookmarkedUrls'     => $bookmarkedUrls,
            'totalArticles'      => count($articles),
            'apiError'           => $newsResult['error'] ?? null,
        ]);
    }
}
