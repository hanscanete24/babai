<?php

namespace App\Services\News;

interface NewsProviderInterface
{
    /**
     * Fetch top headlines.
     *
     * @param array{
     *   country?: string,
     *   category?: string,
     *   q?: string,
     *   page?: int,
     *   pageSize?: int,
     *   from?: string,
     *   to?: string,
     * } $params
     */
    public function getTopHeadlines(array $params = []): array;

    /**
     * Search all articles with full date range support.
     *
     * @param array{
     *   q?: string,
     *   country?: string,
     *   category?: string,
     *   from?: string,
     *   to?: string,
     *   sortBy?: string,
     *   page?: int,
     *   pageSize?: int,
     * } $params
     */
    public function searchArticles(array $params = []): array;

    /**
     * Get available news sources.
     */
    public function getSources(array $params = []): array;

    /**
     * Returns the provider name.
     */
    public function getProviderName(): string;

    /**
     * Returns human-readable limitations of this provider.
     */
    public function getLimitations(): array;
}
