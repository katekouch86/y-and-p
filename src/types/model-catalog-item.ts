export interface ModelCatalogItemProps {
    _id?: string;
    slug: string;
    name: string;
    photo: string;
    city: string;
    availability: { city: string; startDate: string; endDate: string }[];
}