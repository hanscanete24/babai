<?php

namespace App\Services\News;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * NewsAPI.org provider (free tier: 100 requests/day, last 30 days of articles).
 * Docs: https://newsapi.org/docs
 */
class NewsApiProvider implements NewsProviderInterface
{
    private const BASE_URL = 'https://newsapi.org/v2';
    private const CACHE_TTL = 300; // 5 minutes

    private string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.newsapi.key', '');
    }

    // ─── Interface Implementation ─────────────────────────────────────────────

    public function getTopHeadlines(array $params = []): array
    {
        $cacheKey = 'newsapi.headlines.' . md5(serialize($params));

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($params) {
            return $this->request('/top-headlines', $this->buildHeadlineParams($params));
        });
    }

    public function searchArticles(array $params = []): array
    {
        $cacheKey = 'newsapi.everything.' . md5(serialize($params));

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($params) {
            return $this->request('/everything', $this->buildEverythingParams($params));
        });
    }

    public function getSources(array $params = []): array
    {
        $cacheKey = 'newsapi.sources.' . md5(serialize($params));

        return Cache::remember($cacheKey, 3600, function () use ($params) {
            return $this->request('/top-headlines/sources', $params);
        });
    }

    public function getProviderName(): string
    {
        return 'NewsAPI';
    }

    public function getLimitations(): array
    {
        return [
            'free_tier' => '100 requests per day',
            'historical_limit' => 'Free tier: articles from last 30 days only',
            'country_support' => 'Supports specific country codes for top-headlines only',
            'weekday_filtering' => 'Applied server-side after date-range retrieval',
            'page_size_max' => 100,
            'total_results_max' => '10,000 per query on free tier',
            'breaking_news' => 'Not natively supported — inferred from recency',
        ];
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function buildHeadlineParams(array $params): array
    {
        $query = array_filter([
            'apiKey'   => $this->apiKey,
            'country'  => $params['country'] ?? null,
            'category' => $params['category'] ?? null,
            'q'        => $params['q'] ?? null,
            'sources'  => $params['sources'] ?? null,
            'page'     => $params['page'] ?? 1,
            'pageSize' => min($params['pageSize'] ?? 20, 100),
        ]);

        // country and sources cannot be mixed
        if (isset($query['sources'])) {
            unset($query['country'], $query['category']);
        }

        return $query;
    }

    private function buildEverythingParams(array $params): array
    {
        return array_filter([
            'apiKey'   => $this->apiKey,
            'q'        => $params['q'] ?? $params['query'] ?? 'world',
            'from'     => $params['from'] ?? null,
            'to'       => $params['to'] ?? null,
            'language' => $params['language'] ?? null,
            'sources'  => $params['sources'] ?? null,
            'sortBy'   => $params['sortBy'] ?? 'publishedAt',
            'page'     => $params['page'] ?? 1,
            'pageSize' => min($params['pageSize'] ?? 20, 100),
        ]);
    }

    private function request(string $endpoint, array $params): array
    {
        if (empty($this->apiKey) || str_starts_with($this->apiKey, 'your_')) {
            // Local mode: No key configured yet, gracefully return empty articles
            // so the system serves verified local repository records without errors.
            return [
                'status' => 'ok',
                'articles' => [],
                'totalResults' => 0,
            ];
        }

        try {
            $response = Http::timeout(10)
                ->get(self::BASE_URL . $endpoint, $params);

            if ($response->successful()) {
                $data = $response->json();
                if (($data['status'] ?? '') === 'ok') {
                    return $data;
                }

                Log::warning('NewsAPI returned non-ok status', [
                    'status' => $data['status'] ?? 'unknown',
                    'message' => $data['message'] ?? '',
                ]);

                return $this->errorResponse($data['message'] ?? 'API returned an error');
            }

            if ($response->status() === 429) {
                return $this->errorResponse('Rate limit exceeded. Please try again later.');
            }

            if ($response->status() === 401) {
                return $this->errorResponse('Invalid API key. Please check your NewsAPI configuration.');
            }

            return $this->errorResponse('News API request failed: HTTP ' . $response->status());
        } catch (ConnectionException $e) {
            Log::error('NewsAPI connection error', ['error' => $e->getMessage()]);
            return $this->errorResponse('Could not connect to news service. Please check your internet connection.');
        } catch (\Exception $e) {
            Log::error('NewsAPI unexpected error', ['error' => $e->getMessage()]);
            return $this->errorResponse('An unexpected error occurred while fetching news.');
        }
    }

    private function errorResponse(string $message): array
    {
        return [
            'status' => 'error',
            'message' => $message,
            'articles' => [],
            'totalResults' => 0,
        ];
    }
}
