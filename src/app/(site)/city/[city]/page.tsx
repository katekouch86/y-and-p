import type { Metadata } from "next";
import Stories from "@/components/stories/Stories";
import ModelCatalog from "@/components/model/model-catalog/ModelCatalog";
import {
    getCatalogModelsByCity,
    getSeoCityBySlug,
    getStoryModelsByCity,
} from "@/lib/model-data";
import { formatCityName, slugifyCity } from "@/utils/city";

export const dynamic = "force-dynamic";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ city: string }>;
}): Promise<Metadata> {
    const { city } = await params;
    const seoCity = await getSeoCityBySlug(city);
    const cityLabel = seoCity?.name || formatCityName(city) || city;
    const citySlug = seoCity?.slug || slugifyCity(city) || city;
    const models = await getCatalogModelsByCity(city);
    const title = `${cityLabel} Escort Models`;
    const description =
        models.length > 0
            ? `Browse ${models.length} profiles currently listed for ${cityLabel}, with availability, galleries, and profile details.`
            : `Browse model profiles, stories, and availability updates for ${cityLabel}.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/city/${citySlug}`,
        },
        openGraph: {
            title: `${title} | Y&P Agency`,
            description,
            url: `/city/${citySlug}`,
            images: [
                {
                    url: "/images/banner-image.png",
                    alt: `Y&P Agency in ${cityLabel}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | Y&P Agency`,
            description,
            images: ["/images/banner-image.png"],
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ city: string }>;
}) {
    const { city } = await params;
    const [stories, models] = await Promise.all([
        getStoryModelsByCity(city, 24),
        getCatalogModelsByCity(city),
    ]);
    const cityLabel = (await getSeoCityBySlug(city))?.name || formatCityName(city) || city;

    return (
        <>
            <h1 className="sr-only">Escort models in {cityLabel}</h1>
            <Stories city={city} items={stories} />
            <ModelCatalog city={city} models={models} />
        </>
    );
}
