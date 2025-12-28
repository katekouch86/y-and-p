import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const dest = String(form.get("dest") || "images");

    if (!files.length) {
        return NextResponse.json({ message: "No files" }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), "public", "uploads", dest);
    await fs.mkdir(baseDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || "";
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const fullPath = path.join(baseDir, name);

        await fs.writeFile(fullPath, buffer);
        urls.push(`/uploads/${dest}/${name}`);
    }

    return NextResponse.json({
        files: urls.map((url) => ({ url })),
    });
}