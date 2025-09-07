import "./ModelCatalog.scss";
import ModelCard from "@/components/model/model-card/ModelCard";
import {isAvailableNow, canonCity} from "@/utils/availability";
import {useEffect, useState} from "react";
import Loading from "@/components/loading/Loading";
import {ModelCatalogItemProps} from "@/types/model-catalog-item";

export default function ModelCatalog({city}: { city: string }) {
    const [models, setModels] = useState<ModelCatalogItemProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const fetchModels = async () => {
                try {
                    const response = await fetch('/api/models/get-list?city=' + encodeURIComponent(city));
                    const data: ModelCatalogItemProps[] = await response.json();
                    setModels(data);
                    console.log('Fetched models:', data);
                } catch {
                    setModels([]);
                    console.log('Failed to fetch models');
                } finally {
                    setLoading(false);
                }
            };
            fetchModels();
        }, 1000);

        return () => clearTimeout(timer);
    }, [city]);

    if (loading) return <Loading/>

    const items = models.filter(
        (m) => isAvailableNow(m.availability, city) && canonCity(m.city) === canonCity(city)
    );
    console.log('Filtered items:', items);

    return (
        <div className={items.length === 0 ? "model-catalog--empty" : "model-catalog"}>
            <h1 className="model-catalog__title">Available Models</h1>
            <section className="model-catalog__grid" aria-label="Model catalog">
                {items.length === 0 && (
                    <div className="model-catalog__empty">
                        <h1 className="model-catalog__empty-text">
                            No models available in {canonCity(city)} right now.
                        </h1>
                    </div>
                )}
                {items.map((it, idx) => (
                    <ModelCard
                        key={it.slug || it._id || idx}
                        src={it.photo}
                        name={it.name}
                        href={`/city/${canonCity(city)}/model/${it.slug}`}
                        priority={idx < 2}
                    />
                ))}
            </section>
        </div>
    );
}
