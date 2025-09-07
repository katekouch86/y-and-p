type UploadApiFile = { url: string };
type UploadApiResponse = { files?: UploadApiFile[]; message?: string };

export async function uploadFiles(files: File[], destFolder: string): Promise<string[]> {
    if (!files.length) return [];
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("dest", destFolder);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as UploadApiResponse;
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return (data?.files ?? []).map((x) => x.url);
}
