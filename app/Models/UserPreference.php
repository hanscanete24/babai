<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'preferred_countries',
        'preferred_categories',
        'timezone',
        'theme',
        'default_country',
        'default_category',
    ];

    protected $casts = [
        'preferred_countries' => 'array',
        'preferred_categories' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
