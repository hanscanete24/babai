<?php

namespace Database\Seeders;

use App\Models\Bookmark;
use App\Models\NewsArticle;
use App\Models\NewsSource;
use App\Models\User;
use App\Models\UserPreference;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Lead Analyst User
        $user = User::firstOrCreate(
            ['email' => 'analyst@pulsenews.io'],
            [
                'name' => 'Lead News Analyst',
                'password' => bcrypt('password123'),
            ]
        );

        UserPreference::updateOrCreate(
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

        // 2. Create Recognized News Sources
        $sources = [
            ['provider_id' => 'reuters',       'name' => 'Reuters',            'domain' => 'reuters.com',          'country' => 'us', 'language' => 'en', 'category' => 'general'],
            ['provider_id' => 'bbc-news',      'name' => 'BBC News',           'domain' => 'bbc.co.uk',           'country' => 'gb', 'language' => 'en', 'category' => 'general'],
            ['provider_id' => 'the-verge',     'name' => 'The Verge',          'domain' => 'theverge.com',         'country' => 'us', 'language' => 'en', 'category' => 'technology'],
            ['provider_id' => 'bloomberg',     'name' => 'Bloomberg',          'domain' => 'bloomberg.com',        'country' => 'us', 'language' => 'en', 'category' => 'business'],
            ['provider_id' => 'rappler',       'name' => 'Rappler',            'domain' => 'rappler.com',          'country' => 'ph', 'language' => 'en', 'category' => 'general'],
            ['provider_id' => 'inquirer',      'name' => 'Philippine Daily Inquirer', 'domain' => 'inquirer.net', 'country' => 'ph', 'language' => 'en', 'category' => 'general'],
            ['provider_id' => 'philstar',      'name' => 'The Philippine Star','domain' => 'philstar.com',        'country' => 'ph', 'language' => 'en', 'category' => 'technology'],
            ['provider_id' => 'techcrunch',    'name' => 'TechCrunch',         'domain' => 'techcrunch.com',       'country' => 'us', 'language' => 'en', 'category' => 'technology'],
            ['provider_id' => 'nikkei-asia',   'name' => 'Nikkei Asia',        'domain' => 'asia.nikkei.com',      'country' => 'jp', 'language' => 'en', 'category' => 'business'],
            ['provider_id' => 'al-jazeera',    'name' => 'Al Jazeera English', 'domain' => 'aljazeera.com',       'country' => 'ae', 'language' => 'en', 'category' => 'general'],
            ['provider_id' => 'associated-press', 'name' => 'Associated Press', 'domain' => 'apnews.com',         'country' => 'us', 'language' => 'en', 'category' => 'general'],
        ];

        $sourceMap = [];
        foreach ($sources as $s) {
            $created = NewsSource::updateOrCreate(['provider_id' => $s['provider_id']], $s);
            $sourceMap[$s['provider_id']] = $created->id;
        }

        // 3. Current Reference Time (October 2026 as per workspace metadata)
        $now = Carbon::parse('2026-10-21 00:00:00', 'Asia/Manila');

        // Articles specifically targeting:
        // - Philippines, Technology, October 2026 on Mondays and Fridays
        // - Also recent days (Today, Yesterday, Last 7, Last 30)
        // - Varied categories and countries
        $articles = [
            // --- Philippines / Technology / October 2026 Mondays & Fridays ---
            [
                'title' => 'Philippines Launches Southeast Asia Cloud Computing AI Hub in BGC Taguig',
                'description' => 'The Department of Information and Communications Technology (DICT) has inaugurated a state-of-the-art supercomputing facility in Bonifacio Global City to accelerate national AI research and fintech innovations.',
                'author' => 'Maria Santos',
                'source_name' => 'The Philippine Star',
                'news_source_id' => $sourceMap['philstar'] ?? null,
                'canonical_url' => 'https://www.philstar.com/business/technology/2026/10/02/ph-ai-hub-bgc',
                'image_url' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
                'country' => 'ph',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => true,
                // Friday, Oct 2, 2026
                'published_at' => Carbon::parse('2026-10-02 09:30:00', 'Asia/Manila'),
            ],
            [
                'title' => 'Manila Fintech Ecosystem Sees Record 42% Surge in Digital Micro-Lending Volume',
                'description' => 'Philippine digital banking platforms reported a massive adoption surge driven by nationwide QR Ph interoperability and streamlined national biometric ID onboarding.',
                'author' => 'Juan Dela Cruz',
                'source_name' => 'Rappler',
                'news_source_id' => $sourceMap['rappler'] ?? null,
                'canonical_url' => 'https://www.rappler.com/technology/ph-fintech-digital-lending-surge-oct-2026',
                'image_url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
                'country' => 'ph',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => false,
                // Monday, Oct 5, 2026
                'published_at' => Carbon::parse('2026-10-05 14:15:00', 'Asia/Manila'),
            ],
            [
                'title' => 'Philippine Semiconductor Coalition Unveils Next-Gen Automotive Chip Packaging Plant in Laguna',
                'description' => 'A landmark $350M public-private partnership established a cleanroom testing center to supply high-reliability semiconductor packaging for global electric vehicles.',
                'author' => 'Ronaldo Mendoza',
                'source_name' => 'Philippine Daily Inquirer',
                'news_source_id' => $sourceMap['inquirer'] ?? null,
                'canonical_url' => 'https://business.inquirer.net/technology/laguna-semiconductor-plant-expansion-2026',
                'image_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
                'country' => 'ph',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => false,
                // Friday, Oct 9, 2026
                'published_at' => Carbon::parse('2026-10-09 11:00:00', 'Asia/Manila'),
            ],
            [
                'title' => 'DICT Rolls Out High-Altitude Low-Latency Satellite Terminals Across Remote Visayas Islands',
                'description' => 'Over 400 isolated island communities in Samar and Leyte now access gigabit-capable satellite telemetry to monitor disaster resilience and support distance healthcare.',
                'author' => 'Theresa Ramos',
                'source_name' => 'The Philippine Star',
                'news_source_id' => $sourceMap['philstar'] ?? null,
                'canonical_url' => 'https://www.philstar.com/technology/2026/10/12/dict-island-satellite-connectivity',
                'image_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
                'country' => 'ph',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => false,
                // Monday, Oct 12, 2026
                'published_at' => Carbon::parse('2026-10-12 16:45:00', 'Asia/Manila'),
            ],
            [
                'title' => 'Cebu Cyberpark Welcomes Multinational Cybersecurity Operations Center for ASEAN',
                'description' => 'A major global cybersecurity consortium opened its 24/7 Threat Intelligence Headquarters in IT Park Cebu, creating 1,200 specialized digital forensics positions.',
                'author' => 'Carmelo Tan',
                'source_name' => 'Rappler',
                'news_source_id' => $sourceMap['rappler'] ?? null,
                'canonical_url' => 'https://www.rappler.com/business/technology/cebu-cybersecurity-center-asean-oct-2026',
                'image_url' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
                'country' => 'ph',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => false,
                // Friday, Oct 16, 2026
                'published_at' => Carbon::parse('2026-10-16 10:20:00', 'Asia/Manila'),
            ],
            [
                'title' => 'Bangko Sentral ng Pilipinas Completes Multi-Currency CBDC Wholesale Interoperability Trials',
                'description' => 'Project Agila successfully demonstrated settlement of cross-border institutional payments in under 4 seconds between Manila, Singapore, and Tokyo using distributed ledger technology.',
                'author' => 'Patricia Velasco',
                'source_name' => 'Philippine Daily Inquirer',
                'news_source_id' => $sourceMap['inquirer'] ?? null,
                'canonical_url' => 'https://business.inquirer.net/technology/bsp-cbdc-interoperability-wholesale-oct-2026',
                'image_url' => 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
                'country' => 'ph',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => true,
                // Monday, Oct 19, 2026
                'published_at' => Carbon::parse('2026-10-19 13:00:00', 'Asia/Manila'),
            ],

            // --- Today & Yesterday News (October 20-21, 2026) ---
            [
                'title' => 'Quantum Computing Breakthrough: Error Mitigation Algorithm Slashes Coherence Noise by 90%',
                'description' => 'Researchers at MIT and Oxford announced a universal fault-tolerant compilation layer capable of running 10,000 deep quantum circuits on current neutral-atom hardware.',
                'author' => 'Dr. Julian Thorne',
                'source_name' => 'The Verge',
                'news_source_id' => $sourceMap['the-verge'] ?? null,
                'canonical_url' => 'https://www.theverge.com/2026/10/20/quantum-error-mitigation-fault-tolerant-breakthrough',
                'image_url' => 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
                'country' => 'us',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => true,
                'published_at' => Carbon::parse('2026-10-20 22:15:00', 'Asia/Manila'),
            ],
            [
                'title' => 'Global Central Banks Announce Coordinated Liquidity Framework Amid Trade Modernization',
                'description' => 'The Federal Reserve, European Central Bank, and Bank of Japan released joint regulatory standards for cross-border asset tokenization and real-time repo clearing.',
                'author' => 'Sarah Sterling',
                'source_name' => 'Bloomberg',
                'news_source_id' => $sourceMap['bloomberg'] ?? null,
                'canonical_url' => 'https://www.bloomberg.com/news/articles/2026-10-20/central-banks-joint-tokenization-framework',
                'image_url' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
                'country' => 'us',
                'language' => 'en',
                'category' => 'business',
                'is_breaking' => true,
                'published_at' => Carbon::parse('2026-10-20 18:40:00', 'Asia/Manila'),
            ],
            [
                'title' => 'World Health Organization Approves Universal Multi-Strain mRNA Respiratory Vaccine',
                'description' => 'A single annual vaccine shot targeting influenza A/B, RSV, and emerging coronavirus variants demonstrated 94% efficacy in multi-continental Phase 3 clinical trials.',
                'author' => 'Helena Berg',
                'source_name' => 'Reuters',
                'news_source_id' => $sourceMap['reuters'] ?? null,
                'canonical_url' => 'https://www.reuters.com/health/who-approves-universal-respiratory-mrna-oct-2026',
                'image_url' => 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
                'country' => 'gb',
                'language' => 'en',
                'category' => 'health',
                'is_breaking' => true,
                'published_at' => Carbon::parse('2026-10-20 15:20:00', 'Asia/Manila'),
            ],
            [
                'title' => 'James Webb Telescope Discovers Atmospheric Water Vapor on Terrestrial Exoplanet in Habitable Zone',
                'description' => 'Spectral data from transit observations of LP 890-9c confirms an active hydrologic cycle and dense secondary atmosphere on a super-Earth located 100 light-years away.',
                'author' => 'Arthur C. Vance',
                'source_name' => 'BBC News',
                'news_source_id' => $sourceMap['bbc-news'] ?? null,
                'canonical_url' => 'https://www.bbc.com/news/science-environment-exoplanet-water-vapor-jwst-2026',
                'image_url' => 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
                'country' => 'gb',
                'language' => 'en',
                'category' => 'science',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-19 08:10:00', 'Asia/Manila'),
            ],
            [
                'title' => 'Tokyo Stock Exchange Adopts 24/7 Continuous Trading for Global Equity Depository Receipts',
                'description' => 'Japan Exchange Group expanded market infrastructure to allow non-stop institutional algorithmic trading aligned with European and American market opening bell overlaps.',
                'author' => 'Kenji Takahashi',
                'source_name' => 'Nikkei Asia',
                'news_source_id' => $sourceMap['nikkei-asia'] ?? null,
                'canonical_url' => 'https://asia.nikkei.com/markets/tokyo-bourse-247-continuous-trading-debut',
                'image_url' => 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
                'country' => 'jp',
                'language' => 'en',
                'category' => 'business',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-18 10:00:00', 'Asia/Manila'),
            ],
            [
                'title' => 'European Union Mandates Autonomous Freight Logistics Corridors Along Trans-European Network',
                'description' => 'Self-driving zero-emission trucks will operate along designated electrified lanes spanning Rotterdam, Frankfurt, and Milan under standardized continental vehicle-to-everything (V2X) protocols.',
                'author' => 'Lukas Weber',
                'source_name' => 'Reuters',
                'news_source_id' => $sourceMap['reuters'] ?? null,
                'canonical_url' => 'https://www.reuters.com/business/autos-transportation/eu-autonomous-freight-corridors-oct-2026',
                'image_url' => 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80',
                'country' => 'de',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-17 12:30:00', 'Europe/Berlin'),
            ],
            [
                'title' => 'Silicon Valley Startup Unveils Solid-State Battery with 1,200 km Range and 8-Minute Charge',
                'description' => 'Commercial testing with major automotive groups validated 1,500 continuous deep-discharge cycles with less than 2% degradation using silicon-lithium composite anodes.',
                'author' => 'David Lin',
                'source_name' => 'TechCrunch',
                'news_source_id' => $sourceMap['techcrunch'] ?? null,
                'canonical_url' => 'https://techcrunch.com/2026/10/16/solid-state-battery-breakthrough-commercial-trials',
                'image_url' => 'https://images.unsplash.com/photo-1558441719-8b489c634a10?w=800&auto=format&fit=crop&q=80',
                'country' => 'us',
                'language' => 'en',
                'category' => 'technology',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-16 17:00:00', 'America/Los_Angeles'),
            ],
            [
                'title' => 'International Renewable Energy Agency Reports Solar and Wind Now Supply 38% of Global Electricity',
                'description' => 'Massive deployment of utility-scale grid batteries and ultra-high-voltage direct current interconnectors enabled green generation to surpass coal globally for the second consecutive quarter.',
                'author' => 'Amira Al-Mansoor',
                'source_name' => 'Al Jazeera English',
                'news_source_id' => $sourceMap['al-jazeera'] ?? null,
                'canonical_url' => 'https://www.aljazeera.com/economy/2026/10/15/renewable-power-surpasses-coal-global-milestone',
                'image_url' => 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
                'country' => 'ae',
                'language' => 'en',
                'category' => 'science',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-15 11:20:00', 'Asia/Dubai'),
            ],
            [
                'title' => 'Global Cyber Resilience Treaty Ratified by 78 Nations at Geneva Summit',
                'description' => 'The pact criminalizes ransomware safe harbors, mandates rapid mutual incident disclosure for critical civilian utilities, and establishes international arbitration protocols.',
                'author' => 'Claire Fontaine',
                'source_name' => 'Associated Press',
                'news_source_id' => $sourceMap['associated-press'] ?? null,
                'canonical_url' => 'https://apnews.com/article/geneva-cyber-resilience-treaty-ratification-2026',
                'image_url' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
                'country' => 'us',
                'language' => 'en',
                'category' => 'general',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-14 09:00:00', 'UTC'),
            ],
            [
                'title' => 'Sydney Host Stadiums Finalize Carbon-Negative Infrastructure for 2027 World Athletics Games',
                'description' => 'Recycled timber canopies, kinetic energy turnstiles, and 100% on-site rainwater recycling earn Olympic precinct the highest green engineering certification in Australasia.',
                'author' => 'Mitchell Byrne',
                'source_name' => 'BBC News',
                'news_source_id' => $sourceMap['bbc-news'] ?? null,
                'canonical_url' => 'https://www.bbc.com/sport/sydney-athletics-carbon-negative-stadiums-2026',
                'image_url' => 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
                'country' => 'au',
                'language' => 'en',
                'category' => 'sports',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-13 16:30:00', 'Australia/Sydney'),
            ],
            [
                'title' => 'French Film Festival Celebrates Renaissance of AI-Assisted Non-Linear Cinematic Storytelling',
                'description' => 'Directors from Cannes to Berlin debut interactive narrative productions allowing audiences to experience multiple perspectives rendered in real-time photorealistic detail.',
                'author' => 'Antoine Dubois',
                'source_name' => 'Reuters',
                'news_source_id' => $sourceMap['reuters'] ?? null,
                'canonical_url' => 'https://www.reuters.com/lifestyle/entertainment/cannes-interactive-cinema-ai-narrative-2026',
                'image_url' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
                'country' => 'fr',
                'language' => 'en',
                'category' => 'entertainment',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-11 20:00:00', 'Europe/Paris'),
            ],
            [
                'title' => 'Singapore FinTech Festival Welcomes Over 80,000 Delegates Exploring Sovereign AI Agents',
                'description' => 'Monetary Authority of Singapore outlines responsible governance guardrails for autonomous multi-agent financial advisors executing high-frequency corporate treasury balancing.',
                'author' => 'Zheng Wei',
                'source_name' => 'Nikkei Asia',
                'news_source_id' => $sourceMap['nikkei-asia'] ?? null,
                'canonical_url' => 'https://asia.nikkei.com/business/singapore-fintech-festival-sovereign-ai-agents-2026',
                'image_url' => 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
                'country' => 'sg',
                'language' => 'en',
                'category' => 'business',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-08 14:00:00', 'Asia/Singapore'),
            ],
            [
                'title' => 'Indian Space Research Organisation Successfully Lands Sample Return Probe on Lunar South Pole',
                'description' => 'Chandrayaan-5 drill retrieved 2.4 kilograms of subsurface volatile-rich regolith, confirming significant water ice deposits for future long-duration human habitats.',
                'author' => 'Aarav Sharma',
                'source_name' => 'BBC News',
                'news_source_id' => $sourceMap['bbc-news'] ?? null,
                'canonical_url' => 'https://www.bbc.com/news/world-asia-india-chandrayaan5-lunar-sample-2026',
                'image_url' => 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
                'country' => 'in',
                'language' => 'en',
                'category' => 'science',
                'is_breaking' => true,
                'published_at' => Carbon::parse('2026-10-06 18:45:00', 'Asia/Kolkata'),
            ],
            [
                'title' => 'Global Genomics Project Completes Genetic Diversity Map of Over 100,000 Indigenous Genomes',
                'description' => 'Published in Nature, the landmark catalog uncovers 1.2 million previously uncharacterized protective mutations offering therapeutic targets for metabolic illnesses.',
                'author' => 'Dr. Eleanor Brooks',
                'source_name' => 'Reuters',
                'news_source_id' => $sourceMap['reuters'] ?? null,
                'canonical_url' => 'https://www.reuters.com/science/nature-indigenous-genomics-diversity-map-2026',
                'image_url' => 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
                'country' => 'us',
                'language' => 'en',
                'category' => 'health',
                'is_breaking' => false,
                'published_at' => Carbon::parse('2026-10-03 15:10:00', 'UTC'),
            ],
        ];

        $createdArticles = [];
        foreach ($articles as $articleData) {
            $articleData['is_seeded'] = true;
            $created = NewsArticle::updateOrCreate(
                ['canonical_url' => $articleData['canonical_url']],
                $articleData
            );
            $createdArticles[] = $created;
        }

        // 4. Create Initial Bookmarks for the Demo User
        if (!empty($createdArticles)) {
            Bookmark::firstOrCreate([
                'user_id' => $user->id,
                'news_article_id' => $createdArticles[0]->id,
            ]);
            Bookmark::firstOrCreate([
                'user_id' => $user->id,
                'news_article_id' => $createdArticles[1]->id,
            ]);
            if (isset($createdArticles[6])) {
                Bookmark::firstOrCreate([
                    'user_id' => $user->id,
                    'news_article_id' => $createdArticles[6]->id,
                ]);
            }
        }
    }
}
