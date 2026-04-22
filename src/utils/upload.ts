type UploadApiFile = { url: string; uploadUrl: string; contentType: string };
type UploadApiResponse = { files?: UploadApiFile[]; message?: string };
type ProxyUploadApiFile = { url: string };
type ProxyUploadApiResponse = { files?: ProxyUploadApiFile[]; message?: string };

async function uploadFilesViaServer(files: File[], destFolder: string): Promise<string[]> {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("dest", destFolder);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
    });

    const text = await res.text();
    let data: ProxyUploadApiResponse = {};

    if (text) {
        try {
            data = JSON.parse(text) as ProxyUploadApiResponse;
        } catch {
            if (!res.ok) {
                throw new Error(text || "Upload failed");
            }
            throw new Error("Invalid upload response");
        }
    }

    if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
    }

    return (data.files ?? []).map((file) => file.url);
}

export async function uploadFiles(files: File[], destFolder: string): Promise<string[]> {
    if (!files.length) return [];

    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        return uploadFilesViaServer(files, destFolder);
    }

    const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            dest: destFolder,
            files: files.map((file) => ({
                name: file.name,
                type: file.type,
            })),
        }),
    });

    const text = await res.text();
    let data: UploadApiResponse = {};

    if (text) {
        try {
            data = JSON.parse(text) as UploadApiResponse;
        } catch {
            if (!res.ok) {
                throw new Error(text || "Upload failed");
            }
            throw new Error("Invalid upload response");
        }
    }

    if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
    }

    const uploadTargets = data.files ?? [];

    if (uploadTargets.length !== files.length) {
        throw new Error("Upload target count mismatch");
    }

    await Promise.all(
        uploadTargets.map(async (target, index) => {
            const uploadRes = await fetch(target.uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": target.contentType,
                },
                body: files[index],
            });

            if (!uploadRes.ok) {
                const uploadText = await uploadRes.text();
                throw new Error(uploadText || "Direct upload failed");
            }
        })
    );

    return uploadTargets.map((x) => x.url);
}
