"use client";

import "./ModelPricing.scss";
import {ModelPricingProps} from "@/types/model-pricing";

type PriceRow = { duration: string; price: string };

export default function ModelPricing({model, pricing}: ModelPricingProps) {
    const labelName = model?.name ?? "Model";

    const src = model?.pricing ?? pricing;

    const incall: PriceRow[] = Array.isArray(src)
        ? src
        : (src?.incall ?? []).map(r => ({duration: r.duration, price: r.price}));

    const outcall: PriceRow[] = Array.isArray(src)
        ? []
        : (src?.outcall ?? []).map(r => ({duration: r.duration, price: r.price}));

    const hasRows = incall.length > 0 || outcall.length > 0;

    const Table = ({rows, title}: { rows: PriceRow[]; title: string }) => (
        <div className="model-pricing__card">
            <h3 className="model-pricing__subtitle">{title}</h3>
            <table className="model-pricing__table" aria-label={`${title} prices for ${labelName}`}>
                <thead>
                <tr>
                    <th>Duration</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r, i) => (
                    <tr key={`${title}-${r.duration}-${i}`}>
                        <td>{r.duration || "—"}</td>
                        <td>{r.price || "—"} €</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <section className="model-pricing" aria-label="Pricing">
            <h2 className="model-pricing__title">Pricing</h2>

            {hasRows ? (
                <div className="model-pricing__grid">
                    {incall.length > 0 && <Table rows={incall} title="Incall"/>}
                    {outcall.length > 0 && <Table rows={outcall} title="Outcall"/>}
                </div>
            ) : (
                <p className="model-pricing__empty">Pricing is not available yet. Please check back soon.</p>
            )}
        </section>
    );
}
