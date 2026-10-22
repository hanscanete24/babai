import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Country, UserPreferences, ProviderLimitations } from '@/types';
import {
    Settings as SettingsIcon,
    Globe,
    Layers,
    Clock,
    Palette,
    Key,
    ShieldCheck,
    Check,
    Info,
    ExternalLink
} from 'lucide-react';

interface SettingsPageProps {
    preferences: UserPreferences;
    countries: Country[];
    categories: string[];
    apiKeyConfigured: boolean;
    providerLimitations: ProviderLimitations;
}

export default function SettingsPage({
    preferences,
    countries = [],
    categories = [],
    apiKeyConfigured = false,
    providerLimitations = {},
}: SettingsPageProps) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        preferred_countries: preferences.preferred_countries || ['ph', 'us', 'gb', 'jp'],
        preferred_categories: preferences.preferred_categories || ['technology', 'business'],
        timezone: preferences.timezone || 'Asia/Manila',
        theme: preferences.theme || 'dark',
        default_country: preferences.default_country || 'ph',
        default_category: preferences.default_category || 'technology',
    });

    const commonTimezones = [
        'UTC',
        'Asia/Manila',
        'Asia/Tokyo',
        'Asia/Singapore',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Australia/Sydney',
    ];

    const toggleCountry = (code: string) => {
        const current = data.preferred_countries;
        if (current.includes(code)) {
            setData('preferred_countries', current.filter((c) => c !== code));
        } else {
            setData('preferred_countries', [...current, code]);
        }
    };

    const toggleCategory = (cat: string) => {
        const current = data.preferred_categories;
        if (current.includes(cat)) {
            setData('preferred_categories', current.filter((c) => c !== cat));
        } else {
            setData('preferred_categories', [...current, cat]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings');
    };

    return (
        <AppLayout title="Settings & Feed Customization">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono flex items-center gap-1.5">
                            <SettingsIcon className="w-3 h-3 text-indigo-400" />
                            Configuration
                        </span>
                        <span className="text-xs text-slate-400 font-mono">• User Profile</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Preferences & Provider Integration
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Customize your default newsfeed, sovereign territories, timezone handling, and API credentials.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    {/* Timezone & Localization */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Clock className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                Timezone & Temporal Anchoring
                            </h3>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Primary Monitoring Timezone
                            </label>
                            <select
                                value={data.timezone}
                                onChange={(e) => setData('timezone', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                                {commonTimezones.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1.5">
                                All weekday and date range calculations align with this timezone to guarantee consistent boundary definitions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Default Country Feed
                                </label>
                                <select
                                    value={data.default_country}
                                    onChange={(e) => setData('default_country', e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="all">Worldwide</option>
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.flag} {c.name} ({c.code.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Default Category Domain
                                </label>
                                <select
                                    value={data.default_category}
                                    onChange={(e) => setData('default_category', e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 capitalize focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="all">All Domains</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Preferred Sovereign Territories */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                Preferred Sovereign Feeds ({data.preferred_countries.length} selected)
                            </h3>
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                            {countries.map((c) => {
                                const selected = data.preferred_countries.includes(c.code.toLowerCase());
                                return (
                                    <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => toggleCountry(c.code.toLowerCase())}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                                            selected
                                                ? 'bg-indigo-600/30 text-white border-indigo-500 font-semibold'
                                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span>{c.flag}</span>
                                        <span>{c.name}</span>
                                        {selected && <Check className="w-3 h-3 text-indigo-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preferred Categories */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Layers className="w-4 h-4 text-purple-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                Priority Subject Domains
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {categories.map((cat) => {
                                const selected = data.preferred_categories.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => toggleCategory(cat)}
                                        className={`p-3 rounded-xl text-xs font-semibold capitalize transition-all border text-center flex items-center justify-between ${
                                            selected
                                                ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-sm'
                                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                        }`}
                                    >
                                        <span>{cat}</span>
                                        {selected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between pt-2">
                        {recentlySuccessful && (
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                                <Check className="w-4 h-4" />
                                <span>Preferences successfully saved!</span>
                            </span>
                        )}
                        <button
                            type="submit"
                            disabled={processing}
                            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                        >
                            <span>{processing ? 'Saving...' : 'Save Preferences'}</span>
                        </button>
                    </div>
                </form>

                {/* Right Column: API Status & Key Instructions */}
                <div className="space-y-6">
                    {/* API Status Box */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                            <Key className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                News API Integration
                            </h3>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                            <div className={`w-3 h-3 rounded-full ${apiKeyConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                            <div>
                                <div className="text-xs font-semibold text-slate-200">
                                    {apiKeyConfigured ? 'NewsAPI Key Configured' : 'Local Synthetic Engine Active'}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                    {apiKeyConfigured ? 'Direct API Ingestion Ready' : 'Database Dispatches Mode'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs text-slate-300">
                            <p className="leading-relaxed">
                                To enable live international wire queries from NewsAPI.org:
                            </p>
                            <ol className="list-decimal pl-4 space-y-2 text-slate-400 leading-normal text-[11px]">
                                <li>
                                    Register a free account at{' '}
                                    <a
                                        href="https://newsapi.org/register"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                                    >
                                        newsapi.org <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                </li>
                                <li>Copy your free 32-character API key.</li>
                                <li>
                                    Paste the key into your <code className="text-cyan-400 font-mono bg-slate-950 px-1 py-0.5 rounded">.env</code> file:
                                    <pre className="mt-1.5 p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-cyan-300 overflow-x-auto">
                                        NEWS_API_KEY=your_key_here
                                    </pre>
                                </li>
                                <li>Restart your local server or run <code className="text-cyan-400 font-mono bg-slate-950 px-1 py-0.5 rounded">php artisan config:clear</code>.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Provider Limitations Guide */}
                    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-300">
                            <Info className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Free Tier Capabilities
                            </h4>
                        </div>
                        <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span><strong>Daily Quota:</strong> 100 free requests per day. Responses are cached for 5 minutes.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span><strong>Historical Window:</strong> Up to 30 days of archives on developer tier.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span><strong>Weekday Logic:</strong> Normalized server-side by publication timestamp.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-indigo-400 font-bold">•</span>
                                <span><strong>Secret Isolation:</strong> Key stored strictly in Laravel <code className="text-slate-300 font-mono">.env</code>; never exposed to browser client.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
