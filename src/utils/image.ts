import type { StaticImageData } from "next/image";

export function normalizeSrc(
    src?: string | StaticImageData
): string | StaticImageData {
    if (!src) return "/images/placeholder.jpg";

    if (typeof src !== "string") {
        return src;
    }

    if (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("blob:") ||
        src.startsWith("data:")
    ) {
        return src;
    }

    return src.startsWith("/") ? src : `/${src}`;
}

export function shouldBypassImageOptimization(
    src?: string | StaticImageData | null
): boolean {
    if (!src || typeof src !== "string") return false;

    return (
        src.startsWith("http://") ||
        src.startsWith("https://") ||
        src.startsWith("blob:") ||
        src.startsWith("data:")
    );
}
