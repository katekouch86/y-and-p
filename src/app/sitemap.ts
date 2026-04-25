import type { MetadataRoute } from "next";
import { getSeoCities, getSeoModels } from "@/lib/model-data";
import { getSiteUrl, SITE_URL } from "@/utils/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [cities, models] = await Promise.all([getSeoCities(), getSeoModels()]);

    return [
        {
            url: SITE_URL,
            changeFrequency: "daily",
            priority: 1,
        },
        ...cities.map((city) => ({
            url: getSiteUrl(`/city/${city.slug}`),
            changeFrequency: "daily" as const,
            priority: 0.8,
        })),
        ...models.map((model) => ({
            url: getSiteUrl(`/model/${model.slug}`),
            lastModified: model.updatedAt ? new Date(model.updatedAt) : undefined,
            changeFrequency: "daily" as const,
            priority: 0.7,
        })),
    ];
}
