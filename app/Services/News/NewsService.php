<?php

namespace App\Services\News;

use App\Models\NewsArticle;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Orchestrates news fetching, normalization, date/weekday filtering,
 * and persistence. Works with any NewsProviderInterface implementation.
 */
class NewsService
{
    // Supported NewsAPI countries (for top-headlines)
    public const SUPPORTED_COUNTRIES = [
        'ae' => ['name' => 'UAE',           'flag' => '🇦🇪'],
        'ar' => ['name' => 'Argentina',     'flag' => '🇦🇷'],
        'at' => ['name' => 'Austria',       'flag' => '🇦🇹'],
        'au' => ['name' => 'Australia',     'flag' => '🇦🇺'],
        'be' => ['name' => 'Belgium',       'flag' => '🇧🇪'],
        'bg' => ['name' => 'Bulgaria',      'flag' => '🇧🇬'],
        'br' => ['name' => 'Brazil',        'flag' => '🇧🇷'],
        'ca' => ['name' => 'Canada',        'flag' => '🇨🇦'],
        'ch' => ['name' => 'Switzerland',   'flag' => '🇨🇭'],
        'cn' => ['name' => 'China',         'flag' => '🇨🇳'],
        'co' => ['name' => 'Colombia',      'flag' => '🇨🇴'],
        'cu' => ['name' => 'Cuba',          'flag' => '🇨🇺'],
        'cz' => ['name' => 'Czech Republic','flag' => '🇨🇿'],
        'de' => ['name' => 'Germany',       'flag' => '🇩🇪'],
        'eg' => ['name' => 'Egypt',         'flag' => '🇪🇬'],
        'fr' => ['name' => 'France',        'flag' => '🇫🇷'],
        'gb' => ['name' => 'UK',            'flag' => '🇬🇧'],
        'gr' => ['name' => 'Greece',        'flag' => '🇬🇷'],
        'hk' => ['name' => 'Hong Kong',     'flag' => '🇭🇰'],
        'hu' => ['name' => 'Hungary',       'flag' => '🇭🇺'],
        'id' => ['name' => 'Indonesia',     'flag' => '🇮🇩'],
        'ie' => ['name' => 'Ireland',       'flag' => '🇮🇪'],
        'il' => ['name' => 'Israel',        'flag' => '🇮🇱'],
        'in' => ['name' => 'India',         'flag' => '🇮🇳'],
        'it' => ['name' => 'Italy',         'flag' => '🇮🇹'],
        'jp' => ['name' => 'Japan',         'flag' => '🇯🇵'],
        'kr' => ['name' => 'South Korea',   'flag' => '🇰🇷'],
        'lt' => ['name' => 'Lithuania',     'flag' => '🇱🇹'],
        'lv' => ['name' => 'Latvia',        'flag' => '🇱🇻'],
        'ma' => ['name' => 'Morocco',       'flag' => '🇲🇦'],
        'mx' => ['name' => 'Mexico',        'flag' => '🇲🇽'],
        'my' => ['name' => 'Malaysia',      'flag' => '🇲🇾'],
        'ng' => ['name' => 'Nigeria',       'flag' => '🇳🇬'],
        'nl' => ['name' => 'Netherlands',   'flag' => '🇳🇱'],
        'no' => ['name' => 'Norway',        'flag' => '🇳🇴'],
        'nz' => ['name' => 'New Zealand',   'flag' => '🇳🇿'],
        'ph' => ['name' => 'Philippines',   'flag' => '🇵🇭'],
        'pl' => ['name' => 'Poland',        'flag' => '🇵🇱'],
        'pt' => ['name' => 'Portugal',      'flag' => '🇵🇹'],
        'ro' => ['name' => 'Romania',       'flag' => '🇷🇴'],
        'rs' => ['name' => 'Serbia',        'flag' => '🇷🇸'],
        'ru' => ['name' => 'Russia',        'flag' => '🇷🇺'],
        'sa' => ['name' => 'Saudi Arabia',  'flag' => '🇸🇦'],
        'se' => ['name' => 'Sweden',        'flag' => '🇸🇪'],
        'sg' => ['name' => 'Singapore',     'flag' => '🇸🇬'],
        'si' => ['name' => 'Slovenia',      'flag' => '🇸🇮'],
        'sk' => ['name' => 'Slovakia',      'flag' => '🇸🇰'],
        'th' => ['name' => 'Thailand',      'flag' => '🇹🇭'],
        'tr' => ['name' => 'Turkey',        'flag' => '🇹🇷'],
        'tw' => ['name' => 'Taiwan',        'flag' => '🇹🇼'],
        'ua' => ['name' => 'Ukraine',       'flag' => '🇺🇦'],
        'us' => ['name' => 'USA',           'flag' => '🇺🇸'],
        've' => ['name' => 'Venezuela',     'flag' => '🇻🇪'],
        'za' => ['name' => 'South Africa',  'flag' => '🇿🇦'],
    ];

    public const CATEGORIES = [
        'general',
        'business',
        'entertainment',
        'health',
        'science',
        'sports',
        'technology',
    ];

    public function __construct(
        private readonly NewsProviderInterface $provider
    ) {}

    // ─── Main Entry Points ───────────────────────────────────────────────────

    /**
     * Get top headlines for dashboard, optionally filtered by country/category.
     */
    public function getHeadlines(array $filters = []): array
    {
        $country = $filters['country'] ?? null;
        $category = $filters['category'] ?? null;

        // NewsAPI top-headlines: country must be a single supported code
        $params = array_filter([
            'country'  => ($country && $country !== 'all' && array_key_exists($country, self::SUPPORTED_COUNTRIES))
                ? $country : null,
            'category' => ($category && $category !== 'all') ? $category : null,
            'q'        => $filters['q'] ?? null,
            'page'     => $filters['page'] ?? 1,
            'pageSize' => $filters['pageSize'] ?? 20,
        ]);

        // Fall back to /everything if country not supported in headlines
        if (($country && $country !== 'all') && !array_key_exists($country, self::SUPPORTED_COUNTRIES)) {
            return $this->searchWithFilters(array_merge($filters, ['language' => 'en']));
        }

        $raw = $this->provider->getTopHeadlines($params);
        return $this->normalizeResponse($raw, $filters);
    }

    /**
     * Full search with all filters: keyword, country, category, date range, weekdays.
     */
    public function searchWithFilters(array $filters = []): array
    {
        $from = $this->resolveDateFrom($filters);
        $to   = $this->resolveDateTo($filters);

        $params = array_filter([
            'q'        => $filters['q'] ?? $filters['keyword'] ?? 'world news',
            'from'     => $from,
            'to'       => $to,
            'language' => $filters['language'] ?? null,
            'sortBy'   => $filters['sortBy'] ?? 'publishedAt',
            'page'     => $filters['page'] ?? 1,
            'pageSize' => $filters['pageSize'] ?? 20,
        ]);

        $raw = $this->provider->searchArticles($params);
        return $this->normalizeResponse($raw, $filters);
    }

    /**
     * Persist and filter articles from API response, applying weekday filtering.
     */
    public function normalizeResponse(array $raw, array $filters = []): array
    {
        if (($raw['status'] ?? '') === 'error') {
            return [
                'articles' => [],
                'total' => 0,
                'error' => $raw['message'] ?? 'Unknown error',
                'provider' => $this->provider->getProviderName(),
                'limitations' => $this->provider->getLimitations(),
            ];
        }

        $rawArticles = $raw['articles'] ?? [];
        $weekdays    = $filters['weekdays'] ?? [];
        $timezone    = $filters['timezone'] ?? 'UTC';
        $country     = $filters['country'] ?? null;
        $category    = $filters['category'] ?? null;

        $articles = collect($rawArticles)
            ->map(fn($a) => $this->normalizeArticle($a, $country, $category))
            ->filter(fn($a) => !empty($a['title']) && $a['title'] !== '[Removed]')
            ->values();

        // Apply weekday filter server-side (API doesn't support this natively)
        if (!empty($weekdays)) {
            $articles = $articles->filter(function ($article) use ($weekdays, $timezone) {
                if (empty($article['published_at'])) return false;
                try {
                    $dt = Carbon::parse($article['published_at'])->setTimezone($timezone);
                    // Carbon's dayOfWeek: 0=Sunday ... 6=Saturday
                    return in_array($dt->dayOfWeek, array_map('intval', $weekdays));
                } catch (\Exception) {
                    return false;
                }
            })->values();
        }

        // Upsert into DB for analytics/bookmarks (async would be better but sync for simplicity)
        $this->upsertArticles($articles, $country, $category);

        return [
            'articles'    => $articles->toArray(),
            'total'       => $raw['totalResults'] ?? count($articles),
            'provider'    => $this->provider->getProviderName(),
            'limitations' => $this->provider->getLimitations(),
            'weekday_filtered' => !empty($weekdays),
        ];
    }

    /**
     * Get analytics data from stored articles.
     */
    public function getAnalytics(array $filters = []): array
    {
        $query = NewsArticle::query();

        if (!empty($filters['from'])) {
            $query->where('published_at', '>=', Carbon::parse($filters['from'])->startOfDay());
        }
        if (!empty($filters['to'])) {
            $query->where('published_at', '<=', Carbon::parse($filters['to'])->endOfDay());
        }

        // Articles per day
        $perDay = (clone $query)
            ->selectRaw('DATE(published_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($r) => ['date' => $r->date, 'count' => $r->count]);

        // By country
        $byCountry = (clone $query)
            ->selectRaw('country, COUNT(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('count')
            ->limit(15)
            ->get()
            ->map(fn($r) => [
                'country' => $r->country,
                'name'    => self::SUPPORTED_COUNTRIES[$r->country]['name'] ?? strtoupper($r->country),
                'flag'    => self::SUPPORTED_COUNTRIES[$r->country]['flag'] ?? '🏳️',
                'count'   => $r->count,
            ]);

        // By category
        $byCategory = (clone $query)
            ->selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['category' => $r->category, 'count' => $r->count]);

        // Top sources
        $topSources = (clone $query)
            ->selectRaw('source_name, COUNT(*) as count')
            ->whereNotNull('source_name')
            ->groupBy('source_name')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn($r) => ['source' => $r->source_name, 'count' => $r->count]);

        return [
            'per_day'     => $perDay->toArray(),
            'by_country'  => $byCountry->toArray(),
            'by_category' => $byCategory->toArray(),
            'top_sources' => $topSources->toArray(),
            'total'       => (clone $query)->count(),
        ];
    }

    public function getSupportedCountries(): array
    {
        return array_map(fn($code, $data) => array_merge($data, ['code' => $code]),
            array_keys(self::SUPPORTED_COUNTRIES),
            array_values(self::SUPPORTED_COUNTRIES)
        );
    }

    public function getCategories(): array
    {
        return self::CATEGORIES;
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private function normalizeArticle(array $raw, ?string $country, ?string $category): array
    {
        return [
            'title'        => $raw['title'] ?? '',
            'description'  => $raw['description'] ?? null,
            'author'       => $raw['author'] ?? null,
            'source_name'  => $raw['source']['name'] ?? null,
            'source_id'    => $raw['source']['id'] ?? null,
            'image_url'    => $raw['urlToImage'] ?? null,
            'canonical_url'=> $raw['url'] ?? null,
            'country'      => $country && $country !== 'all' ? strtolower($country) : null,
            'category'     => $category && $category !== 'all' ? $category : null,
            'published_at' => $raw['publishedAt'] ?? null,
            'is_breaking'  => false,
            'is_seeded'    => false,
        ];
    }

    private function upsertArticles(Collection $articles, ?string $country, ?string $category): void
    {
        foreach ($articles->take(50) as $a) { // limit to avoid long requests
            if (empty($a['canonical_url'])) continue;
            try {
                NewsArticle::updateOrCreate(
                    ['canonical_url' => substr($a['canonical_url'], 0, 2048)],
                    [
                        'title'       => substr($a['title'] ?? '', 0, 1000),
                        'description' => $a['description'] ? substr($a['description'], 0, 5000) : null,
                        'author'      => $a['author'] ? substr($a['author'], 0, 255) : null,
                        'source_name' => $a['source_name'] ? substr($a['source_name'], 0, 255) : null,
                        'image_url'   => $a['image_url'] ? substr($a['image_url'], 0, 2048) : null,
                        'country'     => $country && $country !== 'all' ? strtolower($country) : null,
                        'category'    => $category && $category !== 'all' ? $category : null,
                        'published_at'=> $a['published_at'] ? Carbon::parse($a['published_at']) : null,
                        'is_breaking' => false,
                        'is_seeded'   => false,
                    ]
                );
            } catch (\Exception) {
                // Skip duplicates or invalid data silently
            }
        }
    }

    private function resolveDateFrom(array $filters): ?string
    {
        $preset = $filters['datePreset'] ?? null;
        $from   = $filters['from'] ?? null;

        return match ($preset) {
            'today'     => Carbon::today()->toDateString(),
            'yesterday' => Carbon::yesterday()->toDateString(),
            'last7'     => Carbon::now()->subDays(7)->toDateString(),
            'last30'    => Carbon::now()->subDays(30)->toDateString(),
            default     => $from,
        };
    }

    private function resolveDateTo(array $filters): ?string
    {
        $preset = $filters['datePreset'] ?? null;
        $to     = $filters['to'] ?? null;

        return match ($preset) {
            'yesterday' => Carbon::yesterday()->toDateString(),
            'today', 'last7', 'last30' => Carbon::today()->toDateString(),
            default => $to,
        };
    }
}
