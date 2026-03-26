import type { City } from "@/constants/cities";

export type Summary = {
    totalModels: number;
    availableNow: number;
    cityCounts: Record<City, number>;
};
