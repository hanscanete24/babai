import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Search, X } from 'lucide-react';
import { Country } from '@/types';

interface CountrySelectorProps {
    countries: Country[];
    selectedCountry: string;
    onChange: (code: string) => void;
    label?: string;
    allowAll?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
    countries,
    selectedCountry,
    onChange,
    label = 'Country',
    allowAll = true,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = countries.find((c) => c.code.toLowerCase() === selectedCountry.toLowerCase());

    const filtered = countries.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
                <div className="flex items-center gap-2.5 truncate">
                    {selectedCountry === 'all' || !selected ? (
                        <>
                            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="font-medium">Worldwide (All Countries)</span>
                        </>
                    ) : (
                        <>
                            <span className="text-base leading-none">{selected.flag}</span>
                            <span className="font-medium truncate">{selected.name}</span>
                            <span className="text-xs text-slate-400 font-mono uppercase">
                                ({selected.code})
                            </span>
                        </>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[260px]">
                    {/* Search box inside dropdown */}
                    <div className="p-2 border-b border-slate-800">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country or code..."
                                autoFocus
                                className="w-full pl-8 pr-7 py-1.5 bg-slate-950 text-xs text-slate-200 placeholder-slate-400 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options list */}
                    <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                        {allowAll && !search && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('all');
                                    setOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                    selectedCountry === 'all'
                                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                                        : 'text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-cyan-400" />
                                    <span>Worldwide (All Countries)</span>
                                </div>
                                {selectedCountry === 'all' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                            </button>
                        )}

                        {filtered.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-slate-400">
                                No matching country found.
                            </div>
                        ) : (
                            filtered.map((country) => {
                                const isCurrent = selectedCountry.toLowerCase() === country.code.toLowerCase();
                                return (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                            onChange(country.code);
                                            setOpen(false);
                                        }}
                                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                            isCurrent
                                                ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                                                : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="text-sm">{country.flag}</span>
                                            <span className="truncate">{country.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                                                {country.code}
                                            </span>
                                        </div>
                                        {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
