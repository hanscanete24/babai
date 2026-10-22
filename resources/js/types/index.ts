export interface Country {
    code: string;
    name: string;
    flag: string;
}

export interface NewsArticleItem {
    id?: number;
    title: string;
    description?: string | null;
    author?: string | null;
    source_name?: string | null;
    image_url?: string | null;
    canonical_url?: string | null;
    country?: string | null;
    category?: string | null;
    published_at?: string | null;
    is_breaking?: boolean;
    is_seeded?: boolean;
    bookmarked_at?: string | null;
}

export interface SearchFilters {
    q: string;
    country: string;
    category: string;
    datePreset: string;
    specificDate?: string | null;
    from?: string | null;
    to?: string | null;
    weekdays: number[];
    sortBy: string;
    timezone: string;
}

export interface ProviderLimitations {
    free_tier?: string;
    historical_limit?: string;
    country_support?: string;
    weekday_filtering?: string;
    page_size_max?: number;
    total_results_max?: string;
    notice?: string;
}

export interface UserPreferences {
    id?: number;
    user_id?: number;
    preferred_countries: string[];
    preferred_categories: string[];
    timezone: string;
    theme: string;
    default_country?: string;
    default_category?: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    preferences?: UserPreferences | null;
}

export interface PageProps {
    auth?: {
        user?: AuthUser | null;
    };
    flash?: {
        message?: string | null;
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}
