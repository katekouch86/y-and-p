import ModelHero from "@/components/model/model-hero/ModelHero";
import ModelSlider from "@/components/model/model-slider/ModelSlider";
import ModelPricing from "@/components/model/model-pricing/ModelPricing";
import ModelAvailability from "@/components/model/model-availability/ModelAvailability";
import ModelAboutSection from "@/components/model/model-video/ModelVideo";
import ModelRelated from "@/components/model/model-related/ModelRelated";
import type { Model } from "@/models/model.model";
import type { ModelCatalogItemProps } from "@/types/model-catalog-item";

type ProfileModel = Model & {
    about?: string;
    agency?: string;
    videos?: string[];
};

interface Props {
    model: ProfileModel;
    relatedModels?: ModelCatalogItemProps[];
}

export default function ModelProfilePage({ model, relatedModels = [] }: Props) {
    const gallery = [model.photo, ...(model.gallery ?? [])].filter(Boolean) as string[];
    const videos = (model.videos ?? []).filter(Boolean);
    const currentCity = model.city || undefined;

    return (
        <main>
            <ModelHero model={model} />

            <ModelAboutSection
                name={model.name}
                city={currentCity}
                videos={videos}
                about={model.about}
            />

            <ModelSlider images={gallery} name={model.name} />
            <ModelPricing model={model} />
            <ModelAvailability model={model} />

            {currentCity && (
                <ModelRelated city={currentCity} models={relatedModels} />
            )}
        </main>
    );
}
