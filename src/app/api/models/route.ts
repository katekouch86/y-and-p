import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";
import { MongoServerError } from "mongodb";

export const runtime = "nodejs";

type StoryItem = { url: string; type: string };

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

        const stories = Array.from(
            new Set(
                (data.stories ?? []).map((s: { url: string; type: "image" | "video" }) =>
                    JSON.stringify({ url: s.url, type: s.type })
                )
            )
        ).map((x) => JSON.parse(x as string));

        const model = await Model.create({
            ...data,
            city: mainCity,
            about,
            languages,
            gallery,
            videos,
            stories,
        });

        return NextResponse.json(model, { status: 201 });

    } catch (error: unknown) {
        console.error("❌ ERROR CREATING MODEL:", error);

        const message =
            error instanceof Error ? error.message : "Server error";

        return NextResponse.json({ message }, { status: 500 });
    }
}


