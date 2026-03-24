import { NextResponse } from "next/server";
import { getAdminModelList } from "@/lib/model-data";

export const runtime = "nodejs";

export async function GET() {
    try {
        const docs = await getAdminModelList();

        return NextResponse.json(docs);
    } catch (e: unknown) {
        let message = "Failed to fetch models list";
        if (e instanceof Error) message = e.message;
        return NextResponse.json({ message }, { status: 500 });
    }
}
