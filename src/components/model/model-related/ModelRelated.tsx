import ModelCard from "@/components/model/model-card/ModelCard";
import type { ModelCatalogItemProps } from "@/types/model-catalog-item";
import "./ModelRelated.scss";

interface Props {
    city: string;
    models: ModelCatalogItemProps[];
}

export default function ModelRelated({ city, models }: Props) {
    if (!models.length) return null;

    return (
        <section className="model-related">
            <h2 className="model-related__title">Other models in {city}</h2>
            <div className="model-related__grid">
                {models.map((m) => (
                    <ModelCard
                        key={m.slug}
                        src={m.photo}
                        name={m.name}
                        href={`/model/${m.slug}`}
                        alt={`${m.name} — escort model in ${city}`}
                    />
                ))}
            </div>
        </section>
    );
}
