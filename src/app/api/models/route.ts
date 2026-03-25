import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

const expireTagNow = (tag: string) => revalidateTag(tag, { expire: 0 });

export async function POST(req: Request) {
    try {
        await dbConnect();

        const data = await req.json();

        const mainCity = data.availability?.[0]?.city?.trim();
        if (!mainCity) {
            return NextResponse.json(
                { message: "City is required (availability[0].city missing)" },
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
