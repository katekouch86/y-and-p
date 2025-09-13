"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import StoryViewer from "../story-viewer/StoryViewer";
import "./Stories.scss";

type ApiModelListItem = {
    _id?: string;
    slug: string;
    name: string;
    photo?: string;
    gallery?: string[];
    videos?: string[];                 // ✅ тут є videos
    city?: string;
    availability?: { city: string; startDate: string; endDate: string }[];
};

export default function Stories({ city }: { city?: string }) {
    const [items, setItems] = useState<ApiModelListItem[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    useEffect(() => {
        const run = async () => {
            const qs = new URLSearchParams({ available: "now", limit: "24" });
            if (city) qs.set("city", city);
            const res = await fetch(`/api/models/get-list?${qs.toString()}`, { cache: "no-store" });
            if (!res.ok) return setItems([]);
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        };
        run();
    }, [city]);

    if (!items.length) return null;

    const normalize = (s?: string) =>
        !s ? "/images/placeholder.jpg" : s.startsWith("http") || s.startsWith("/") ? s : `/${s}`;

    return (
        <>
            <section className="stories" aria-label="Stories of our models">
                <h2 className="stories__title">Stories of our models</h2>
                <div className="stories__container" role="list">
                    {items.map((m, idx) => (
                        <button
                            key={m.slug || m._id || idx}
                            type="button"
                            className="stories__item"
                            role="listitem"
                            aria-label={`${m.name} story`}
                            onClick={() => setOpenIndex(idx)}
                        >
              <span className="stories__ring">
                <span className="stories__thumb">
                  <Image
                      src={normalize(m.photo)}
                      alt={m.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                  />
                </span>
              </span>
                            <span className="stories__name">{m.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {openIndex !== null && (
                <StoryViewer
                    models={items.map((m) => ({
                        id: m.slug || m._id || "",
                        slug: m.slug,
                        name: m.name,
                        photo: normalize(m.photo),
                        // ✅ тільки videos з БД
                        videos: (m.videos ?? []).map(normalize),
                        gallery: (m.gallery?.length ? m.gallery : [m.photo]).map(normalize),
                        city: (m.city ?? m.availability?.[0]?.city ?? city ?? ""),
                    }))}
                    startModelIndex={openIndex}
                    onClose={() => setOpenIndex(null)}
                    city={city}
                />
            )}
        </>
    );
}
