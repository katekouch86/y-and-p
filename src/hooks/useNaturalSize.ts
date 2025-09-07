"use client";
import { useEffect, useState } from "react";

export function useNaturalSize(src?: string | null) {
    const [wh, setWH] = useState<{ w: number; h: number } | null>(null);
    useEffect(() => {
        setWH(null);
        if (!src || typeof window === "undefined") return;
        const img = new window.Image();
        img.src = src;
        img.onload = () => setWH({ w: img.naturalWidth || 800, h: img.naturalHeight || 600 });
    }, [src]);
    return wh;
}
