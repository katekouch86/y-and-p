import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";
import { z } from "zod";
import { MongoServerError } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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

const UploadSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    age: z.coerce.number().int().min(18).max(99).optional(),
    nationality: z.string().optional(),
    languages: z.string().optional(), // comma-separated
    eyeColor: z.string().optional(),
    hairColor: z.string().optional(),
    dressSize: z.string().optional(),
    shoeSize: z.coerce.number().optional(),
    heightCm: z.coerce.number().optional(),
    weightKg: z.coerce.number().optional(),
    cupSize: z.string().optional(),
    smoking: z.coerce.boolean().optional(),
    drinking: z.coerce.boolean().optional(),
    snowParty: z.coerce.boolean().optional(),
    tattoo: z.coerce.boolean().optional(),
    piercing: z.coerce.boolean().optional(),
    silicone: z.coerce.boolean().optional(),
    videoUrl: z.string().optional(),
    pricing: z.string().optional(), // JSON string
    schedule: z.string().optional(), // JSON string
    availability: z.string(), // JSON string (required)
});

async function uploadToCloudinary(file: File, dest: string) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const base = file.name.replace(/\.[^.]+$/, "");
    const publicId = `${base}-${Date.now()}`;

    return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: dest,
                resource_type: "auto",
                public_id: publicId,
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        ).end(buffer);
    });
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const form = await req.formData();

        // Extract JSON fields as string values
        const rawData = Object.fromEntries(form.entries());

        const parsed = UploadSchema.safeParse(rawData);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Validation error", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;

        // Convert fields
        const availability = JSON.parse(data.availability);
        const pricing = data.pricing ? JSON.parse(data.pricing) : undefined;
        const schedule = data.schedule ? JSON.parse(data.schedule) : undefined;
        const languages = data.languages ? data.languages.split(",").map(s => s.trim()) : [];

        const rootCity = availability?.[0]?.city?.trim();
        if (!rootCity) {
            return NextResponse.json({ message: "City is required (availability[0].city)" }, { status: 400 });
        }

        // Upload photo (main)
        let photoUrl: string | undefined = undefined;
        const photoFile = form.get("photo") as File | null;
        if (photoFile) {
            photoUrl = await uploadToCloudinary(photoFile, `models/${data.slug}`);
        }

        // Upload gallery (multiple)
        const galleryFiles = form.getAll("gallery") as File[];
        const galleryUrls: string[] = [];
        for (const file of galleryFiles) {
            const url = await uploadToCloudinary(file, `models/${data.slug}/gallery`);
            galleryUrls.push(url);
        }

        // Upload video (optional)
        const videoFile = form.get("video") as File | null;
        let videoUrl = data.videoUrl;
        if (videoFile) {
            videoUrl = await uploadToCloudinary(videoFile, `models/${data.slug}/video`);
        }

        const doc = await Model.create({
            ...data,
            city: rootCity,
            languages: Array.from(new Set(languages)),
            gallery: Array.from(new Set(galleryUrls)),
            photo: photoUrl,
            pricing,
            availability,
            schedule,
            videoUrl,
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

        console.error("POST /api/models/upload error:", e);
        return NextResponse.json(
            { message: e instanceof Error ? e.message : "Failed to create model" },
            { status: 500 }
        );
    }
}
