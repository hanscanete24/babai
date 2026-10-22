<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_articles', function (Blueprint $table) {
            $table->id();
            $table->string('provider_id')->nullable(); // external ID from API
            $table->string('canonical_url', 2048)->nullable();
            $table->string('title', 1000);
            $table->text('description')->nullable();
            $table->string('author')->nullable();
            $table->string('source_name')->nullable();
            $table->foreignId('news_source_id')->nullable()->constrained()->nullOnDelete();
            $table->string('image_url', 2048)->nullable();
            $table->string('country', 10)->nullable();
            $table->string('language', 10)->nullable();
            $table->string('category')->nullable();
            $table->boolean('is_breaking')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Prevent duplicates by canonical URL
            $table->unique(['canonical_url'], 'news_articles_url_unique');

            // Performance indexes
            $table->index(['country', 'category', 'published_at'], 'idx_country_cat_pub');
            $table->index(['published_at'], 'idx_published_at');
            $table->index(['category', 'published_at'], 'idx_cat_pub');
            $table->index(['source_name', 'published_at'], 'idx_source_pub');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_articles');
    }
};
