import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL } = process.env;

if (CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
} else {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
    });
}

export async function POST(req: Request) {
    try {
        if (!cloudinary.config().api_key) {
            return NextResponse.json({ message: "Server misconfigured: Cloudinary credentials missing" }, { status: 500 });
        }

        const form = await req.formData();
        const dest = String(form.get("dest") || "uploads");
        const files = form.getAll("files") as File[];

        if (!files.length) {
            return NextResponse.json({ message: "No files" }, { status: 400 });
        }

        const uploadOne = (file: File) =>
            new Promise<string>(async (resolve, reject) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                const base = file.name.replace(/\.[^.]+$/, "");
                const public_id = `${base}-${Date.now()}`;

                cloudinary.uploader
                    .upload_stream(
                        { folder: dest, resource_type: "auto", public_id },
                        (err, res) => (err || !res ? reject(err) : resolve(res.secure_url))
                    )
                    .end(buffer);
            });

        const urls = await Promise.all(files.map(uploadOne));

        return NextResponse.json(
            { files: urls.map((url) => ({ url })) },
            { status: 200 }
        );
    } catch (e) {
        console.error("POST /api/upload error:", e);
        let message = "Upload failed";
        if (e instanceof Error) message = e.message;
        return NextResponse.json({ message }, { status: 500 });
    }
}
