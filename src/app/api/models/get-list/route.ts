import { NextRequest, NextResponse } from "next/server";
import { getCatalogModelsByCity, getPublicModelList, getStoryModelsByCity } from "@/lib/model-data";
import { canonCity } from "@/utils/availability";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get("city")?.trim() || null;
        const available = searchParams.get("available")?.trim();
        const limitValue = Number(searchParams.get("limit"));
        const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 24;
        const includeStories = searchParams.get("includeStories") === "true" || available === "now";

        const docs = includeStories
            ? await getStoryModelsByCity(city ?? undefined, limit)
            : city
                ? await getCatalogModelsByCity(canonCity(city))
                : await getPublicModelList();

        return NextResponse.json(docs, {
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });

    } catch (e) {
        return NextResponse.json(
            { message: e instanceof Error ? e.message : "Failed to fetch models" },
            { status: 500 }
        );
    }
}
