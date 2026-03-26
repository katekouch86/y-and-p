import {notFound} from "next/navigation";
import { getCityLabel } from "@/constants/cities";
import ModelHero from "@/components/model/model-hero/ModelHero";
import ModelSlider from "@/components/model/model-slider/ModelSlider";
import ModelPricing from "@/components/model/model-pricing/ModelPricing";
import ModelAvailability from "@/components/model/model-availability/ModelAvailability";
import type {Model} from "@/models/model.model";
import {canonCity} from "@/utils/availability";
import ModelAboutSection from "@/components/model/model-video/ModelVideo";
import { getModelBySlug } from "@/lib/model-data";

export const dynamic = "force-dynamic";

export default async function ModelPage({
                                            params,
                                        }: {
    params: Promise<{ city: string; slug: string }>;
}) {
    const {city, slug} = await params;
    const model = (await getModelBySlug(slug)) as (Model & {
        about?: string;
        agency?: string;
        videos?: string[];
    }) | null;

    if (!model) return notFound();

    const requestedCity = canonCity(city);

    const matchesCity =
        model.availability?.some((slot) => {
            if (!slot.city) return false;
            return canonCity(slot.city) === requestedCity;
        }) ?? false;

    if (!matchesCity) {
        return notFound();
    }

    const currentCity = getCityLabel(city) || undefined;

    const gallery = [model.photo, ...(model.gallery ?? [])].filter(Boolean) as string[];
    const videoUrl = model.videos?.[0] || "";

    return (
        <main>
            <ModelHero model={model}/>

            <ModelAboutSection
                name={model.name}
                city={currentCity}
                videoUrl={videoUrl}
                about={model?.about}
            />

            <ModelSlider images={gallery} name={model.name}/>
            <ModelPricing model={model}/>
            <ModelAvailability model={model}/>
        </main>
    );
}
