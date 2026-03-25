import { NextRequest, NextResponse } from "next/server";
import Model from "@/db/Model";
import type { Model as ModelDTO } from "@/models/model.model";
import { dbConnect } from "@/lib/mongoose";
import { revalidateTag } from "next/cache";
import { getModelBySlug } from "@/lib/model-data";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

const expireTagNow = (tag: string) => revalidateTag(tag, { expire: 0 });

const uniq = (arr?: unknown[]) =>
    Array.from(new Set((arr ?? []).filter(Boolean))) as string[];

export async function GET(_req: NextRequest, ctx: Ctx): Promise<NextResponse> {
    try {
        const { slug } = await ctx.params;
        const doc = (await getModelBySlug(slug)) as ModelDTO | null;

        if (!doc) {
            return NextResponse.json({ message: "Model not found" }, { status: 404 });
        }
        return NextResponse.json(doc, {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to fetch model";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
    try {
        await dbConnect();
        const { slug } = await ctx.params;
        const body = (await req.json()) as Record<string, unknown>;

        const ALLOWED = new Set<string>([
            "name", "age", "nationality", "languages",
            "smoking", "drinking", "snowParty",
            "eyeColor", "hairColor", "dressSize", "shoeSize",
            "heightCm", "weightKg", "cupSize",
            "tattoo", "piercing", "silicone",
            "availability",
            "schedule",
            "photo", "gallery", "videos",
            "pricing", "about", "stories"
        ]);


        const $set: Record<string, unknown> = { updatedAt: new Date() };

        for (const [k, v] of Object.entries(body)) {
            if (!ALLOWED.has(k)) continue;
            if (k === "languages" && Array.isArray(v)) $set.languages = uniq(v);
            else if (k === "gallery" && Array.isArray(v)) $set.gallery = uniq(v);
            else if (k === "videos" && Array.isArray(v)) $set.videos = uniq(v);
            else if (k === "stories" && Array.isArray(v)) $set.stories = v;
            else if (k === "about" && typeof v === "string") $set.about = v.trim();
            else $set[k] = v;
        }

        if (Object.keys($set).length === 1) {
            return NextResponse.json(
                { message: "Nothing to update" },
                { status: 400 }
            );
        }

        const updated = await Model.findOneAndUpdate({ slug }, { $set }, {
            new: true,
            lean: true,
            projection:
                "_id slug name about photo gallery videos stories age nationality languages eyeColor hairColor dressSize shoeSize heightCm weightKg cupSize smoking drinking snowParty tattoo piercing silicone city availability pricing schedule createdAt updatedAt",
        }).exec();

        if (!updated) {
            return NextResponse.json({ message: "Model not found" }, { status: 404 });
        }
        expireTagNow("models");
        expireTagNow(`model:${slug}`);
        return NextResponse.json(updated);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to update model";
        return NextResponse.json({ message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: Ctx): Promise<NextResponse> {
    try {
        await dbConnect();
        const { slug } = await ctx.params;

        const deleted = await Model.findOneAndDelete({ slug })
            .select("_id slug")
            .lean<{ _id: string; slug: string }>()
            .exec();

        if (!deleted) {
            return NextResponse.json({ message: "Model not found" }, { status: 404 });
        }

        expireTagNow("models");
        expireTagNow(`model:${slug}`);

        return NextResponse.json(
            {
                message: "Model deleted successfully",
                slug: deleted.slug,
                _id: deleted._id,
            },
            { status: 200 }
        );
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to delete model";
        return NextResponse.json({ message }, { status: 500 });
    }
}
