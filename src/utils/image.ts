import type {StaticImageData} from "next/image";

export const normalizeSrc = (s?: string | StaticImageData): string | StaticImageData => {
    if (!s) return "/images/placeholder.jpg";

    if (typeof s !== "string") return s;

    if (
        s.startsWith("http") ||
        s.startsWith("blob:") ||
        s.startsWith("data:")
    ) {
        return s;
    }

    return s.startsWith("/") ? s : `/${s}`;
};
