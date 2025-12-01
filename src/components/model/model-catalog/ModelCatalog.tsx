"use client";

import "./ModelCatalog.scss";
import ModelCard from "@/components/model/model-card/ModelCard";
import { isAvailableNow, canonCity } from "@/utils/availability";
import { useEffect, useState } from "react";
import Loading from "@/components/loading/Loading";
import { ModelCatalogItemProps } from "@/types/model-catalog-item";

export default function ModelCatalog({ city }: { city: string }) {
    const [models, setModels] = useState<ModelCatalogItemProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams();
                if (city) params.set("city", city);

                const response = await fetch(
                    "/api/models/get-list?" + params.toString()
                );

                const data: ModelCatalogItemProps[] = await response.json();
                setModels(data);
            } catch (err) {
                console.log("Failed to fetch models", err);
                setModels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, [city]);

    if (loading) return <Loading />;

    // Universal date parser (supports DD.MM.YYYY + ISO)
    const parseDate = (str: string) => {
        if (str.includes(".")) {
            const [d, m, y] = str.split(".");
            return new Date(+y, +m - 1, +d);
        }
        return new Date(str);
    };

    // 🔥 NEW VERSION — no “7 days” limit
    const isArrivingSoon = (
        availability: ModelCatalogItemProps["availability"],
        cityName: string
    ): boolean => {
        if (!availability?.length) return false;

        const targetCity = canonCity(cityName);
        const today = new Date();

        return availability.some((slot) => {
            if (!slot?.city || !slot.startDate) return false;
            if (canonCity(slot.city) !== targetCity) return false;

            const start = parseDate(slot.startDate);

            return start > today; // 🔥 future date = arriving soon
        });
    };

    // AVAILABLE NOW (today is between start & end)
    const availableNow = models.filter((m) =>
        isAvailableNow(m.availability, city)
    );

    // ARRIVING SOON (any future date)
    const arrivingSoon = models.filter(
        (m) =>
            !isAvailableNow(m.availability, city) &&
            isArrivingSoon(m.availability, city)
    );

    return (
        <div className="model-catalog">

            <h1 className="model-catalog__title">Available Now</h1>

            <section className="model-catalog__grid">
                {availableNow.length === 0 && (
                    <div className="model-catalog__empty">
                        <h1 className="model-catalog__empty-text">
                            No models available now in {canonCity(city)}.
                        </h1>
                    </div>
                )}

                {availableNow.map((it, idx) => (
                    <ModelCard
                        key={it.slug || it._id || idx}
                        src={it.photo}
                        name={it.name}
                        href={`/city/${canonCity(city)}/model/${it.slug}`}
                        priority={idx < 2}
                    />
                ))}
            </section>

            {arrivingSoon.length > 0 && (
                <>
                    <h1 className="model-catalog__title" style={{ marginTop: "50px" }}>
                        Arriving Soon
                    </h1>

                    <section className="model-catalog__grid">
                        {arrivingSoon.map((it, idx) => (
                            <ModelCard
                                key={it.slug || it._id || idx}
                                src={it.photo}
                                name={it.name}
                                href={`/city/${canonCity(city)}/model/${it.slug}`}
                                priority={false}
                            />
                        ))}
                    </section>
                </>
            )}
        </div>
    );
}
