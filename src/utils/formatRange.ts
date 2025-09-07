const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

export function formatRange(startISO: string, endISO: string) {
    const s = new Date(startISO);
    const e = new Date(endISO);
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