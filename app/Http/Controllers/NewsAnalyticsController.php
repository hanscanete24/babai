<?php

namespace App\Http\Controllers;

use App\Services\News\NewsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsAnalyticsController extends Controller
{
    public function __construct(
        private readonly NewsService $newsService
    ) {}

    public function index(Request $request): Response
    {
        $range = $request->input('range', '30d'); // 7d, 30d, 90d, custom
        $from = $request->input('from');
        $to   = $request->input('to');

        if ($range === '7d') {
            $from = Carbon::now()->subDays(7)->toDateString();
            $to   = Carbon::now()->toDateString();
        } elseif ($range === '30d') {
            $from = Carbon::now()->subDays(30)->toDateString();
            $to   = Carbon::now()->toDateString();
        } elseif ($range === '90d') {
            $from = Carbon::now()->subDays(90)->toDateString();
            $to   = Carbon::now()->toDateString();
        }

        $analytics = $this->newsService->getAnalytics([
            'from' => $from,
            'to'   => $to,
        ]);

        return Inertia::render('Analytics', [
            'analytics'   => $analytics,
            'range'       => $range,
            'from'        => $from,
            'to'          => $to,
            'limitations' => [
                'notice' => 'Analytics are computed from verified articles cataloged in the monitoring repository. Results represent a curated international sample rather than the entirety of global media output.',
            ],
        ]);
    }
}
