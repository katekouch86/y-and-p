export const CITIES = ["Rome", "Milan", "Florence"] as const;

export type City = (typeof CITIES)[number];
export type CitySlug = Lowercase<City>;

export const CITY_TO_SLUG: Record<City, CitySlug> = {
    Rome: "rome",
    Milan: "milan",
    Florence: "florence",
};

export const CITY_SLUGS = CITIES.map((city) => CITY_TO_SLUG[city]) as readonly CitySlug[];

export const CITY_LABEL_BY_SLUG: Record<CitySlug, City> = {
    rome: "Rome",
    milan: "Milan",
    florence: "Florence",
};

const CITY_ALIASES: Record<CitySlug, readonly string[]> = {
    rome: ["rome", "roma", "рим", "рома"],
    milan: ["milan", "milano", "mailand", "мілан"],
    florence: ["florence", "firenze", "флоренція", "флоренция"],
};

export function parseCity(raw?: string | null): City | null {
    if (!raw) return null;

    const value = raw.trim().toLowerCase();
    const match = CITY_SLUGS.find((slug) => CITY_ALIASES[slug].includes(value));

    return match ? CITY_LABEL_BY_SLUG[match] : null;
}

export function isCity(value: string): value is City {
    return parseCity(value) !== null;
}

export function getCitySlug(city?: string | null): CitySlug | "" {
    const parsed = parseCity(city);
    return parsed ? CITY_TO_SLUG[parsed] : "";
}

export function getCityLabel(city?: string | null): City | "" {
    return parseCity(city) ?? "";
}

export function formatCityList(cities: readonly City[] = CITIES): string {
    if (cities.length === 0) return "";
    if (cities.length === 1) return cities[0];
    if (cities.length === 2) return `${cities[0]} and ${cities[1]}`;

    return `${cities.slice(0, -1).join(", ")}, and ${cities[cities.length - 1]}`;
}
