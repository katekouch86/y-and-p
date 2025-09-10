import { notFound } from "next/navigation";
import ModelHero from "@/components/model/model-hero/ModelHero";
import ModelSlider from "@/components/model/model-slider/ModelSlider";
import ModelPricing from "@/components/model/model-pricing/ModelPricing";
import ModelAvailability from "@/components/model/model-availability/ModelAvailability";
import type { Model } from "@/models/model.model";

export default async function ModelPage({
                                            params,
                                        }: {
    params: Promise<{ city: string; slug: string }>;
}) {
    const { city, slug } = await params;

    const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const res = await fetch(
        `${baseUrl}/api/models/${encodeURIComponent(slug)}`,
        { cache: "no-store" }
    );

    if (!res.ok) return notFound();

    const model: Model & { about?: string; agency?: string } = await res.json();

    if (model.city && model.city.toLowerCase() !== city.toLowerCase()) {
        return notFound();
    }

    const gallery = [model.photo, ...(model.gallery ?? [])]
        .filter(Boolean) as string[];

    return (
        <main>
            <ModelHero model={model} />
            <ModelSlider images={gallery} name={model.name} />
            <ModelPricing model={model} />
            <ModelAvailability model={model} />
        </main>
    );
}
