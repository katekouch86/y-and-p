import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";
import type { Model as ModelDTO } from "@/models/model.model";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx): Promise<NextResponse> {
    try {
        await dbConnect();
        const { slug } = await ctx.params;

        const doc = await Model.findOne(
            { slug },
            "_id slug name photo gallery age nationality languages eyeColor hairColor dressSize shoeSize heightCm weightKg cupSize smoking drinking snowParty tattoo piercing silicone city availability pricing schedule videoUrl createdAt updatedAt"
        )
            .lean<ModelDTO>()
            .exec();

        if (!doc) {
            return NextResponse.json({ message: "Model not found" }, { status: 404 });
        }
        return NextResponse.json(doc);
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
            "name",
            "age",
            "nationality",
            "languages",
            "smoking",
            "drinking",
            "snowParty",
            "eyeColor",
            "hairColor",
            "dressSize",
            "shoeSize",
            "heightCm",
            "weightKg",
            "cupSize",
            "tattoo",
            "piercing",
            "silicone",
            "city",
            "availability",
            "schedule",
            "photo",
            "gallery",
            "videoUrl",
            "pricing",
        ]);

        const $set: Record<string, unknown> = { updatedAt: new Date() };
        for (const [k, v] of Object.entries(body)) if (ALLOWED.has(k)) $set[k] = v;

        if (Object.keys($set).length === 1) {
            return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
        }

        const updated = await Model.findOneAndUpdate(
            { slug },
            { $set },
            {
                new: true,
                lean: true,
                projection:
                    "_id slug name photo gallery city availability pricing schedule videoUrl updatedAt",
            }
        ).exec();

        if (!updated) {
            return NextResponse.json({ message: "Model not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to update model";
        return NextResponse.json({ message }, { status: 500 });
    }
}
