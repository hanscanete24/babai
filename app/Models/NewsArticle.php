<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class NewsArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'canonical_url',
        'title',
        'description',
        'author',
        'source_name',
        'news_source_id',
        'image_url',
        'country',
        'language',
        'category',
        'is_breaking',
        'is_seeded',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_breaking' => 'boolean',
        'is_seeded' => 'boolean',
    ];

    // ─── Relationships ──────────────────────────────────────────────────────────

    public function source(): BelongsTo
    {
        return $this->belongsTo(NewsSource::class, 'news_source_id');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────────

    public function scopeForCountry(Builder $query, ?string $country): Builder
    {
        if ($country && $country !== 'all') {
            $query->where('country', strtolower($country));
        }
        return $query;
    }

    public function scopeForCategory(Builder $query, ?string $category): Builder
    {
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }
        return $query;
    }

    public function scopePublishedBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        if ($from) {
            $query->where('published_at', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('published_at', '<=', Carbon::parse($to)->endOfDay());
        }
        return $query;
    }

    /**
     * Filter by specific weekdays (0=Sunday, 1=Monday ... 6=Saturday).
     * MySQL DAYOFWEEK returns 1=Sun, 2=Mon, ..., 7=Sat.
     * SQLite strftime('%w', ...) returns '0'=Sun ... '6'=Sat.
     */
    public function scopeForWeekdays(Builder $query, array $weekdays): Builder
    {
        if (!empty($weekdays)) {
            $driver = $query->getConnection()->getDriverName();
            $cleanDays = array_values(array_map('intval', $weekdays));

            if ($driver === 'sqlite') {
                $query->whereRaw("CAST(strftime('%w', published_at) AS INTEGER) IN (" . implode(',', $cleanDays) . ")");
            } else {
                // MySQL / MariaDB
                $mysqlDays = array_map(fn($d) => (int)$d + 1, $cleanDays);
                $query->whereRaw('DAYOFWEEK(published_at) IN (' . implode(',', $mysqlDays) . ')');
            }
        }
        return $query;
    }

    public function scopeKeyword(Builder $query, ?string $keyword): Builder
    {
        if ($keyword) {
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', '%' . $keyword . '%')
                    ->orWhere('description', 'like', '%' . $keyword . '%')
                    ->orWhere('source_name', 'like', '%' . $keyword . '%');
            });
        }
        return $query;
    }

    public function scopeBreakingNews(Builder $query): Builder
    {
        return $query->where('is_breaking', true);
    }
}
