import React, { useState, useCallback, useMemo } from 'react';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { NewsArticleItem } from '@/types';
import { formatNewsDate } from '@/lib/utils';
import {
    BrainCircuit, Trophy, RotateCcw, ChevronRight, CheckCircle2,
    XCircle, BookOpen, Clock, Globe, Tag, User, Newspaper,
    Sparkles, Star, Zap, Target, ArrowLeft, Eye, ExternalLink,
    Flame, Award, HelpCircle, Check, Play, ShieldCheck, Shuffle
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuizPageProps {
    articles: NewsArticleItem[];
    allCountries: string[];
    allCategories: string[];
    allSources: string[];
    allAuthors: string[];
}

export interface QuizQuestion {
    id: number;
    type: 'headline' | 'source' | 'country' | 'category' | 'author' | 'stat' | 'factcheck';
    question: string;
    options: string[];
    correct: string;
    icon: React.ReactNode;
    articleTitle: string;
    sourceName?: string | null;
    canonicalUrl?: string | null;
    explanation?: string;
}

type QuizPhase = 'select' | 'reading' | 'quiz' | 'result';
type QuizMode = 'global' | 'article';
type QuizLength = 5 | 10 | 15 | 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickDistractors(correct: string, pool: string[], count = 3): string[] {
    const filtered = Array.from(new Set(pool.filter((v) => v && v.trim().toLowerCase() !== correct.trim().toLowerCase())));
    return shuffle(filtered).slice(0, count);
}

const COUNTRY_LABELS: Record<string, string> = {
    ph: 'Philippines', us: 'United States', gb: 'United Kingdom',
    jp: 'Japan', de: 'Germany', fr: 'France', sg: 'Singapore',
    au: 'Australia', ca: 'Canada', in: 'India', cn: 'China', kr: 'South Korea',
    it: 'Italy', es: 'Spain', br: 'Brazil', mx: 'Mexico', za: 'South Africa',
};

function countryLabel(code?: string | null): string {
    if (!code) return 'International';
    return COUNTRY_LABELS[code.toLowerCase()] || code.toUpperCase();
}

function cleanTitle(title: string): string {
    // Strip trailing source names like " - BBC", " | TechCrunch", " - AP News"
    return title.replace(/\s+[-|]\s+[^-|]+$/, '').trim();
}

// ─── Question Generators ──────────────────────────────────────────────────────

/**
 * Generate a comprehensive multi-story global quiz spanning up to `length` questions.
 * Only uses verified real news articles.
 */
function generateGlobalQuiz(
    articles: NewsArticleItem[],
    length: QuizLength,
    allSources: string[],
    allCountries: string[],
    allCategories: string[]
): QuizQuestion[] {
    const valid = articles.filter(
        (a) => a.title && a.title !== '[Removed]' && a.description && a.description.length > 20 && !a.is_seeded
    );

    if (valid.length === 0) return [];

    const pool = shuffle([...valid]);
    const questions: QuizQuestion[] = [];
    let qId = 1;

    // Build question generators across the pool
    for (let i = 0; i < pool.length && questions.length < length; i++) {
        const article = pool[i];
        const cleaned = cleanTitle(article.title);
        const source = article.source_name || 'Major News Agency';
        const otherArticles = pool.filter((_, idx) => idx !== i);

        // Pattern 1: Which source reported this headline?
        if (article.source_name && otherArticles.length >= 3) {
            const correct = article.source_name;
            const distractorSources = pickDistractors(correct, [
                ...otherArticles.map((a) => a.source_name || '').filter(Boolean),
                ...allSources
            ], 3);

            if (distractorSources.length === 3) {
                questions.push({
                    id: qId++,
                    type: 'source',
                    question: `Which verified newsroom published the report: "${cleaned}"?`,
                    options: shuffle([correct, ...distractorSources]),
                    correct,
                    icon: <Newspaper className="w-4 h-4 text-cyan-400" />,
                    articleTitle: article.title,
                    sourceName: article.source_name,
                    canonicalUrl: article.canonical_url,
                    explanation: `Published by ${correct}.`,
                });
                if (questions.length >= length) break;
            }
        }

        // Pattern 2: Headline association from source / topic
        if (otherArticles.length >= 3) {
            const correct = cleaned;
            const distractorHeadlines = shuffle(
                otherArticles.map((a) => cleanTitle(a.title)).filter((t) => t !== correct)
            ).slice(0, 3);

            if (distractorHeadlines.length === 3) {
                questions.push({
                    id: qId++,
                    type: 'headline',
                    question: `According to recent reports from ${source}, which of the following events was confirmed?`,
                    options: shuffle([correct, ...distractorHeadlines]),
                    correct,
                    icon: <Globe className="w-4 h-4 text-indigo-400" />,
                    articleTitle: article.title,
                    sourceName: article.source_name,
                    canonicalUrl: article.canonical_url,
                    explanation: `Verified headline reported by ${source}: "${cleaned}".`,
                });
                if (questions.length >= length) break;
            }
        }

        // Pattern 3: Key Statistic or Metric Comprehension
        if (article.description) {
            const numMatch = article.description.match(/\b(\$?\d[\d,.]*\s?(?:billion|million|trillion|percent|%|points|years|people|seats|kg|km)?)\b/i);
            if (numMatch && numMatch[1].length > 1 && numMatch[1].length < 20) {
                const stat = numMatch[1];
                const fakeStats = ['$20 Billion', '500 points', '42%', '10,000', '32%', '3.5%', '$1.3 Billion']
                    .filter((f) => f.toLowerCase() !== stat.toLowerCase());

                questions.push({
                    id: qId++,
                    type: 'stat',
                    question: `In the coverage of "${cleaned}", which specific number or statistic was highlighted?`,
                    options: shuffle([stat, ...fakeStats.slice(0, 3)]),
                    correct: stat,
                    icon: <Zap className="w-4 h-4 text-amber-400" />,
                    articleTitle: article.title,
                    sourceName: article.source_name,
                    canonicalUrl: article.canonical_url,
                    explanation: `The report noted: "${article.description.slice(0, 160)}..."`,
                });
                if (questions.length >= length) break;
            }
        }

        // Pattern 4: Fact Check verification (True or False)
        if (article.description && article.description.length > 50) {
            const snippet = article.description.split('.')[0].trim();
            if (snippet.length > 25) {
                questions.push({
                    id: qId++,
                    type: 'factcheck',
                    question: `Fact Check: Did ${source} report that: "${snippet}"?`,
                    options: ['True — verified by recent reporting', 'False — this is inaccurate'],
                    correct: 'True — verified by recent reporting',
                    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                    articleTitle: article.title,
                    sourceName: article.source_name,
                    canonicalUrl: article.canonical_url,
                    explanation: `Confirmed by ${source}: "${snippet}."`,
                });
                if (questions.length >= length) break;
            }
        }

        // Pattern 5: Country / Region origin
        if (article.country && article.country !== 'all') {
            const correctCountry = countryLabel(article.country);
            const distractorCountries = pickDistractors(
                article.country,
                allCountries.length > 0 ? allCountries : ['us', 'gb', 'jp', 'ca', 'de', 'ph'],
                3
            ).map(countryLabel);

            if (distractorCountries.length >= 3 && !distractorCountries.includes(correctCountry)) {
                questions.push({
                    id: qId++,
                    type: 'country',
                    question: `Which country's national monitoring feed reported the story: "${cleaned}"?`,
                    options: shuffle([correctCountry, ...distractorCountries.slice(0, 3)]),
                    correct: correctCountry,
                    icon: <Globe className="w-4 h-4 text-cyan-400" />,
                    articleTitle: article.title,
                    sourceName: article.source_name,
                    canonicalUrl: article.canonical_url,
                    explanation: `This development originates in the ${correctCountry} monitoring stream.`,
                });
                if (questions.length >= length) break;
            }
        }

        // Pattern 6: Category Classification
        if (article.category) {
            const cat = article.category.charAt(0).toUpperCase() + article.category.slice(1);
            const cats = ['Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'General'];
            const distractorCats = cats.filter((c) => c.toLowerCase() !== article.category?.toLowerCase()).slice(0, 3);

            questions.push({
                id: qId++,
                type: 'category',
                question: `What news desk or industry category does the story "${cleaned}" fall under?`,
                options: shuffle([cat, ...distractorCats]),
                correct: cat,
                icon: <Tag className="w-4 h-4 text-purple-400" />,
                articleTitle: article.title,
                sourceName: article.source_name,
                canonicalUrl: article.canonical_url,
                explanation: `Categorized under ${cat} by monitoring analysis.`,
            });
            if (questions.length >= length) break;
        }
    }

    return questions.slice(0, length);
}

/**
 * Generate an in-depth, multi-question quiz for a single article (up to 8-10 questions).
 */
function generateArticleDeepDive(
    article: NewsArticleItem,
    allCountries: string[],
    allCategories: string[],
    allSources: string[],
    allAuthors: string[],
    length: QuizLength
): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    const cleaned = cleanTitle(article.title);
    const source = article.source_name || 'The Publisher';
    let qId = 1;

    // Q1: Newsroom source
    if (article.source_name) {
        const correct = article.source_name;
        const distractors = pickDistractors(correct, allSources, 3);
        questions.push({
            id: qId++,
            type: 'source',
            question: `Which verified news organization published this story?`,
            options: shuffle([correct, ...distractors]),
            correct,
            icon: <Newspaper className="w-4 h-4 text-cyan-400" />,
            articleTitle: article.title,
            sourceName: article.source_name,
            canonicalUrl: article.canonical_url,
            explanation: `Published by ${correct}.`,
        });
    }

    // Q2: Country
    if (article.country) {
        const correct = countryLabel(article.country);
        const distractors = pickDistractors(article.country, allCountries, 3).map(countryLabel);
        questions.push({
            id: qId++,
            type: 'country',
            question: `In which country or regional feed did this news take place?`,
            options: shuffle([correct, ...distractors]),
            correct,
            icon: <Globe className="w-4 h-4 text-indigo-400" />,
            articleTitle: article.title,
            sourceName: article.source_name,
            canonicalUrl: article.canonical_url,
            explanation: `Originates from ${correct}.`,
        });
    }

    // Q3: News Category
    if (article.category) {
        const correct = article.category.charAt(0).toUpperCase() + article.category.slice(1);
        const allCats = ['Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'General'];
        const distractors = allCats.filter((c) => c.toLowerCase() !== article.category?.toLowerCase()).slice(0, 3);
        questions.push({
            id: qId++,
            type: 'category',
            question: `What news category best describes this development?`,
            options: shuffle([correct, ...distractors]),
            correct,
            icon: <Tag className="w-4 h-4 text-purple-400" />,
            articleTitle: article.title,
            sourceName: article.source_name,
            canonicalUrl: article.canonical_url,
            explanation: `Classified as ${correct}.`,
        });
    }

    // Q4: Headline Subject
    questions.push({
        id: qId++,
        type: 'headline',
        question: `What is the core event or headline development discussed in this article?`,
        options: shuffle([
            cleaned,
            'Global market sell-off triggers regulatory intervention',
            'International summit convenes to draft cross-border agreement',
            'Space agency postpones upcoming satellite launch after telemetry issue',
        ]),
        correct: cleaned,
        icon: <Star className="w-4 h-4 text-amber-400" />,
        articleTitle: article.title,
        sourceName: article.source_name,
        canonicalUrl: article.canonical_url,
        explanation: `The central headline reported is: "${cleaned}".`,
    });

    // Q5: Author attribution (if available)
    if (article.author && !article.author.includes('http') && !article.author.includes('facebook')) {
        const correct = article.author;
        const distractors = pickDistractors(correct, allAuthors, 3);
        if (distractors.length === 3) {
            questions.push({
                id: qId++,
                type: 'author',
                question: `Who was credited as the reporter or author for this coverage?`,
                options: shuffle([correct, ...distractors]),
                correct,
                icon: <User className="w-4 h-4 text-rose-400" />,
                articleTitle: article.title,
                sourceName: article.source_name,
                canonicalUrl: article.canonical_url,
                explanation: `Reported by journalist ${correct}.`,
            });
        }
    }

    // Q6: Numbers or Statistics in summary
    if (article.description) {
        const numMatch = article.description.match(/\b(\$?\d[\d,.]*\s?(?:billion|million|trillion|percent|%|points|years|people|seats)?)\b/i);
        if (numMatch && numMatch[1].length > 1) {
            const stat = numMatch[1];
            const fakes = ['$500M', '25%', '$10 Billion', '150,000', '12%'].filter((f) => f !== stat).slice(0, 3);
            questions.push({
                id: qId++,
                type: 'stat',
                question: `Based on the article text, what key statistic or quantity was stated?`,
                options: shuffle([stat, ...fakes]),
                correct: stat,
                icon: <Zap className="w-4 h-4 text-emerald-400" />,
                articleTitle: article.title,
                sourceName: article.source_name,
                canonicalUrl: article.canonical_url,
                explanation: `Summary mentions: "${article.description.slice(0, 150)}..."`,
            });
        }
    }

    // Q7: Acronym or Organization
    if (article.description) {
        const orgMatch = article.description.match(/\b([A-Z]{2,6})\b/);
        if (orgMatch && orgMatch[1]) {
            const org = orgMatch[1];
            const fakes = ['NASA', 'WHO', 'NATO', 'IMF', 'SEC', 'OECD'].filter((o) => o !== org).slice(0, 3);
            questions.push({
                id: qId++,
                type: 'stat',
                question: `Which organization, institution, or acronym is featured in the summary?`,
                options: shuffle([org, ...fakes]),
                correct: org,
                icon: <Award className="w-4 h-4 text-cyan-400" />,
                articleTitle: article.title,
                sourceName: article.source_name,
                canonicalUrl: article.canonical_url,
                explanation: `Mentioned entity: ${org}.`,
            });
        }
    }

    // Q8: Fact Verification
    if (article.description && article.description.length > 40) {
        const snippet = article.description.split('.')[0].trim();
        questions.push({
            id: qId++,
            type: 'factcheck',
            question: `Fact Verification: Did ${source} state that "${snippet}"?`,
            options: ['Yes — accurately confirmed by the reporting', 'No — this contradicts the reported text'],
            correct: 'Yes — accurately confirmed by the reporting',
            icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
            articleTitle: article.title,
            sourceName: article.source_name,
            canonicalUrl: article.canonical_url,
            explanation: `Verified by ${source}: "${snippet}."`,
        });
    }

    return questions.slice(0, length);
}

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score, total }: { score: number; total: number }) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade =
        pct === 100 ? { label: 'Grand Master!', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' } :
        pct >= 80  ? { label: 'News Expert!', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' } :
        pct >= 60  ? { label: 'Well Informed', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' } :
        pct >= 40  ? { label: 'Moderate Catch', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' } :
                     { label: 'Keep Reading!', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };

    return (
        <div className={`inline-flex flex-col items-center justify-center w-40 h-40 rounded-full border-2 shadow-2xl ${grade.bg}`}>
            <span className={`text-5xl font-black ${grade.color}`}>{pct}%</span>
            <span className={`text-xs font-bold mt-1 uppercase tracking-wider ${grade.color}`}>{grade.label}</span>
        </div>
    );
}

// ─── Reading Mode ─────────────────────────────────────────────────────────────

function ArticleReader({
    article,
    onStartQuiz,
    onBack,
}: {
    article: NewsArticleItem;
    onStartQuiz: () => void;
    onBack: () => void;
}) {
    const wordCount = article.description ? article.description.split(' ').length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 180));

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to quiz center
            </button>

            {/* Hero image */}
            {article.image_url && (
                <div className="relative w-full h-80 rounded-2xl overflow-hidden mb-8 border border-slate-800 bg-slate-900 shadow-2xl">
                    <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    {article.is_breaking && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-600 text-white tracking-wide shadow-lg">
                            Breaking News
                        </span>
                    )}
                </div>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
                {article.source_name && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                        <Newspaper className="w-3.5 h-3.5 text-indigo-400" />
                        {article.source_name}
                    </span>
                )}
                {article.category && (
                    <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase tracking-wider">
                        {article.category}
                    </span>
                )}
                {article.country && (
                    <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                        <Globe className="inline w-3 h-3 mr-1 text-cyan-400" />
                        {countryLabel(article.country)}
                    </span>
                )}
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Live News
                </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                {article.title}
            </h1>

            {/* Author & time */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-8 pb-6 border-b border-slate-800">
                {article.author && (
                    <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {article.author}
                    </span>
                )}
                <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {formatNewsDate(article.published_at)}
                </span>
                <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    ~{readTime} min read
                </span>
                {article.canonical_url && (
                    <a
                        href={article.canonical_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-auto"
                    >
                        Read full story on {article.source_name || 'Publisher'}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            {/* Article body */}
            <div className="prose prose-invert prose-sm max-w-none leading-8 text-slate-200 text-base mb-10 space-y-5">
                <p className="text-lg text-slate-100 font-medium leading-relaxed bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    {article.description}
                </p>
            </div>

            {/* Quiz CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-cyan-950/40 border border-indigo-500/30 shadow-xl">
                <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
                    <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="font-bold text-white text-base mb-1">Ready for the Comprehension Test?</p>
                    <p className="text-xs text-slate-400">Answer in-depth questions testing fact retention, source attribution, and reported metrics.</p>
                </div>
                <button
                    onClick={onStartQuiz}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
                >
                    <Sparkles className="w-4 h-4" />
                    Begin Quiz
                </button>
            </div>
        </div>
    );
}

// ─── Quiz Engine ──────────────────────────────────────────────────────────────

function QuizEngine({
    questions,
    title,
    subtitle,
    onDone,
    onBack,
}: {
    questions: QuizQuestion[];
    title: string;
    subtitle: string;
    onDone: (score: number, answers: Record<number, string>) => void;
    onBack: () => void;
}) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);

    const q = questions[current];
    const isLast = current === questions.length - 1;

    const handleSelect = (opt: string) => {
        if (revealed) return;
        setSelected(opt);
        setRevealed(true);
        const correct = opt.trim().toLowerCase() === q.correct.trim().toLowerCase();
        setAnswers((prev) => ({ ...prev, [q.id]: opt }));
        if (correct) {
            setScore((s) => s + 1);
        }
    };

    const handleNext = () => {
        if (isLast) {
            onDone(score, answers);
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
            setRevealed(false);
        }
    };

    const progress = ((current + 1) / questions.length) * 100;

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Exit Quiz
            </button>

            {/* Quiz Title Banner */}
            <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{title}</span>
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">
                    Question {current + 1} of {questions.length}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Score: {score} / {current + (revealed ? 1 : 0)}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 mb-6 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Article reference badge */}
            <div className="p-4 mb-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 shadow-lg">
                <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                    <Newspaper className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-300 leading-snug line-clamp-2">{q.articleTitle}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                        {q.sourceName && <span>Source: <strong className="text-slate-400">{q.sourceName}</strong></span>}
                        {q.canonicalUrl && (
                            <a
                                href={q.canonicalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                            >
                                Verify Story <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Question card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
                <div className="flex items-center gap-2 text-indigo-400 mb-3">
                    {q.icon}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {q.type.toUpperCase()} VERIFICATION
                    </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">{q.question}</p>
            </div>

            {/* Options list */}
            <div className="space-y-3 mb-6">
                {q.options.map((opt) => {
                    const isCorrect = opt.trim().toLowerCase() === q.correct.trim().toLowerCase();
                    const isChosen = opt === selected;
                    let cls = 'w-full text-left flex items-center gap-3.5 px-5 py-4 rounded-xl border text-sm font-semibold transition-all ';
                    if (!revealed) {
                        cls += 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500 hover:bg-slate-800/90 cursor-pointer shadow-sm';
                    } else if (isCorrect) {
                        cls += 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10';
                    } else if (isChosen && !isCorrect) {
                        cls += 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-md shadow-rose-500/10';
                    } else {
                        cls += 'bg-slate-900/40 border-slate-800/40 text-slate-500 cursor-not-allowed';
                    }
                    return (
                        <button
                            key={opt}
                            disabled={revealed}
                            className={cls}
                            onClick={() => handleSelect(opt)}
                        >
                            {revealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                            {revealed && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                            {(!revealed || (!isCorrect && !isChosen)) && (
                                <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800/80 shrink-0" />
                            )}
                            <span className="flex-1">{opt}</span>
                        </button>
                    );
                })}
            </div>

            {/* Revealed Feedback & Next button */}
            {revealed && (
                <div className="animate-in fade-in duration-200 space-y-4">
                    <div
                        className={`p-4 rounded-xl border text-xs leading-relaxed ${
                            selected?.trim().toLowerCase() === q.correct.trim().toLowerCase()
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                    >
                        <p className="font-bold text-sm mb-1">
                            {selected?.trim().toLowerCase() === q.correct.trim().toLowerCase()
                                ? '✅ Correct!'
                                : '❌ Incorrect'}
                        </p>
                        <p className="text-slate-300">
                            The correct answer is: <strong className="text-white">"{q.correct}"</strong>.
                        </p>
                        {q.explanation && (
                            <p className="text-slate-400 mt-1 italic">{q.explanation}</p>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01]"
                    >
                        {isLast ? (
                            <>
                                <Trophy className="w-4 h-4" /> See Final Scorecard
                            </>
                        ) : (
                            <>
                                Next Question ({current + 2} / {questions.length}) <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Result Screen ─────────────────────────────────────────────────────────────

function QuizResult({
    score,
    questions,
    answers,
    title,
    onRetry,
    onBackToList,
}: {
    score: number;
    questions: QuizQuestion[];
    answers: Record<number, string>;
    title: string;
    onRetry: () => void;
    onBackToList: () => void;
}) {
    const total = questions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-6">
                    <ScoreBadge score={score} total={total} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Quiz Completed!</h2>
                <p className="text-slate-400 text-sm">
                    {title}: You scored <strong className="text-emerald-400 font-bold">{score}</strong> out of{' '}
                    <strong className="text-white font-bold">{total}</strong> ({pct}% accuracy).
                </p>
            </div>

            {/* Answer review list */}
            <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Answer Review</h3>
                    <span className="text-xs text-slate-500">{score}/{total} correct</span>
                </div>

                {questions.map((q, idx) => {
                    const userAnswer = answers[q.id];
                    const isCorrect = userAnswer?.trim().toLowerCase() === q.correct.trim().toLowerCase();
                    return (
                        <div
                            key={q.id || idx}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                isCorrect
                                    ? 'bg-emerald-500/5 border-emerald-500/25'
                                    : 'bg-rose-500/5 border-rose-500/25'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {isCorrect ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white mb-1.5 leading-snug">
                                        Q{idx + 1}: {q.question}
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-xs text-slate-400 mb-1">
                                            Your answer: <span className="text-rose-400 font-semibold">{userAnswer || 'Skipped'}</span>
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-300">
                                        Correct answer: <span className="text-emerald-400 font-semibold">{q.correct}</span>
                                    </p>
                                    {q.explanation && (
                                        <p className="text-[11px] text-slate-500 mt-1.5 italic border-t border-slate-800/60 pt-1.5">
                                            {q.explanation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5">
                <button
                    onClick={onRetry}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                </button>
                <button
                    onClick={onBackToList}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-sm transition-colors"
                >
                    <Target className="w-4 h-4" />
                    Return to Quiz Hub
                </button>
            </div>
        </div>
    );
}

// ─── Main Quiz Hub ────────────────────────────────────────────────────────────

export default function Quiz({
    articles = [],
    allCountries = [],
    allCategories = [],
    allSources = [],
    allAuthors = [],
}: QuizPageProps) {
    const [phase, setPhase] = useState<QuizPhase>('select');
    const [selectedArticle, setSelectedArticle] = useState<NewsArticleItem | null>(null);
    const [quizMode, setQuizMode] = useState<QuizMode>('global');
    const [quizLength, setQuizLength] = useState<QuizLength>(10);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [searchFilter, setSearchFilter] = useState('');

    // Filter articles strictly: exclude seeded demo articles and invalid items
    const validArticles = useMemo(() => {
        return articles.filter(
            (a) =>
                !a.is_seeded &&
                a.title &&
                a.title !== '[Removed]' &&
                a.description &&
                a.description.trim().length > 20 &&
                a.canonical_url &&
                a.canonical_url.startsWith('http')
        );
    }, [articles]);

    const filteredArticles = useMemo(() => {
        if (!searchFilter.trim()) return validArticles;
        const q = searchFilter.toLowerCase();
        return validArticles.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                (a.source_name && a.source_name.toLowerCase().includes(q)) ||
                (a.category && a.category.toLowerCase().includes(q))
        );
    }, [validArticles, searchFilter]);

    // Launch Global Multi-Article News Challenge
    const handleStartGlobalQuiz = useCallback(
        (length: QuizLength = quizLength) => {
            const qs = generateGlobalQuiz(validArticles, length, allSources, allCountries, allCategories);
            if (qs.length === 0) return;
            setQuizMode('global');
            setSelectedArticle(null);
            setQuestions(qs);
            setScore(0);
            setAnswers({});
            setPhase('quiz');
        },
        [validArticles, quizLength, allSources, allCountries, allCategories]
    );

    // Launch Single Article Deep Dive
    const handleSelectArticle = useCallback(
        (article: NewsArticleItem) => {
            setSelectedArticle(article);
            setPhase('reading');
        },
        []
    );

    const handleStartArticleQuiz = useCallback(() => {
        if (!selectedArticle) return;
        const qs = generateArticleDeepDive(
            selectedArticle,
            allCountries,
            allCategories,
            allSources,
            allAuthors,
            quizLength
        );
        setQuizMode('article');
        setQuestions(qs);
        setScore(0);
        setAnswers({});
        setPhase('quiz');
    }, [selectedArticle, allCountries, allCategories, allSources, allAuthors, quizLength]);

    const handleDone = useCallback((finalScore: number, finalAnswers: Record<number, string>) => {
        setScore(finalScore);
        setAnswers(finalAnswers);
        setPhase('result');
    }, []);

    const handleRetry = useCallback(() => {
        if (quizMode === 'global') {
            handleStartGlobalQuiz(quizLength);
        } else if (selectedArticle) {
            handleStartArticleQuiz();
        }
    }, [quizMode, quizLength, selectedArticle, handleStartGlobalQuiz, handleStartArticleQuiz]);

    return (
        <AppLayout title="World News Quiz Hub">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 shrink-0">
                        <BrainCircuit className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">World News Quiz</h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                100% Live Verified
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Test your knowledge with long-form quizzes built entirely from real, current world headlines.
                        </p>
                    </div>
                </div>

                {/* Question Length Selector */}
                {phase === 'select' && (
                    <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
                        <span className="text-xs font-semibold text-slate-400 px-2.5">Length:</span>
                        {([5, 10, 15, 20] as QuizLength[]).map((len) => (
                            <button
                                key={len}
                                onClick={() => setQuizLength(len)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    quizLength === len
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                {len} Qs
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selection Phase */}
            {phase === 'select' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                    {/* Grand Marathon Challenge Card */}
                    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950/80 border border-indigo-500/30 shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2 max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    Featured Marathon Mode
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    The Global News Challenge ({quizLength} Questions)
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    A comprehensive, multi-topic challenge that tests your retention across all verified stories of the day.
                                    Covers headlines, key numbers, verified publishers, and geopolitics.
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        Verified Live Sources Only
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-amber-400" />
                                        Performance Scorecard
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Shuffle className="w-4 h-4 text-cyan-400" />
                                        Randomized Every Game
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleStartGlobalQuiz(quizLength)}
                                disabled={validArticles.length === 0}
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 shrink-0 disabled:opacity-50"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Start {quizLength}-Question Challenge
                            </button>
                        </div>
                    </div>

                    {/* Single Article Picker Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                            <div>
                                <h3 className="text-lg font-bold text-white">Or Select a Single Story for Deep-Dive</h3>
                                <p className="text-xs text-slate-400">Read the article first, then take an in-depth comprehension quiz.</p>
                            </div>
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Filter stories by keyword..."
                                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredArticles.map((article, idx) => (
                                <button
                                    key={article.id || article.canonical_url || idx}
                                    onClick={() => handleSelectArticle(article)}
                                    className="text-left group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-200 flex gap-4 items-start shadow-md"
                                >
                                    {article.image_url && (
                                        <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                                            <img
                                                src={article.image_url}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            {article.source_name && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                                                    {article.source_name}
                                                </span>
                                            )}
                                            {article.category && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                                                    {article.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">
                                            {cleanTitle(article.title)}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatNewsDate(article.published_at)}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:underline">
                                                <Eye className="w-3 h-3" /> Read & Quiz
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                                </button>
                            ))}
                        </div>

                        {filteredArticles.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
                                <BrainCircuit className="w-12 h-12 text-slate-600 mb-3" />
                                <p className="text-slate-300 font-semibold text-sm">No matching verified stories found.</p>
                                <p className="text-slate-500 text-xs mt-1">Try clearing your search filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reading Phase */}
            {phase === 'reading' && selectedArticle && (
                <ArticleReader
                    article={selectedArticle}
                    onStartQuiz={handleStartArticleQuiz}
                    onBack={() => { setPhase('select'); setSelectedArticle(null); }}
                />
            )}

            {/* Quiz Phase */}
            {phase === 'quiz' && questions.length > 0 && (
                <QuizEngine
                    questions={questions}
                    title={quizMode === 'global' ? `Global News Challenge (${questions.length} Questions)` : `Article Deep Dive (${questions.length} Questions)`}
                    subtitle={quizMode === 'global' ? 'Multi-topic verification across verified current headlines.' : `Comprehension test on "${cleanTitle(selectedArticle?.title || '')}".`}
                    onDone={handleDone}
                    onBack={() => {
                        if (quizMode === 'global') {
                            setPhase('select');
                        } else {
                            setPhase('reading');
                        }
                    }}
                />
            )}

            {/* Results Phase */}
            {phase === 'result' && (
                <QuizResult
                    score={score}
                    questions={questions}
                    answers={answers}
                    title={quizMode === 'global' ? `Global News Challenge (${questions.length} Qs)` : `Article Deep Dive`}
                    onRetry={handleRetry}
                    onBackToList={() => { setPhase('select'); setSelectedArticle(null); }}
                />
            )}
        </AppLayout>
    );
}
