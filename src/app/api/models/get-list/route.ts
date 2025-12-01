import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city")?.trim() || null;

        const projection =
            "slug name photo gallery videos availability stories updatedAt";

        const filter = {};

        const docs = await Model.find(filter, projection)
            .sort({ updatedAt: -1 })
            .lean();

        return NextResponse.json(docs);

    } catch (e) {
        return NextResponse.json(
            { message: e instanceof Error ? e.message : "Failed to fetch models" },
            { status: 500 }
        );
    }
}

