const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

function parseDateInput(value?: string): Date | null {
    if (!value) return null;

    if (value.includes(".")) {
        const [day, month, year] = value.split(".");
        const parsed = new Date(Number(year), Number(month) - 1, Number(day));
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isValidDateRange(startValue?: string, endValue?: string) {
    const start = parseDateInput(startValue);
    const end = parseDateInput(endValue);

    return {
        start,
        end,
        valid: Boolean(start && end),
    };
}

export function formatRange(startISO: string, endISO: string) {
    const { start: s, end: e, valid } = isValidDateRange(startISO, endISO);

    if (!valid || !s || !e) {
        if (startISO && endISO) return `${startISO} – ${endISO}`;
        return startISO || endISO || "Dates unavailable";
    }

    const sameYear = s.getFullYear() === e.getFullYear();
    const sameMonth = sameYear && s.getMonth() === e.getMonth();

    if (sameMonth) {
        const dayStart = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(s);
        const dayEnd = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(e);
        const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(s);
        return `${dayStart}–${dayEnd} ${monthYear}`;
    }
    return `${fmt.format(s)} – ${fmt.format(e)}`;
}
