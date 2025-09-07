"use client";
import { useMemo } from "react";
import type { ModelValues } from "@/types/model";

export function computeDiff(from: ModelValues | null, to: ModelValues | null) {
    if (!from || !to) return {};
    const diff: Record<string, unknown> = {};
    const shallow: (keyof ModelValues)[] = [
        "name","photo","age","nationality","eyeColor","hairColor","dressSize","shoeSize",
        "heightCm","weightKg","cupSize","smoking","drinking","snowParty","tattoo","piercing","silicone","videoUrl",
    ];
    for (const k of shallow) if (from[k] !== to[k]) diff[k as string] = to[k];

    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    if (!same(from.languages ?? [], to.languages ?? [])) diff.languages = to.languages ?? [];
    if (!same(from.gallery ?? [],   to.gallery   ?? [])) diff.gallery   = to.gallery   ?? [];
    if (!same(from.availability ?? [], to.availability ?? [])) diff.availability = to.availability ?? [];

    if (!same(from.pricing?.incall ?? [], to.pricing?.incall ?? [])) {
        diff.pricing = { ...(diff.pricing as Partial<ModelValues["pricing"]>), incall: to.pricing?.incall ?? [] };
    }
    if (!same(from.pricing?.outcall ?? [], to.pricing?.outcall ?? [])) {
        diff.pricing = { ...(diff.pricing as Partial<ModelValues["pricing"]>), outcall: to.pricing?.outcall ?? [] };
    }
    return diff;
}

export function useModelDiff(original: ModelValues | null, current: ModelValues | null) {
    return useMemo(() => computeDiff(original, current), [original, current]);
}
