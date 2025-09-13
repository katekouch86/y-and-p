import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";
import { z } from "zod";
import { MongoServerError } from "mongodb";

export const runtime = "nodejs";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const PriceItemSchema = z.object({
    duration: z.string().min(1),
    price: z.string().min(1),
});
const PricingSchema = z.object({
    incall: z.array(PriceItemSchema).optional(),
    outcall: z.array(PriceItemSchema).optional(),
});

const AvailabilitySchema = z.object({
    city: z.string().min(1),
    startDate: z.string().regex(ISO_DATE),
    endDate: z.string().regex(ISO_DATE),
});

const BodySchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),

    photo: z.string().min(1).optional(),
    gallery: z.array(z.string().min(1)).optional(),
    videos: z.array(z.string().min(1)).optional(),

    age: z.number().int().min(18).max(99).optional(),
    nationality: z.string().optional(),
    languages: z.array(z.string().min(1)).optional(),
    eyeColor: z.string().optional(),
    hairColor: z.string().optional(),
    dressSize: z.string().optional(),
    shoeSize: z.number().optional(),
    heightCm: z.number().optional(),
    weightKg: z.number().optional(),
    cupSize: z.string().optional(),
    smoking: z.boolean().optional(),
    drinking: z.boolean().optional(),
    snowParty: z.boolean().optional(),
    tattoo: z.boolean().optional(),
    piercing: z.boolean().optional(),
    silicone: z.boolean().optional(),

    about: z.string().trim().max(2000).optional(),
    availability: z.array(AvailabilitySchema).min(1),
    pricing: PricingSchema.optional(),
    schedule: z.any().optional(),
});

export async function POST(req: Request) {
    try {
        await dbConnect();

        const json = await req.json();
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Validation error", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const rootCity = data.availability?.[0]?.city?.trim();
        if (!rootCity) {
            return NextResponse.json(
                { message: "City is required (takes from availability[0].city)" },
                { status: 400 }
            );
        }

        const uniq = <T,>(arr?: T[]) =>
            Array.from(new Set((arr ?? []).filter(Boolean) as T[]));

        const doc = await Model.create({
            ...data,
            city: rootCity,
            about: data.about?.trim(),
            languages: uniq(data.languages),
            gallery: uniq(data.gallery),
            videos: uniq(data.videos),
        });

        return NextResponse.json(doc, { status: 201 });
    } catch (e: unknown) {
        if (
            e instanceof MongoServerError &&
            e.code === 11000 &&
            e.keyPattern &&
            "slug" in e.keyPattern
        ) {
            return NextResponse.json({ message: "Slug already exists" }, { status: 409 });
        }

        const message = e instanceof Error ? e.message : "Failed to create model";
        return NextResponse.json({ message }, { status: 500 });
    }
}
