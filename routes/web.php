<?php

use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\CategoryNewsController;
use App\Http\Controllers\CountryNewsController;
use App\Http\Controllers\NewsAnalyticsController;
use App\Http\Controllers\NewsDashboardController;
use App\Http\Controllers\NewsQuizController;
use App\Http\Controllers\NewsSearchController;
use App\Http\Controllers\UserPreferenceController;
use Illuminate\Support\Facades\Route;

// ─── World News Monitoring Routes ────────────────────────────────────────────

Route::get('/', [NewsDashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard', [NewsDashboardController::class, 'index'])->name('dashboard.alt');

// Search & Advanced Date/Weekday Filtering
Route::get('/search', [NewsSearchController::class, 'index'])->name('news.search');

// Country Discovery & Comparison
Route::get('/countries', [CountryNewsController::class, 'index'])->name('news.countries');

// Category Discovery
Route::get('/categories', [CategoryNewsController::class, 'index'])->name('news.categories');

// News Analytics & Visual Reports
Route::get('/analytics', [NewsAnalyticsController::class, 'index'])->name('news.analytics');

// News Quiz
Route::get('/quiz', [NewsQuizController::class, 'index'])->name('news.quiz');

// Saved Articles & Bookmarks
Route::get('/bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');
Route::post('/api/bookmarks/toggle', [BookmarkController::class, 'toggle'])->name('bookmarks.toggle');
Route::delete('/bookmarks/{id}', [BookmarkController::class, 'destroy'])->name('bookmarks.destroy');

// Settings & Preferences
Route::get('/settings', [UserPreferenceController::class, 'edit'])->name('settings.edit');
Route::post('/settings', [UserPreferenceController::class, 'update'])->name('settings.update');
Route::put('/settings', [UserPreferenceController::class, 'update'])->name('settings.update.put');
