<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsSearchRequest;
use App\Models\NewsArticle;
use App\Services\News\NewsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsSearchController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function index(NewsSearchRequest $request): Response
    {
        $validated = $request->validated();

        $q            = $validated['q'] ?? '';
        $country      = $validated['country'] ?? 'all';
        $category     = $validated['category'] ?? 'all';
        $datePreset   = $validated['datePreset'] ?? 'all';
        $specificDate = $validated['specificDate'] ?? null;
        $from         = $validated['from'] ?? null;
        $to           = $validated['to'] ?? null;
        $weekdays     = $validated['weekdays'] ?? [];
        $sortBy       = $validated['sortBy'] ?? 'newest';
        $timezone     = $validated['timezone'] ?? 'UTC';
        $page         = (int) ($validated['page'] ?? 1);
        $pageSize     = (int) ($validated['pageSize'] ?? 18);

        // Normalize date filters based on preset
        if ($datePreset === 'today') {
            $from = Carbon::now($timezone)->startOfDay()->toDateTimeString();
            $to   = Carbon::now($timezone)->endOfDay()->toDateTimeString();
        } elseif ($datePreset === 'yesterday') {
            $from = Carbon::yesterday($timezone)->startOfDay()->toDateTimeString();
            $to   = Carbon::yesterday($timezone)->endOfDay()->toDateTimeString();
        } elseif ($datePreset === 'last7') {
            $from = Carbon::now($timezone)->subDays(7)->startOfDay()->toDateTimeString();
            $to   = Carbon::now($timezone)->endOfDay()->toDateTimeString();
        } elseif ($datePreset === 'last30') {
            $from = Carbon::now($timezone)->subDays(30)->startOfDay()->toDateTimeString();
            $to   = Carbon::now($timezone)->endOfDay()->toDateTimeString();
        } elseif ($datePreset === 'specific' && $specificDate) {
            $from = Carbon::parse($specificDate, $timezone)->startOfDay()->toDateTimeString();
            $to   = Carbon::parse($specificDate, $timezone)->endOfDay()->toDateTimeString();
        }

        // 1. Search database articles with full support for:
        // - Keyword
        // - Country
        // - Category
        // - Exact Date Range
        // - Weekday filters (Monday, Wednesday, Friday, etc.)
        // - Sort Newest / Oldest
        $query = NewsArticle::query()
            ->keyword($q)
            ->forCountry($country)
            ->forCategory($category)
            ->publishedBetween($from, $to)
            ->forWeekdays($weekdays);

        if ($sortBy === 'oldest') {
            $query->orderBy('published_at', 'asc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        $totalFiltered = (clone $query)->count();
        $dbArticles = $query->skip(($page - 1) * $pageSize)->take($pageSize)->get();

        $articles = $dbArticles->map(fn($a) => [
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

        // If local DB returned fewer than 5 results and we have an API query, fetch from NewsAPI provider
        $providerNote = null;
        if (count($articles) < 5 && (!empty($q) || $country !== 'all' || $category !== 'all')) {
            $apiResult = $this->newsService->searchWithFilters([
                'q'        => $q ?: 'world',
                'from'     => $from ? Carbon::parse($from)->toDateString() : null,
                'to'       => $to ? Carbon::parse($to)->toDateString() : null,
                'country'  => $country,
                'category' => $category,
                'weekdays' => $weekdays,
                'timezone' => $timezone,
                'page'     => $page,
                'pageSize' => $pageSize,
            ]);

            if (!empty($apiResult['articles'])) {
                $articles = $apiResult['articles'];
                $totalFiltered = $apiResult['total'];
                $providerNote = "Results retrieved live via " . ($apiResult['provider'] ?? 'API');
            }
        }

        // Get bookmarked URLs for current user
        $user = $request->user();
        $bookmarkedUrls = $user ? $user->bookmarkedArticles()->pluck('canonical_url')->toArray() : [];

        return Inertia::render('Search', [
            'articles'       => $articles,
            'totalResults'   => $totalFiltered,
            'page'           => $page,
            'pageSize'       => $pageSize,
            'totalPages'     => max(1, (int) ceil($totalFiltered / $pageSize)),
            'filters'        => [
                'q'            => $q,
                'country'      => $country,
                'category'     => $category,
                'datePreset'   => $datePreset,
                'specificDate' => $specificDate,
                'from'         => $from ? Carbon::parse($from)->toDateString() : null,
                'to'           => $to ? Carbon::parse($to)->toDateString() : null,
                'weekdays'     => array_map('intval', $weekdays),
                'sortBy'       => $sortBy,
                'timezone'     => $timezone,
            ],
            'countries'      => $this->newsService->getSupportedCountries(),
            'categories'     => $this->newsService->getCategories(),
            'bookmarkedUrls' => $bookmarkedUrls,
            'providerNote'   => $providerNote,
            'limitations'    => $this->newsService->normalizeResponse(['status' => 'ok'])['limitations'] ?? [],
        ]);
    }
}
