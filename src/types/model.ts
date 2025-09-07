export type Availability = { city: string; startDate: string; endDate: string };
export type PriceItem = { duration: string; price: string };
export type Pricing = { incall?: PriceItem[]; outcall?: PriceItem[] };

export type ModelValues = {
    _id?: string;
    slug?: string;
    name: string;

    photo?: string;
    gallery?: string[];

    age?: number;
    nationality?: string;
    languages?: string[];
    eyeColor?: string;
    hairColor?: string;
    dressSize?: string;
    shoeSize?: number;
    heightCm?: number;
    weightKg?: number;
    cupSize?: string;
    smoking?: boolean;
    drinking?: boolean;
    snowParty?: boolean;
    tattoo?: boolean;
    piercing?: boolean;
    silicone?: boolean;

    availability: Availability[];
    pricing?: Pricing;

    videoUrl?: string;
};

export type Mode = "create" | "edit";
