import { slugifyCity } from "@/utils/city";

export type AvailabilityItem =
    | { city: string; startDate: string; endDate: string }
    | { city: string; dateRangeText?: string; address?: string; startDate?: string; endDate?: string };

export function canonCity(raw?: string): string {
    if (!raw) return "";

    return slugifyCity(raw);
}


export function isAvailableNow(
    availability?: AvailabilityItem[] | null,
    cityFilter?: string
): boolean {
    if (!Array.isArray(availability) || availability.length === 0) return false;

    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const cityCanon = canonCity(cityFilter);

    return availability.some((a) => {
        const aCity = canonCity(a.city);
        if (cityCanon && aCity !== cityCanon) return false;

        const startISO = (a as AvailabilityItem).startDate;
        const endISO = (a as AvailabilityItem).endDate;
        if (startISO && endISO) {
            return startISO <= today && today <= endISO;
        }

        return false;
    });
}
