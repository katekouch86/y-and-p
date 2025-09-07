import {AvailabilityRange} from "@/models/availability.model";
import {Schedule} from "@/models/schedule.model";
import {Pricing} from "@/models/pricing.model";

export type Model = {
    _id?: string;
    slug: string;
    name: string;
    age?: number;
    nationality?: string;
    languages?: string[];

    smoking?: boolean;
    drinking?: boolean;
    snowParty?: boolean;

    eyeColor?: string;
    hairColor?: string;
    dressSize?: string;
    shoeSize?: number;
    heightCm?: number;
    weightKg?: number;
    cupSize?: string;

    tattoo?: boolean;
    piercing?: boolean;
    silicone?: boolean;

    city: string;
    availability?: AvailabilityRange[];
    schedule?: Schedule;

    photo?: string;
    gallery?: string[];
    videoUrl?: string;

    pricing?: Pricing;
    createdAt?: string;
    updatedAt?: string;
};