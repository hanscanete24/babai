<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\NewsArticle;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookmarkController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $this->resolveUser($request);
        $country = $request->input('country', 'all');
        $category = $request->input('category', 'all');

        $query = $user->bookmarkedArticles()
            ->when($country !== 'all', fn($q) => $q->where('news_articles.country', strtolower($country)))
            ->when($category !== 'all', fn($q) => $q->where('news_articles.category', $category))
            ->orderByDesc('bookmarks.created_at');

        $articles = $query->get()->map(fn($a) => [
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
            'bookmarked_at' => $a->pivot?->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Bookmarks', [
            'articles'         => $articles,
            'selectedCountry'  => $country,
            'selectedCategory' => $category,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'canonical_url' => ['required', 'string'],
            'title'         => ['nullable', 'string'],
            'description'   => ['nullable', 'string'],
            'author'        => ['nullable', 'string'],
            'source_name'   => ['nullable', 'string'],
            'image_url'     => ['nullable', 'string'],
            'country'       => ['nullable', 'string'],
            'category'      => ['nullable', 'string'],
            'published_at'  => ['nullable', 'string'],
        ]);

        // Find or create the article
        $article = NewsArticle::firstOrCreate(
            ['canonical_url' => substr($validated['canonical_url'], 0, 2048)],
            [
                'title'        => substr($validated['title'] ?? 'Untitled Article', 0, 1000),
                'description'  => !empty($validated['description']) ? substr($validated['description'], 0, 5000) : null,
                'author'       => !empty($validated['author']) ? substr($validated['author'], 0, 255) : null,
                'source_name'  => !empty($validated['source_name']) ? substr($validated['source_name'], 0, 255) : null,
                'image_url'    => !empty($validated['image_url']) ? substr($validated['image_url'], 0, 2048) : null,
                'country'      => !empty($validated['country']) ? strtolower($validated['country']) : null,
                'category'     => $validated['category'] ?? null,
                'published_at' => !empty($validated['published_at']) ? Carbon::parse($validated['published_at']) : Carbon::now(),
            ]
        );

        $existing = Bookmark::where('user_id', $user->id)
            ->where('news_article_id', $article->id)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'bookmarked' => false,
                'message'    => 'Bookmark removed successfully',
            ]);
        }

        Bookmark::create([
            'user_id'         => $user->id,
            'news_article_id' => $article->id,
        ]);

        return response()->json([
            'bookmarked' => true,
            'message'    => 'Article saved to bookmarks',
        ]);
    }

    public function destroy(Request $request, int $articleId): RedirectResponse
    {
        $user = $this->resolveUser($request);
        Bookmark::where('user_id', $user->id)->where('news_article_id', $articleId)->delete();

        return back()->with('success', 'Bookmark removed successfully.');
    }

    private function resolveUser(Request $request): User
    {
        if ($request->user()) {
            return $request->user();
        }

        // Return or create default local demo user for pair-programming experience
        return User::firstOrCreate(
            ['email' => 'analyst@pulsenews.io'],
            [
                'name'     => 'Lead News Analyst',
                'password' => bcrypt('password123'),
            ]
        );
    }
}
