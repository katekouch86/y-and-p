import { getCityLabel, getCitySlug } from "@/constants/cities";

function toTitleCase(value: string): string {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

export function slugifyCity(value?: string | null): string {
    if (!value) return "";

    const canonicalSlug = getCitySlug(value);
    if (canonicalSlug) return canonicalSlug;

    return value
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function formatCityName(value?: string | null): string {
    if (!value) return "";

    const canonicalLabel = getCityLabel(value);
    if (canonicalLabel) return canonicalLabel;

    return toTitleCase(
        value
            .trim()
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
    );
}
