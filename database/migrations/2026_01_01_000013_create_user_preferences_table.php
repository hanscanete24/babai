<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('preferred_countries')->nullable(); // ["ph","us","gb"]
            $table->json('preferred_categories')->nullable(); // ["technology","business"]
            $table->string('timezone')->default('UTC');
            $table->string('theme')->default('dark'); // dark|light|system
            $table->string('default_country', 10)->nullable();
            $table->string('default_category')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
