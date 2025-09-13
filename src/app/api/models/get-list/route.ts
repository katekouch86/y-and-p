import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city")?.trim();
        const available = searchParams.get("available");
        const limit = Number(searchParams.get("limit") ?? 0);

        const projection = "slug name photo gallery videoUrl city videos availability updatedAt";

        const availableNow =
            available === "now" || available === "1" || available === "true";

        const elem: Record<string, unknown> = {};
        if (city) {
            elem.city = { $regex: `^${city}$`, $options: "i" };
        }
        if (availableNow) {
            const today = new Date().toISOString().slice(0, 10);
            elem.startDate = { $lte: today };
            elem.endDate = { $gte: today };
        }

        const filter: Record<string, unknown> = {};
        if (Object.keys(elem).length > 0) {
            filter.availability = { $elemMatch: elem };
        }

        const docs = await Model.find(filter, projection)
            .sort({ updatedAt: -1 })
            .limit(limit || 0)
            .lean();

        return NextResponse.json(docs);
    } catch (e: unknown) {
        let message = "Failed to fetch models";
        if (e instanceof Error) message = e.message;
        return NextResponse.json(
            { message },
            { status: 500 }
        );
    }
}
