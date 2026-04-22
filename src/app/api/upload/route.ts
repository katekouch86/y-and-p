import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function POST(req: Request) {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
        const form = await req.formData();
        const files = form.getAll("files") as File[];
        const dest = String(form.get("dest") || "").trim();

        if (!files.length || !dest) {
            return NextResponse.json({ message: "No files or dest" }, { status: 400 });
        }

        const uploaded = await Promise.all(
            files.map(async (file) => {
                const ext = path.extname(file.name);
                const key = `${dest}/${Date.now()}-${crypto.randomUUID()}${ext}`;

                await r2.send(
                    new PutObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                        Body: Buffer.from(await file.arrayBuffer()),
                        ContentType: file.type || "application/octet-stream",
                        CacheControl: CACHE_CONTROL,
                    })
                );

                return {
                    url: `${process.env.R2_PUBLIC_URL}/${key}`,
                };
            })
        );

        return NextResponse.json({ files: uploaded });
    }

    try {
        const body = (await req.json()) as {
            files?: Array<{ name?: string; type?: string }>;
            dest?: string;
        };
        const files = body.files ?? [];
        const dest = String(body.dest || "").trim();

        if (!files.length || !dest) {
            return NextResponse.json({ message: "No files or dest" }, { status: 400 });
        }

        const uploaded = await Promise.all(
            files.map(async (file) => {
                const fileName = String(file.name || "").trim();
                const contentType = String(file.type || "application/octet-stream").trim() || "application/octet-stream";

                if (!fileName) {
                    throw new Error("Invalid file name");
                }

                const ext = path.extname(fileName);
                const key = `${dest}/${Date.now()}-${crypto.randomUUID()}${ext}`;
                const uploadUrl = await getSignedUrl(
                    r2,
                    new PutObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                        ContentType: contentType,
                        CacheControl: CACHE_CONTROL,
                    }),
                    { expiresIn: 60 }
                );

                return {
                    url: `${process.env.R2_PUBLIC_URL}/${key}`,
                    uploadUrl,
                    contentType,
                };
            })
        );

        return NextResponse.json({ files: uploaded });
    } catch {
        return NextResponse.json({ message: "Invalid upload request" }, { status: 400 });
    }
}
