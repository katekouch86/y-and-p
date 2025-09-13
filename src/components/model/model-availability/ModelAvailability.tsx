"use client";

import { AvailabilityProps } from "@/types/availability";
import "./ModelAvailability.scss";
import {formatRange} from "@/utils/formatRange";

export default function ModelAvailability({ model }: AvailabilityProps) {
    const items = model.availability ?? [];
    const now = new Date();

    return (
        <section id="availability" className="model-availability" aria-label="Availability">
            <h2 className="model-availability__title">Availability</h2>

            {items.length === 0 ? (
                <p className="model-availability__empty">
                    The schedule for {model.name} isn’t published yet. Please check back soon.
                </p>
            ) : (
                <ul className="model-availability__list">
                    {items.map((a, i) => {
                        const start = new Date(a.startDate);
                        const end = new Date(a.endDate);
                        const isNow = start <= now && now <= end;

                        return (
                            <li key={i} className="model-availability__item">
                                <div className="model-availability__row">
                                    <span>City</span>
                                    <b className="model-availability__city">{a.city}</b>
                                </div>
                                <div className="model-availability__row">
                                    <span>Dates</span>
                                    <b>{formatRange(a.startDate, a.endDate)}</b>
                                </div>
                                <div className="model-availability__row">
                                    <span>Status</span>
                                    <b className={isNow ? "is-now" : "is-upcoming"}>
                                        {isNow ? "Available now" : "Upcoming"}
                                    </b>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
