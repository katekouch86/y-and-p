import "./ModelCatalog.scss";
import ModelCard from "@/components/model/model-card/ModelCard";
import { getCityLabel } from "@/constants/cities";
import { isAvailableNow, isArrivingSoon } from "@/utils/availability";
import { ModelCatalogItemProps } from "@/types/model-catalog-item";

export default function ModelCatalog({
    city,
    models,
}: {
    city: string;
    models: ModelCatalogItemProps[];
}) {
    const cityLabel = getCityLabel(city) || city;

    const availableNow = models.filter((m) =>
        isAvailableNow(m.availability, city)
    );

    const arrivingSoon = models.filter(
        (m) =>
            !isAvailableNow(m.availability, city) &&
            isArrivingSoon(m.availability, city)
    );

    return (
        <div className="model-catalog">

            <h2 className="model-catalog__title">Available Now</h2>

            <section className="model-catalog__grid">
                {availableNow.length === 0 && (
                    <div className="model-catalog__empty">
                        <h1 className="model-catalog__empty-text">
                            No models available now in {cityLabel}.
                        </h1>
                    </div>
                )}

                {availableNow.map((it, idx) => (
                    <ModelCard
                        key={it.slug || it._id || idx}
                        src={it.photo}
                        name={it.name}
                        href={`/model/${it.slug}?city=${encodeURIComponent(city)}`}
                        priority={idx < 2}
                    />
                ))}
            </section>

            {arrivingSoon.length > 0 && (
                <>
                    <h2 className="model-catalog__title" style={{ marginTop: "50px" }}>
                        Arriving Soon
                    </h2>

                    <section className="model-catalog__grid">
                        {arrivingSoon.map((it, idx) => (
                            <ModelCard
                                key={it.slug || it._id || idx}
                                src={it.photo}
                                name={it.name}
                                href={`/model/${it.slug}?city=${encodeURIComponent(city)}`}
                            />
                        ))}
                    </section>
                </>
            )}
        </div>
    );
}
