<?php

namespace Tests\Feature;

use App\Models\Bookmark;
use App\Models\NewsArticle;
use App\Models\NewsSource;
use App\Models\User;
use App\Services\News\NewsApiProvider;
use App\Services\News\NewsProviderInterface;
use App\Services\News\NewsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NewsFilteringTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed reference news articles
        $this->seedSampleArticles();
    }

    private function seedSampleArticles(): void
    {
        // 1. PH Tech Articles in Oct 2026 on Monday & Friday
        NewsArticle::create([
            'title' => 'PH AI Hub Launch',
            'canonical_url' => 'https://example.com/ph-ai-hub',
            'country' => 'ph',
            'category' => 'technology',
            // Friday, Oct 2, 2026
            'published_at' => Carbon::parse('2026-10-02 10:00:00'),
        ]);

        NewsArticle::create([
            'title' => 'PH Fintech Lending Growth',
            'canonical_url' => 'https://example.com/ph-fintech',
            'country' => 'ph',
            'category' => 'technology',
            // Monday, Oct 5, 2026
            'published_at' => Carbon::parse('2026-10-05 14:00:00'),
        ]);

        NewsArticle::create([
            'title' => 'PH Semiconductor Testing',
            'canonical_url' => 'https://example.com/ph-semiconductor',
            'country' => 'ph',
            'category' => 'technology',
            // Friday, Oct 9, 2026
            'published_at' => Carbon::parse('2026-10-09 16:00:00'),
        ]);

        // 2. PH Tech Article on a WEDNESDAY (Day 3) to test weekday filtering rejection
        NewsArticle::create([
            'title' => 'PH Midweek Innovation Update',
            'canonical_url' => 'https://example.com/ph-midweek',
            'country' => 'ph',
            'category' => 'technology',
            // Wednesday, Oct 7, 2026
            'published_at' => Carbon::parse('2026-10-07 11:00:00'),
        ]);

        // 3. US Tech Article (different country)
        NewsArticle::create([
            'title' => 'US Quantum Breakthrough',
            'canonical_url' => 'https://example.com/us-quantum',
            'country' => 'us',
            'category' => 'technology',
            'published_at' => Carbon::parse('2026-10-05 15:00:00'),
        ]);

        // 4. PH Business Article (different category)
        NewsArticle::create([
            'title' => 'PH Stock Exchange Record',
            'canonical_url' => 'https://example.com/ph-business',
            'country' => 'ph',
            'category' => 'business',
            'published_at' => Carbon::parse('2026-10-05 09:00:00'),
        ]);

        // 5. November 2026 article (out of Oct date range)
        NewsArticle::create([
            'title' => 'Future Nov Article',
            'canonical_url' => 'https://example.com/ph-nov',
            'country' => 'ph',
            'category' => 'technology',
            'published_at' => Carbon::parse('2026-11-06 10:00:00'),
        ]);
    }

    /**
     * Test Prompt Scenario 5:
     * Country: Philippines
     * Category: Technology
     * Start date: Oct 1, 2026
     * End date: Oct 31, 2026
     * Weekdays: Monday (1) and Friday (5)
     * Sort: Newest first
     */
    public function test_prompt_scenario_philippines_technology_october_mondays_and_fridays(): void
    {
        $response = $this->get(route('news.search', [
            'country'    => 'ph',
            'category'   => 'technology',
            'from'       => '2026-10-01',
            'to'         => '2026-10-31',
            'weekdays'   => [1, 5], // Monday=1, Friday=5
            'sortBy'     => 'newest',
        ]));

        $response->assertStatus(200);

        // Fetch query directly using the same logic to assert returned records
        $articles = NewsArticle::query()
            ->forCountry('ph')
            ->forCategory('technology')
            ->publishedBetween('2026-10-01', '2026-10-31')
            ->forWeekdays([1, 5])
            ->orderBy('published_at', 'desc')
            ->get();

        // Exactly 3 articles match (Oct 9 Fri, Oct 5 Mon, Oct 2 Fri)
        // Wednesday Oct 7 is excluded, US is excluded, Business is excluded, Nov is excluded!
        $this->assertCount(3, $articles);

        // Assert newest first
        $this->assertEquals('PH Semiconductor Testing', $articles[0]->title);
        $this->assertEquals('PH Fintech Lending Growth', $articles[1]->title);
        $this->assertEquals('PH AI Hub Launch', $articles[2]->title);
    }

    public function test_date_range_validation_start_date_cannot_be_after_end_date(): void
    {
        $response = $this->get(route('news.search', [
            'from' => '2026-10-31',
            'to'   => '2026-10-01',
        ]));

        $response->assertSessionHasErrors(['to']);
    }

    public function test_single_weekday_filter_only_returns_selected_day(): void
    {
        // Monday only (1)
        $articles = NewsArticle::query()
            ->forCountry('ph')
            ->forWeekdays([1])
            ->get();

        foreach ($articles as $article) {
            $this->assertEquals(1, $article->published_at->dayOfWeek);
        }
    }

    public function test_bookmark_toggle_adds_and_removes_bookmark(): void
    {
        $user = User::factory()->create();

        $article = NewsArticle::first();

        // Toggle on
        $response = $this->actingAs($user)->postJson(route('bookmarks.toggle'), [
            'canonical_url' => $article->canonical_url,
            'title' => $article->title,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['bookmarked' => true]);
        $this->assertDatabaseHas('bookmarks', [
            'user_id' => $user->id,
            'news_article_id' => $article->id,
        ]);

        // Toggle off
        $response = $this->actingAs($user)->postJson(route('bookmarks.toggle'), [
            'canonical_url' => $article->canonical_url,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['bookmarked' => false]);
        $this->assertDatabaseMissing('bookmarks', [
            'user_id' => $user->id,
            'news_article_id' => $article->id,
        ]);
    }

    public function test_mocked_news_api_provider_handles_rate_limits_gracefully(): void
    {
        Http::fake([
            'https://newsapi.org/v2/*' => Http::response([
                'status' => 'error',
                'code' => 'rateLimited',
                'message' => 'Rate limit exceeded.',
            ], 429),
        ]);

        $provider = new NewsApiProvider();
        $response = $provider->getTopHeadlines(['country' => 'us']);

        $this->assertEquals('error', $response['status']);
        $this->assertStringContainsString('Rate limit exceeded', $response['message']);
    }

    public function test_mocked_news_api_provider_handles_successful_headlines(): void
    {
        Http::fake([
            'https://newsapi.org/v2/top-headlines*' => Http::response([
                'status' => 'ok',
                'totalResults' => 1,
                'articles' => [
                    [
                        'source' => ['id' => 'reuters', 'name' => 'Reuters'],
                        'author' => 'Jane Doe',
                        'title' => 'Mocked Global Trade Pact Signed',
                        'description' => 'A comprehensive agreement was signed in Geneva.',
                        'url' => 'https://reuters.com/mocked-trade-pact',
                        'urlToImage' => 'https://example.com/image.jpg',
                        'publishedAt' => '2026-10-20T12:00:00Z',
                    ],
                ],
            ], 200),
        ]);

        $provider = new NewsApiProvider();
        $response = $provider->getTopHeadlines(['country' => 'us']);

        $this->assertEquals('ok', $response['status']);
        $this->assertCount(1, $response['articles']);
        $this->assertEquals('Mocked Global Trade Pact Signed', $response['articles'][0]['title']);
    }
}
