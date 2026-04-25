import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModelProfilePage from "@/components/model/model-profile-page/ModelProfilePage";
import { getModelBySlug } from "@/lib/model-data";
import { getSiteUrl, SITE_NAME } from "@/utils/site";
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

    return {
        title: `${model.name} | ${SITE_NAME}`,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title: `${model.name} | ${SITE_NAME}`,
            description,
            url: canonical,
            type: "profile",
            images: model.photo
                ? [
                    {
                        url: model.photo,
                        alt: model.name,
                    },
                ]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: `${model.name} | ${SITE_NAME}`,
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

    return <ModelProfilePage model={model} />;
}
