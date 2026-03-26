import { NextResponse } from "next/server";
import { CITY_TO_SLUG, CITIES } from "@/constants/cities";
import type { City } from "@/constants/cities";
import { dbConnect } from "@/lib/mongoose";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET() {
    try {
        await dbConnect();
        const db = mongoose.connection.db;
        if (!db) {
            return NextResponse.json({ message: "DB not initialized" }, { status: 500 });
        }

        const totalModels = await db.collection("models").countDocuments();

        const availableNowAgg = await db.collection("models").aggregate([
            { $unwind: "$availability" },
            {
                $match: {
                    "availability.startDate": { $ne: "" },
                    "availability.endDate": { $ne: "" }
                }
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $lte: [ { $toDate: "$availability.startDate" }, new Date() ] },
                            { $gte: [ { $toDate: "$availability.endDate" }, new Date() ] }
                        ]
                    }
                }
            },
            { $count: "count" }
        ]).toArray();

        const availableNow = availableNowAgg?.[0]?.count ?? 0;

        const cityCountsEntries = await Promise.all(
            CITIES.map(async (city) => {
                const slug = CITY_TO_SLUG[city];
                const count = await db.collection("models").countDocuments({
                    "availability.city": { $regex: new RegExp(`^${slug}`, "i") }
                });

                return [city, count] as const;
            })
        );

        const cityCounts = Object.fromEntries(cityCountsEntries) as Record<City, number>;

        return NextResponse.json({
            totalModels,
            availableNow,
            cityCounts,
        });

    } catch (e: unknown) {
        let message = "Failed to fetch summary";
        if (e instanceof Error) message = e.message;
        console.error("SUMMARY ERROR:", message);
        return NextResponse.json({ message }, { status: 500 });
    }
}
