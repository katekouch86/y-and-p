import type { Metadata } from "next";
import Stories from "@/components/stories/Stories";
import ModelCatalog from "@/components/model/model-catalog/ModelCatalog";
import {
    getCatalogModelsByCity,
    getSeoCityBySlug,
    getStoryModelsByCity,
} from "@/lib/model-data";
import { formatCityName, slugifyCity } from "@/utils/city";
import { getSiteUrl } from "@/utils/site";

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
    const canonical = getSiteUrl(`/city/${citySlug}`);
    const ogImage = getSiteUrl("/images/banner-image.png");
    const title = `${cityLabel} Escort Models`;
    const description =
        models.length > 0
            ? `Browse ${models.length} profiles currently listed for ${cityLabel}, with availability, galleries, and profile details.`
            : `Browse model profiles, stories, and availability updates for ${cityLabel}.`;

    return {
        title,
        description,
        keywords: [
            `escort ${cityLabel}`,
            `${cityLabel} escort models`,
            `${cityLabel} escort agency`,
            `escort in ${cityLabel}`,
            "Y&P Agency",
            "luxury escort Italy",
        ],
        alternates: {
            canonical,
        },
        openGraph: {
            title: `${title} | Y&P Agency`,
            description,
            url: canonical,
            images: [
                {
                    url: ogImage,
                    secureUrl: ogImage,
                    type: "image/png",
                    width: 1200,
                    height: 630,
                    alt: `Y&P Agency in ${cityLabel}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | Y&P Agency`,
            description,
            images: [ogImage],
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ city: string }>;
}) {
    const { city } = await params;
    const [stories, models, seoCity] = await Promise.all([
        getStoryModelsByCity(city, 24),
        getCatalogModelsByCity(city),
        getSeoCityBySlug(city),
    ]);
    const cityLabel = seoCity?.name || formatCityName(city) || city;
    const citySlug = seoCity?.slug || slugifyCity(city) || city;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl("/") },
            { "@type": "ListItem", position: 2, name: `${cityLabel} Escort Models`, item: getSiteUrl(`/city/${citySlug}`) },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <h1 className="sr-only">Escort models in {cityLabel}</h1>
            <Stories city={city} items={stories} />
            <ModelCatalog city={city} models={models} />
        </>
    );
}
