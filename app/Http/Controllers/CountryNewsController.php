<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Services\News\NewsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CountryNewsController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function index(Request $request): Response
    {
        $primaryCountry = $request->input('country', 'us');
        $compareCountry = $request->input('compare', null); // second country for comparison

        $countries = $this->newsService->getSupportedCountries();

        // Fetch primary country articles
        $primaryArticles = $this->getCountryArticles($primaryCountry);

        // Fetch compare country articles if requested
        $compareArticles = $compareCountry ? $this->getCountryArticles($compareCountry) : [];

        // Count of articles stored per country
        $countryCounts = NewsArticle::selectRaw('country, count(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->pluck('count', 'country')
            ->toArray();

        $user = $request->user();
        $bookmarkedUrls = $user ? $user->bookmarkedArticles()->pluck('canonical_url')->toArray() : [];

        return Inertia::render('Countries', [
            'primaryCountry'  => $primaryCountry,
            'compareCountry'  => $compareCountry,
            'primaryArticles' => $primaryArticles,
            'compareArticles' => $compareArticles,
            'countries'       => $countries,
            'countryCounts'   => $countryCounts,
            'bookmarkedUrls'  => $bookmarkedUrls,
        ]);
    }

    private function getCountryArticles(string $country): array
    {
        // 1. First fetch live articles from NewsAPI
        $result = $this->newsService->getHeadlines([
            'country'  => $country === 'all' ? null : $country,
            'pageSize' => 18,
        ]);

        if (!empty($result['articles'])) {
            return $result['articles'];
        }

        // 2. Fall back to database records if API is unavailable or empty
        $query = NewsArticle::query();
        if ($country !== 'all') {
            $query->where('country', strtolower($country));
        }

        return $query->orderByDesc('published_at')
            ->limit(18)
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
            ])->toArray();
    }
}
