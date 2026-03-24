import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { dbConnect } from "@/lib/mongoose";
import Model from "@/db/Model";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    await dbConnect();
    const { slug } = await context.params;

    const { url, type } = await req.json();

    const updated = await Model.findOneAndUpdate(
        { slug },
        { $push: { stories: { url, type } } },
        { new: true, projection: "slug stories" }
    ).lean();

    if (!updated) return NextResponse.json({ message: "Model not found" }, { status: 404 });
    revalidateTag("models", "max");
    revalidateTag(`model:${slug}`, "max");
    return NextResponse.json(updated);
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    await dbConnect();
    const { slug } = await context.params;
    const { storyId } = await req.json();

    const updated = await Model.findOneAndUpdate(
        { slug },
        { $pull: { stories: { _id: storyId } } },
        { new: true, projection: "slug stories" }
    ).lean();

    if (!updated) return NextResponse.json({ message: "Model not found" }, { status: 404 });
    revalidateTag("models", "max");
    revalidateTag(`model:${slug}`, "max");
    return NextResponse.json(updated);
}
