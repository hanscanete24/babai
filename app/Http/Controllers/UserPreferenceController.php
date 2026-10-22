<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserPreference;
use App\Services\News\NewsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserPreferenceController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function edit(Request $request): Response
    {
        $user = $request->user() ?? User::firstOrCreate(
            ['email' => 'analyst@pulsenews.io'],
            ['name' => 'Lead News Analyst', 'password' => bcrypt('password123')]
        );

        $preferences = UserPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'preferred_countries'  => ['ph', 'us', 'gb', 'jp'],
                'preferred_categories' => ['technology', 'business', 'general'],
                'timezone'             => 'Asia/Manila',
                'theme'                => 'dark',
                'default_country'      => 'ph',
                'default_category'     => 'technology',
            ]
        );

        return Inertia::render('Settings', [
            'preferences' => $preferences,
            'countries'   => $this->newsService->getSupportedCountries(),
            'categories'  => $this->newsService->getCategories(),
            'apiKeyConfigured' => !empty(config('services.newsapi.key')),
            'providerLimitations' => $this->newsService->normalizeResponse(['status' => 'ok'])['limitations'] ?? [],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user() ?? User::firstOrCreate(
            ['email' => 'analyst@pulsenews.io'],
            ['name' => 'Lead News Analyst', 'password' => bcrypt('password123')]
        );

        $validated = $request->validate([
            'preferred_countries'  => ['nullable', 'array'],
            'preferred_countries.*'=> ['string'],
            'preferred_categories' => ['nullable', 'array'],
            'preferred_categories.*'=> ['string'],
            'timezone'             => ['required', 'string'],
            'theme'                => ['required', 'string', 'in:dark,light,system'],
            'default_country'      => ['nullable', 'string'],
            'default_category'     => ['nullable', 'string'],
        ]);

        UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('success', 'Preferences updated successfully.');
    }
}
