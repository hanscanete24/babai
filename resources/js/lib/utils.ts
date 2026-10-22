import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNewsDate(dateString?: string | null): string {
    if (!dateString) return "Recently";
    try {
        const date = parseISO(dateString);
        return format(date, "MMM dd, yyyy • h:mm a");
    } catch {
        return dateString;
    }
}

export function formatTimeAgo(dateString?: string | null): string {
    if (!dateString) return "Recently";
    try {
        const date = parseISO(dateString);
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return dateString;
    }
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    technology: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
    business: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    science: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
    health: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
    general: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    entertainment: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
    sports: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
};

export const WEEKDAY_NAMES = [
    { id: 1, name: "Monday", short: "Mon" },
    { id: 2, name: "Tuesday", short: "Tue" },
    { id: 3, name: "Wednesday", short: "Wed" },
    { id: 4, name: "Thursday", short: "Thu" },
    { id: 5, name: "Friday", short: "Fri" },
    { id: 6, name: "Saturday", short: "Sat" },
    { id: 0, name: "Sunday", short: "Sun" },
];
