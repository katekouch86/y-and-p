import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";

export const runtime = "nodejs";

const ARRIVING_SOON_DAYS = 7;

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city")?.trim();
        const availableParam = searchParams.get("available");
        const limit = Number(searchParams.get("limit") ?? 0);

        const projection =
            "slug name photo gallery videos city availability stories updatedAt";

        const availableNow =
            availableParam === "now" ||
            availableParam === "1" ||
            availableParam === "true";

        const availableSoon = availableParam === "soon";

        const elem: Record<string, unknown> = {};

        if (city) {
            elem.city = { $regex: `^${city}$`, $options: "i" };
        }

        if (availableNow || availableSoon) {
            const now = new Date();
            const today = now.toISOString().slice(0, 10); // YYYY-MM-DD

            if (availableNow) {
                elem.startDate = { $lte: today };
                elem.endDate = { $gte: today };
            } else if (availableSoon) {

                const future = new Date(now);
                future.setDate(future.getDate() + ARRIVING_SOON_DAYS);
                const soonLimit = future.toISOString().slice(0, 10);

                elem.startDate = { $gt: today, $lte: soonLimit };
            }
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
        return NextResponse.json({ message }, { status: 500 });
    }
}
