export const normalizeSrc = (s?: string) => {
    if (!s) return "/images/placeholder.jpg";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("blob:") || s.startsWith("data:")) return s;
    return s.startsWith("/") ? s : `/${s}`;
};

export const filePreview = (f: File | null) => (f ? URL.createObjectURL(f) : "");
