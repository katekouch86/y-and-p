import type { City } from "@/constants/cities";

export type AvailabilityRange = {
    city: City;
    startDate: string;
    endDate: string;
};
