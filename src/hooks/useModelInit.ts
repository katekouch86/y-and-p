"use client";
import { useEffect, useRef, useState } from "react";
import { getCityLabel } from "@/constants/cities";
import type { ModelValues, Mode } from "@/types/model";

const BASELINE: ModelValues = {
    name: "",
    photo: "",
    gallery: [],
    languages: [],
    nationality: "",
    availability: [{ city: "", startDate: "", endDate: "" }],
    pricing: { incall: [], outcall: [] },
    smoking: false,
    drinking: false,
    snowParty: false,
    tattoo: false,
    piercing: false,
    silicone: false,
    videoUrl: "",
};

const normalizeAvailability = (availability?: ModelValues["availability"]) =>
    availability?.length
        ? availability.map((slot) => ({
            ...slot,
            city: getCityLabel(slot.city) || "",
        }))
        : BASELINE.availability;

export function useModelInit(
    open: boolean,
    mode: Mode,
    context?: { slug?: string },
    initialValues?: Partial<ModelValues>,
    fetchUrlBuilder?: (slug: string) => string
) {
    const [values, setValues] = useState<ModelValues | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const originalRef = useRef<ModelValues | null>(null);

    useEffect(() => {
        if (!open) return;
        const run = async () => {
            setError(null);
            if (mode === "create") {
                const merged: ModelValues = {
                    ...BASELINE,
                    ...initialValues,
                    slug: initialValues?.slug ?? "",
                    name: initialValues?.name ?? "",
                    languages: initialValues?.languages ?? [],
                    gallery: initialValues?.gallery ?? [],
                    availability: normalizeAvailability(initialValues?.availability),
                    pricing: {
                        incall: initialValues?.pricing?.incall ?? [],
                        outcall: initialValues?.pricing?.outcall ?? [],
                    },
                };
                originalRef.current = null;
                setValues(merged);
                setLoading(false);
                return;
            }

            if (context?.slug) {
                try {
                    setLoading(true);
                    const url = fetchUrlBuilder ? fetchUrlBuilder(context.slug) : `/api/models/${context.slug}`;
                    const res = await fetch(url, { cache: "no-store" });
                    const full = await res.json();
                    if (!res.ok) throw new Error(full?.message || "Failed to load model");
                    const normalized: ModelValues = {
                        ...BASELINE,
                        ...full,
                        languages: full.languages ?? [],
                        gallery: full.gallery ?? [],
                        availability: normalizeAvailability(full.availability),
                        pricing: { incall: full.pricing?.incall ?? [], outcall: full.pricing?.outcall ?? [] },
                    };
                    originalRef.current = normalized;
                    setValues(normalized);
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        setError(e.message);
                    } else {
                        setError("Failed to load model");
                    }
                } finally {
                    setLoading(false);
                }
                return;
            }

            const merged: ModelValues = {
                ...BASELINE,
                ...initialValues,
                languages: initialValues?.languages ?? [],
                gallery: initialValues?.gallery ?? [],
                availability: normalizeAvailability(initialValues?.availability),
                pricing: {
                    incall: initialValues?.pricing?.incall ?? [],
                    outcall: initialValues?.pricing?.outcall ?? [],
                },
            };
            originalRef.current = merged;
            setValues(merged);
            setLoading(false);
        };
        run();
    }, [open, mode, context?.slug, fetchUrlBuilder, initialValues]);

    return { values, setValues, loading, error, originalRef };
}
