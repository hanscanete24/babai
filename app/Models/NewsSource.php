<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'name',
        'domain',
        'country',
        'language',
        'category',
        'url',
        'description',
    ];

    public function articles(): HasMany
    {
        return $this->hasMany(NewsArticle::class);
    }
}
