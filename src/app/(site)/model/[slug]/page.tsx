import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModelProfilePage from "@/components/model/model-profile-page/ModelProfilePage";
import { getCatalogModelsByCity, getModelBySlug } from "@/lib/model-data";
import { getSiteUrl, SITE_NAME } from "@/utils/site";
import { getCitySlug } from "@/constants/cities";
import type { Model } from "@/models/model.model";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

type ProfileModel = Model & {
    about?: string;
    agency?: string;
    videos?: string[];
};

async function loadModel(slug: string): Promise<ProfileModel | null> {
    return (await getModelBySlug(slug)) as ProfileModel | null;
}

function buildDescription(model: ProfileModel): string {
    const cityCopy = model.city ? ` in ${model.city}` : "";
    const about = model.about?.trim();

    if (about) {
        return about.length > 160 ? `${about.slice(0, 157)}...` : about;
    }

    return `Discover ${model.name}'s profile${cityCopy} with availability, gallery, videos, and pricing.`;
}

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { slug } = await params;
    const model = await loadModel(slug);

    if (!model) {
        return {
            robots: { index: false, follow: false },
        };
    }

    const canonical = getSiteUrl(`/model/${model.slug}`);
    const description = buildDescription(model);
    const title = model.city
        ? `${model.name} — Escort Model in ${model.city} | ${SITE_NAME}`
        : `${model.name} | ${SITE_NAME}`;
    const ogAlt = model.city
        ? `${model.name} — escort model in ${model.city}`
        : model.name;

    return {
        title: { absolute: title },
        description,
        keywords: [
            model.name,
            `${model.name} escort`,
            ...(model.city ? [`escort ${model.city}`, `${model.city} escort models`] : []),
            "Y&P Agency",
            "luxury escort Italy",
        ],
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            type: "profile",
            images: model.photo
                ? [{ url: model.photo, alt: ogAlt }]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: model.photo ? [model.photo] : undefined,
        },
    };
}

export default async function Page({
    params,
}: {
    params: Params;
}) {
    const { slug } = await params;
    const model = await loadModel(slug);

    if (!model) return notFound();

    const relatedModels = model.city
        ? (await getCatalogModelsByCity(model.city))
              .filter((m) => m.slug !== slug)
              .slice(0, 4)
        : [];

    const citySlug = model.city ? getCitySlug(model.city) : null;
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl("/") },
            ...(citySlug
                ? [{ "@type": "ListItem", position: 2, name: `${model.city} Escort Models`, item: getSiteUrl(`/city/${citySlug}`) }]
                : []),
            { "@type": "ListItem", position: citySlug ? 3 : 2, name: model.name, item: getSiteUrl(`/model/${model.slug}`) },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ModelProfilePage model={model} relatedModels={relatedModels} />
        </>
    );
}
