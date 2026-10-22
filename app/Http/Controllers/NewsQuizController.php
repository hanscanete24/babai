<?php

namespace App\Http\Controllers;

use App\Models\NewsArticle;
use App\Services\News\NewsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsQuizController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function index(Request $request): Response
    {
        // 1. Fetch live real news articles from NewsAPI (up to 40 articles for rich, long quizzes)
        $liveResult = $this->newsService->getHeadlines([
            'pageSize' => 40,
        ]);
        $rawArticles = $liveResult['articles'] ?? [];

        // Filter for only valid, accurate articles
        $articles = collect($rawArticles)
            ->filter(fn($a) => 
                !empty($a['title']) && 
                $a['title'] !== '[Removed]' && 
                !empty($a['description']) && 
                strlen($a['description']) > 20 &&
                !empty($a['canonical_url']) &&
                str_starts_with($a['canonical_url'], 'http') &&
                ($a['is_seeded'] ?? false) === false
            )
            ->values()
            ->toArray();

        // 2. If API was empty/unavailable, query only verified real articles from database
        if (empty($articles)) {
            $articles = NewsArticle::where('is_seeded', false)
                ->where('title', '!=', '[Removed]')
                ->whereNotNull('title')
                ->whereNotNull('description')
                ->where('description', '!=', '')
                ->where('canonical_url', 'like', 'http%')
                ->orderByDesc('published_at')
                ->limit(40)
                ->get()
                ->map(fn($a) => [
                    'id'           => $a->id,
                    'title'        => $a->title,
                    'description'  => $a->description,
                    'author'       => $a->author,
                    'source_name'  => $a->source_name,
                    'image_url'    => $a->image_url,
                    'canonical_url'=> $a->canonical_url,
                    'country'      => $a->country,
                    'category'      => $a->category,
                    'published_at' => $a->published_at?->toIso8601String(),
                    'is_breaking'  => (bool) $a->is_breaking,
                    'is_seeded'    => false,
                ])
                ->toArray();
        }

        // Collect distractor options strictly from real verified news articles
        $allCountries  = NewsArticle::where('is_seeded', false)->whereNotNull('country')->distinct()->pluck('country')->toArray();
        $allCategories = NewsArticle::where('is_seeded', false)->whereNotNull('category')->distinct()->pluck('category')->toArray();
        $allSources    = NewsArticle::where('is_seeded', false)->whereNotNull('source_name')->distinct()->pluck('source_name')->toArray();
        $allAuthors    = NewsArticle::where('is_seeded', false)->whereNotNull('author')->where('author', 'not like', '%facebook%')->where('author', 'not like', 'http%')->distinct()->pluck('author')->toArray();

        return Inertia::render('Quiz', [
            'articles'      => $articles,
            'allCountries'  => $allCountries,
            'allCategories' => $allCategories,
            'allSources'    => $allSources,
            'allAuthors'    => $allAuthors,
        ]);
    }
}
