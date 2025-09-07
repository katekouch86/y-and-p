export type PriceRow = { duration: string; price: string };

export type Pricing = {
    incall?: PriceRow[];
    outcall?: PriceRow[];
};

export type ModelPricingProps = {
    model?: { name?: string; pricing?: Pricing | PriceRow[] };
    pricing?: Pricing | PriceRow[];
};