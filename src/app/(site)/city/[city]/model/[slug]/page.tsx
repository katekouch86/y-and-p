import { notFound } from "next/navigation";
import ModelHero from "@/components/model/model-hero/ModelHero";
import ModelSlider from "@/components/model/model-slider/ModelSlider";
import ModelPricing from "@/components/model/model-pricing/ModelPricing";
import ModelAvailability from "@/components/model/model-availability/ModelAvailability";
import ModelVideo from "@/components/model/model-video/ModelVideo"; // <— додай
import type { Model } from "@/models/model.model";
import { getBaseUrl } from "@/utils/getBaseUrl";

export default async function ModelPage({ params }: { params: Promise<{ city: string; slug: string }> }) {
    const { city, slug } = await params;

    const baseUrl = await getBaseUrl();
    const url = new URL(`/api/models/${encodeURIComponent(slug)}`, baseUrl);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return notFound();

    const model: Model & { about?: string; agency?: string; videos?: string[] } = await res.json();
    if (model.city && model.city.toLowerCase() !== city.toLowerCase()) return notFound();

    const gallery = [model.photo, ...(model.gallery ?? [])].filter(Boolean) as string[];
    const videoUrl = model.videos?.[0] || "";
    return (
        <main>
            <ModelHero model={model} />

            {videoUrl ? (
                <ModelVideo
                    name={model.name}
                    city={model.city}
                    videoUrl={videoUrl}
                    about={model?.about}
                />
            ) : null}

            <ModelSlider images={gallery} name={model.name} />
            <ModelPricing model={model} />
            <ModelAvailability model={model} />
        </main>
    );
}
