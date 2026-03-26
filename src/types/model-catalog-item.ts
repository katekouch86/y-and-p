import type { City } from "@/constants/cities";

export interface ModelCatalogItemProps {
    _id?: string;
    slug: string;
    name: string;
    photo: string;
    city: City;
    availability: { city: City; startDate: string; endDate: string }[];
}
