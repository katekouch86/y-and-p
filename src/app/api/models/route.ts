import type { City } from "@/constants/cities";
import { NextResponse } from "next/server";
import { getCityLabel } from "@/constants/cities";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const expireTagNow = (tag: string) => revalidateTag(tag, { expire: 0 });
type NormalizedAvailability = { city: City; startDate: string; endDate: string };

export async function POST(req: Request) {
    try {
        await dbConnect();

        const data = await req.json();

        const availability: NormalizedAvailability[] = [];
        if (Array.isArray(data.availability)) {
            for (const rawSlot of data.availability as Array<{ city?: string; startDate?: string; endDate?: string }>) {
                const city = getCityLabel(rawSlot.city);
                if (!city) continue;

                availability.push({
                    city,
                    startDate: rawSlot.startDate?.trim() ?? "",
                    endDate: rawSlot.endDate?.trim() ?? "",
                });
            }
        }

        const mainCity = availability[0]?.city;
        if (!mainCity) {
            return NextResponse.json(
                { message: "City is required and must be one of: Rome, Milan, Florence" },
                { status: 400 }
            );
        }

        const about = data.about?.trim() || undefined;

        const languages = Array.from(new Set(data.languages ?? []));
        const gallery = Array.from(new Set(data.gallery ?? []));
        const videos = Array.from(new Set(data.videos ?? []));

        const rawStories = Array.isArray(data.stories) ? data.stories : [];

        const stories = Array.from(
            new Set(
                rawStories.map((s: { url: string; type: "image" | "video" }) =>
                    JSON.stringify({ url: s.url, type: s.type })
                )
            )
        ).map((x) => {
            if (typeof x !== "string") {
                return { url: "", type: "image" }; // fallback щоб API не впав
            }
            return JSON.parse(x);
        });


        const model = await Model.create({
            ...data,
            city: mainCity,
            availability,
            about,
            languages,
            gallery,
            videos,
            stories,
        });

        expireTagNow("models");
        expireTagNow(`model:${model.slug}`);

        return NextResponse.json(model, { status: 201 });

    } catch (error: unknown) {
        console.error("❌ ERROR CREATING MODEL:", error);

        const message =
            error instanceof Error ? error.message : "Server error";

        return NextResponse.json({ message }, { status: 500 });
    }
}
