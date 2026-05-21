import ModelCard from "@/components/model/model-card/ModelCard";
import { getCitySlug } from "@/constants/cities";
import type { ModelCatalogItemProps } from "@/types/model-catalog-item";
import "./ModelRelated.scss";

interface Props {
    city: string;
    availableNow: ModelCatalogItemProps[];
    arrivingSoon: ModelCatalogItemProps[];
}

export default function ModelRelated({ city, availableNow, arrivingSoon }: Props) {
    if (!availableNow.length && !arrivingSoon.length) return null;

    const citySlugParam = encodeURIComponent(getCitySlug(city) || city.toLowerCase());

    return (
        <section className="model-related">
            {availableNow.length > 0 && (
                <>
                    <h2 className="model-related__title">Available now in {city}</h2>
                    <div className="model-related__grid">
                        {availableNow.map((m) => (
                            <ModelCard
                                key={m.slug}
                                src={m.photo}
                                name={m.name}
                                href={`/model/${m.slug}?city=${citySlugParam}`}
                                alt={`${m.name} — escort model in ${city}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {arrivingSoon.length > 0 && (
                <>
                    <h2 className="model-related__title model-related__title--soon">Arriving soon in {city}</h2>
                    <div className="model-related__grid">
                        {arrivingSoon.map((m) => (
                            <ModelCard
                                key={m.slug}
                                src={m.photo}
                                name={m.name}
                                href={`/model/${m.slug}?city=${citySlugParam}`}
                                alt={`${m.name} — escort model in ${city}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
