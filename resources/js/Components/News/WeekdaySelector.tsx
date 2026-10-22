import React from 'react';
import { WEEKDAY_NAMES } from '@/lib/utils';
import { CalendarDays, Check } from 'lucide-react';

interface WeekdaySelectorProps {
    selectedDays: number[];
    onChange: (days: number[]) => void;
}

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
    selectedDays,
    onChange,
}) => {
    const toggleDay = (dayId: number) => {
        if (selectedDays.includes(dayId)) {
            onChange(selectedDays.filter((d) => d !== dayId));
        } else {
            onChange([...selectedDays, dayId].sort());
        }
    };

    const handleSelectWeekdays = () => {
        onChange([1, 2, 3, 4, 5]); // Mon-Fri
    };

    const handleSelectWeekends = () => {
        onChange([0, 6]); // Sun, Sat
    };

    const handleSelectAll = () => {
        onChange([0, 1, 2, 3, 4, 5, 6]);
    };

    const handleClear = () => {
        onChange([]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Days of the Week ({selectedDays.length === 0 ? 'Any Day' : `${selectedDays.length} Selected`})</span>
                </label>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <button
                        type="button"
                        onClick={handleSelectWeekdays}
                        className="px-2 py-0.5 rounded hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Mon-Fri
                    </button>
                    <span>•</span>
                    <button
                        type="button"
                        onClick={handleSelectWeekends}
                        className="px-2 py-0.5 rounded hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Sat-Sun
                    </button>
                    <span>•</span>
                    {selectedDays.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-2 py-0.5 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors font-medium"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Weekday Chips */}
            <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_NAMES.map((day) => {
                    const active = selectedDays.includes(day.id);
                    return (
                        <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition-all border ${
                                active
                                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white font-bold border-indigo-400/50 shadow-md shadow-indigo-600/20'
                                    : 'bg-slate-900 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-800'
                            }`}
                        >
                            <span className="text-[11px] font-semibold">{day.short}</span>
                            {active ? (
                                <Check className="w-3 h-3 text-white mt-0.5" />
                            ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
