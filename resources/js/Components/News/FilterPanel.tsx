import React, { useState } from 'react';
import {
    Calendar,
    CalendarRange,
    Filter,
    RotateCcw,
    SlidersHorizontal,
    Globe,
    Layers,
    AlertCircle,
    Check
} from 'lucide-react';
import { Country, SearchFilters } from '@/types';
import { CountrySelector } from './CountrySelector';
import { WeekdaySelector } from './WeekdaySelector';
import { WEEKDAY_NAMES } from '@/lib/utils';

interface FilterPanelProps {
    filters: SearchFilters;
    countries: Country[];
    categories: string[];
    onApply: (updated: Partial<SearchFilters>) => void;
    onReset: () => void;
    className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    countries,
    categories,
    onApply,
    onReset,
    className = '',
}) => {
    // Local form state
    const [country, setCountry] = useState(filters.country || 'all');
    const [category, setCategory] = useState(filters.category || 'all');
    const [datePreset, setDatePreset] = useState(filters.datePreset || 'all');
    const [specificDate, setSpecificDate] = useState(filters.specificDate || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [weekdays, setWeekdays] = useState<number[]>(filters.weekdays || []);
    const [sortBy, setSortBy] = useState(filters.sortBy || 'newest');
    const [dateError, setDateError] = useState<string | null>(null);

    const datePresets = [
        { id: 'all', label: 'All Dates' },
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'last7', label: 'Last 7 Days' },
        { id: 'last30', label: 'Last 30 Days' },
        { id: 'specific', label: 'Specific Date' },
        { id: 'custom', label: 'Custom Range' },
    ];

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate date range if custom is selected
        if (datePreset === 'custom') {
            if (from && to && new Date(from) > new Date(to)) {
                setDateError('Start date cannot be later than end date.');
                return;
            }
        }
        setDateError(null);

        onApply({
            country,
            category,
            datePreset,
            specificDate: datePreset === 'specific' ? specificDate : null,
            from: datePreset === 'custom' ? from : null,
            to: datePreset === 'custom' ? to : null,
            weekdays,
            sortBy,
        });
    };

    const handleReset = () => {
        setCountry('all');
        setCategory('all');
        setDatePreset('all');
        setSpecificDate('');
        setFrom('');
        setTo('');
        setWeekdays([]);
        setSortBy('newest');
        setDateError(null);
        onReset();
    };

    return (
        <form
            onSubmit={handleApply}
            className={`p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-6 ${className}`}
        >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                        Advanced Filtering Matrix
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All</span>
                </button>
            </div>

            {/* Row 1: Country & Category Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CountrySelector
                    countries={countries}
                    selectedCountry={country}
                    onChange={setCountry}
                    label="Target Sovereign Nation"
                    allowAll={true}
                />

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Intelligence Domain / Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-200 capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="all">All Domains (Worldwide)</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Row 2: Date Presets (1 to 6) */}
            <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Temporal Period / Date Filter
                </label>
                <div className="flex flex-wrap gap-2">
                    {datePresets.map((preset) => {
                        const active = datePreset === preset.id;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                    setDatePreset(preset.id);
                                    setDateError(null);
                                }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                                    active
                                        ? 'bg-indigo-600 text-white font-semibold border-indigo-400 shadow-md shadow-indigo-600/20'
                                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                                }`}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Conditional Date Pickers */}
            {datePreset === 'specific' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 animate-in fade-in duration-200">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Select Exact Calendar Date
                    </label>
                    <input
                        type="date"
                        value={specificDate}
                        onChange={(e) => setSpecificDate(e.target.value)}
                        className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            )}

            {datePreset === 'custom' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                Start Date (Inclusive)
                            </label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => {
                                    setFrom(e.target.value);
                                    setDateError(null);
                                }}
                                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                End Date (Inclusive)
                            </label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => {
                                    setTo(e.target.value);
                                    setDateError(null);
                                }}
                                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {dateError && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{dateError}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Row 3: Weekdays Selector (7, 8, 9) */}
            <div className="pt-2">
                <WeekdaySelector
                    selectedDays={weekdays}
                    onChange={setWeekdays}
                />
            </div>

            {/* Row 4: Sort Options */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Sort Order:
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setSortBy('newest')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                sortBy === 'newest'
                                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Newest First
                        </button>
                        <button
                            type="button"
                            onClick={() => setSortBy('oldest')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                sortBy === 'oldest'
                                    ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Oldest First
                        </button>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Apply Filters</span>
                    </button>
                </div>
            </div>
        </form>
    );
};
