# PulseNews — World News Monitoring and Date-Range Filtering System

A modern, responsive, enterprise-grade World News Monitoring and Intelligence Platform built with **Laravel 12 (PHP 8.2+)**, **Inertia.js v2**, **React 18**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

---

## 🌟 Key Features

### 1. Global News Dashboard (`/`)
- Real-time international news monitoring across 54 sovereign territories.
- Live breaking news marquee ticker with pulsing indicators.
- One-click sovereign territory switcher with national flags and ISO-3166-1 alpha-2 codes.
- Category pills: **Technology**, **Business**, **Health**, **Science**, **Sports**, **Entertainment**, and **General**.
- Responsive news cards with thumbnail error handling, publisher attribution, and relative timestamps.
- Summary reader modal with copyright compliance notices and links to original publisher articles.

### 2. Advanced Date and Day Filtering (`/search`)
Supports all 10 filtering permutations required by the system specification:
1. **Today** — news published today in the user's selected timezone.
2. **Yesterday** — news published yesterday.
3. **Last 7 Days** — rolling 7-day window.
4. **Last 30 Days** — rolling 30-day window (matches free-tier NewsAPI boundary).
5. **Specific Date** — single calendar day lookup.
6. **Custom Date Range** — start date and end date with validation (prevents start > end).
7. **Specific Days of the Week** — single weekday (Monday through Sunday).
8. **Multiple Days** — multiple weekdays (e.g. Monday + Wednesday + Friday).
9. **Date Range + Weekdays** — e.g. **Philippines, Technology, October 1–31, 2026 on Mondays and Fridays**.
10. **Date Range + Country + Category** — complete multi-dimensional filtering.
- **Server-Side Normalization:** If the data provider does not support native weekday parameters, the system retrieves eligible articles within the date window and applies server-side weekday filtering based on normalized ISO-8601 publication timestamps.
- **Sorting:** Newest first and Oldest first.

### 3. Sovereign Country Directory & Side-by-Side Comparison (`/countries`)
- Searchable directory of 54 countries with flags and cataloged article counts.
- **Side-by-Side Country Comparison:** Inspect headlines from two nations simultaneously to analyze media focus.
- **Worldwide Mode:** Unrestricted international view.

### 4. Subject Domain Taxonomy (`/categories`)
- Topic classification across Technology, Business, Healthcare, Science, Sports, and Entertainment.
- Per-category statistics badges and territory filtering.

### 5. News Velocity & Volume Analytics (`/analytics`)
Interactive visual reports powered by **Recharts**:
- **Publication Volume per Day:** Area chart with smooth gradient fills.
- **News Volume by Category:** Donut chart showing domain distribution.
- **News Volume by Country:** Bar chart representing sovereign output.
- **Top Appearing Publishers:** Horizontal bar chart highlighting wire frequency.
- **Statistical Boundary Notice:** Explicit disclaimer that metrics represent the analyzed monitoring repository rather than all global media.

### 6. Saved Articles & Bookmarks (`/bookmarks`)
- Persistent personal archive with database foreign key relationships.
- Instant bookmark toggle with optimistic UI updates.
- Organize and filter bookmarks by country or subject category.

### 7. User Preferences & Timezone Anchoring (`/settings`)
- Timezone configuration ensuring exact day-boundary and weekday calculations.
- Preferred countries and categories saved to user profile.
- API key setup guide and live status indicator.

---

## 🛠 Technology Stack

- **Backend:** Laravel 12, PHP 8.2+, Eloquent ORM, Form Requests, Service Abstraction Layer.
- **Frontend:** React 18, TypeScript, Inertia.js v2, Tailwind CSS, Lucide React icons.
- **Visual Analytics:** Recharts.
- **Database:** MySQL / SQLite.
- **Testing:** PHPUnit, HTTP client fakes, RefreshDatabase.

---

## 🚀 Installation & Setup Instructions (Windows / XAMPP / Herd)

### Prerequisites
1. **PHP 8.2 or later** (Included with XAMPP 8.2+ or Laravel Herd).
2. **Composer 2.x**.
3. **Node.js 18+ and npm**.

### Step 1: Clone or Navigate to Project
```bash
cd c:\Users\User\Downloads\babai
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Generate your application key:
```bash
php artisan key:generate
```

### Step 3: Configure Database
#### Option A: SQLite (Default Out-of-the-Box)
The project comes pre-configured with SQLite. Run migrations and database seeders:
```bash
php artisan migrate --force
php artisan db:seed --force
```

#### Option B: MySQL (XAMPP / Herd)
1. Start Apache and MySQL in the XAMPP Control Panel.
2. In phpMyAdmin, create a database named `world_news`.
3. In `.env`, configure your database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=world_news
   DB_USERNAME=root
   DB_PASSWORD=
   ```
4. Run migrations and seeders:
   ```bash
   php artisan migrate:fresh --seed
   ```

### Step 4: Configure NewsAPI Key (Free Tier)
1. Register for a free API key at [NewsAPI.org](https://newsapi.org/register).
2. In your `.env` file, set:
   ```env
   NEWS_API_KEY=your_32_character_api_key_here
   NEWS_API_PROVIDER=newsapi
   ```
3. *Note:* Even without an API key, the platform operates seamlessly using verified local repository dispatches and seed data!

### Step 5: Build Frontend Assets
Compile production assets with Vite:
```bash
npm run build
```

Or run Vite in development watch mode:
```bash
npm run dev
```

### Step 6: Serve the Application
Start the Laravel development server:
```bash
php artisan serve
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🧪 Automated Testing

Run the automated test suite with mocked API responses:
```bash
php artisan test
```

### Verified Test Cases:
- `prompt scenario philippines technology october mondays and fridays`: Verifies the prompt's exact filter combination (Section 5).
- `date range validation start date cannot be after end date`: Validates input constraints.
- `single weekday filter only returns selected day`: Asserts weekday isolation.
- `bookmark toggle adds and removes bookmark`: Verifies user-to-article relationships.
- `mocked news api provider handles rate limits gracefully`: Validates 429 response handling.
- `mocked news api provider handles successful headlines`: Validates data ingestion and normalization.

---

## 📋 Data Provider Abstraction & Limitations

The system uses `NewsProviderInterface` so other news providers (e.g. GNews, MediaStack, CurrentsAPI) can be added without modifying controller logic.

### Provider Capabilities & Restrictions (NewsAPI.org Developer Tier):
1. **Daily Quota:** 100 requests per day on the free tier. Responses are cached for 5 minutes.
2. **Historical Range:** Articles from the previous 30 days are accessible on the developer tier.
3. **Weekday Filtering:** Applied server-side using Carbon datetime parsing against the publication timestamp.
4. **Security:** API keys remain strictly in server environment variables and are never exposed to browser clients.
