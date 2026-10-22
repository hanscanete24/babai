<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_sources', function (Blueprint $table) {
            $table->id();
            $table->string('provider_id')->unique(); // e.g. "bbc-news"
            $table->string('name');
            $table->string('domain')->nullable();
            $table->string('country', 10)->nullable();
            $table->string('language', 10)->nullable();
            $table->string('category')->nullable();
            $table->string('url')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['country', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news_sources');
    }
};
