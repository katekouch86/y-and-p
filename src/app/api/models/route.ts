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

        if (!data.slug || !data.name) {
            return NextResponse.json(
                { message: "slug and name are required" },
                { status: 400 }
            );
        }

        const uniq = <T,>(arr?: T[]) =>
            Array.from(new Set((arr ?? []).filter(Boolean) as T[]));

        const doc = await Model.create({
            ...data,
            about: data.about?.trim(),
            languages: uniq(data.languages),
            gallery: uniq(data.gallery),
            videos: uniq(data.videos),
            stories: uniq(
                (data.stories ?? []).map((s: StoryItem) => ({
                    url: s.url,
                    type: s.type,
                }))
            ),
        });


        return NextResponse.json(doc, { status: 201 });
    } catch (e: unknown) {
        if (
            e instanceof MongoServerError &&
            e.code === 11000 &&
            e.keyPattern &&
            "slug" in e.keyPattern
        ) {
            return NextResponse.json(
                { message: "Slug already exists" },
                { status: 409 }
            );
        }

        const message =
            e instanceof Error ? e.message : "Failed to create model";
        return NextResponse.json({ message }, { status: 500 });
    }
}
