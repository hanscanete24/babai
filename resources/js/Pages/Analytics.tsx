import React from 'react';
import { router } from '@inertiajs/react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    BarChart3,
    Calendar,
    Globe2,
    Layers,
    Radio,
    Info,
    TrendingUp,
    FileText
} from 'lucide-react';

interface AnalyticsData {
    per_day: { date: string; count: number }[];
    by_country: { country: string; name: string; flag: string; count: number }[];
    by_category: { category: string; count: number }[];
    top_sources: { source: string; count: number }[];
    total: number;
}

interface AnalyticsPageProps {
    analytics: AnalyticsData;
    range: string;
    from?: string | null;
    to?: string | null;
    limitations: { notice: string };
}

const CATEGORY_CHART_COLORS = [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#f97316', // Orange
];

export default function AnalyticsPage({
    analytics,
    range = '30d',
    from,
    to,
    limitations,
}: AnalyticsPageProps) {
    const handleRangeChange = (newRange: string) => {
        router.get('/analytics', { range: newRange }, { preserveState: true });
    };

    const rangeButtons = [
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
        { id: '90d', label: 'Last 90 Days' },
    ];

    return (
        <AppLayout title="News Analytics & Intelligence Reports">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                            Visual Reports
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            • {analytics.total} Dispatches Analyzed
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        News Velocity & Volume Analytics
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Statistical distribution of global dispatches across publication dates, territories, and domains.
                    </p>
                </div>

                {/* Range Selector */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
                    {rangeButtons.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => handleRangeChange(r.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                range === r.id
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transparent Sampling Notice Banner */}
            <div className="mb-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    <span className="font-semibold text-white">Statistical Boundary Notice: </span>
                    {limitations.notice}
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium uppercase font-mono">Cataloged Articles</span>
                        <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.total}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Stored intelligence records</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium uppercase font-mono">Active Territories</span>
                        <Globe2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.by_country.length}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Countries with news coverage</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium uppercase font-mono">Primary Domains</span>
                        <Layers className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.by_category.length}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Distinct categories monitored</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-medium uppercase font-mono">Lead Sources</span>
                        <Radio className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{analytics.top_sources.length}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Accredited international wire services</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 1. Daily Publication Volume (Area Chart) */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                Publication Volume per Day
                            </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Articles / Date</span>
                    </div>

                    <div className="h-72 w-full">
                        {analytics.per_day.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No temporal data in range.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.per_day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={10}
                                        tickFormatter={(val) => val.slice(5)}
                                    />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#334155',
                                            borderRadius: '0.75rem',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#818cf8"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#areaColor)"
                                        name="Articles"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 2. News Volume by Category (Donut / Pie Chart) */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                News Volume by Category
                            </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Domain Distribution</span>
                    </div>

                    <div className="h-72 w-full">
                        {analytics.by_category.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No category data available.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.by_category}
                                        dataKey="count"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                    >
                                        {analytics.by_category.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#334155',
                                            borderRadius: '0.75rem',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(val) => (
                                            <span className="text-xs capitalize text-slate-300 font-medium">
                                                {val}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 3. News Volume by Sovereign Country (Bar Chart) */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                News Volume by Country
                            </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Top Sovereign Feeds</span>
                    </div>

                    <div className="h-72 w-full">
                        {analytics.by_country.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No geographic data.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.by_country} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis
                                        dataKey="country"
                                        stroke="#64748b"
                                        fontSize={10}
                                        tickFormatter={(code) => code.toUpperCase()}
                                    />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#334155',
                                            borderRadius: '0.75rem',
                                            fontSize: '12px',
                                        }}
                                        formatter={(val, name, props) => [
                                            `${val} articles`,
                                            props.payload.name,
                                        ]}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Articles" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* 4. Top News Sources (Horizontal Bar Chart) */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                Top Appearing News Publishers
                            </h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Source Frequency</span>
                    </div>

                    <div className="h-72 w-full">
                        {analytics.top_sources.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No source data available.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analytics.top_sources}
                                    layout="vertical"
                                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                                    <YAxis
                                        dataKey="source"
                                        type="category"
                                        stroke="#64748b"
                                        fontSize={10}
                                        width={110}
                                        tickFormatter={(str) => (str.length > 14 ? `${str.slice(0, 14)}...` : str)}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#0f172a',
                                            borderColor: '#334155',
                                            borderRadius: '0.75rem',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Articles" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
