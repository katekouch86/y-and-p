import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const dest = String(form.get("dest") || "");

    if (!files.length || !dest) {
        return NextResponse.json({ message: "No files or dest" }, { status: 400 });
    }

    const uploaded: { url: string }[] = [];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name);
        const key = `${dest}/${Date.now()}-${crypto.randomUUID()}${ext}`;

        await r2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                CacheControl: "public, max-age=31536000, immutable",
            })
        );

        uploaded.push({
            url: `${process.env.R2_PUBLIC_URL}/${key}`,
        });
    }

    return NextResponse.json({ files: uploaded });
}
