import Image from "next/image";
import "./ModelHero.scss";
import {ModelHeroProps} from "@/types/model-hero";

const normalizeSrc = (s?: string) => {
    if (!s) return "/images/placeholder.jpg";
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:") || s.startsWith("blob:")) return s;
    return s.startsWith("/") ? s : `/${s}`;
};

export default function ModelHero({ model }: ModelHeroProps) {
    const {
        name,
        photo,
        age,
        nationality,
        languages,
        eyeColor,
        hairColor,
        dressSize,
        shoeSize,
        heightCm,
        weightKg,
        cupSize,
        smoking,
        drinking,
        snowParty,
        tattoo,
        piercing,
        silicone,
    } = model;

    const cover = normalizeSrc(photo);
    const unoptimized = cover.startsWith("http") || cover.startsWith("data:") || cover.startsWith("blob:");

    const stats: Array<{ label: string; value?: string | number }> = [
        { label: "Age", value: age },
        { label: "Nationality", value: nationality },
        { label: "Height", value: heightCm ? `${heightCm} cm` : undefined },
        { label: "Weight", value: weightKg ? `${weightKg} kg` : undefined },
        { label: "Dress size", value: dressSize },
        { label: "Shoe size", value: typeof shoeSize === "number" ? String(shoeSize) : shoeSize },
        { label: "Cup size", value: cupSize },
        { label: "Eye color", value: eyeColor },
        { label: "Hair color", value: hairColor },
    ].filter((x) => x.value);

    const languageTags = (languages ?? []).filter(Boolean);

    const featureChips = [
        smoking ? "Smoker" : undefined,
        drinking ? "Drinker" : undefined,
        snowParty ? "Snow party" : undefined,
        tattoo ? "Tattoo" : undefined,
        piercing ? "Piercing" : undefined,
        silicone ? "Silicone" : undefined,
    ].filter(Boolean) as string[];

    return (
        <section className="model-hero" aria-label={`${name} profile`}>
            <div className="model-hero__left">
                <div className="model-hero__photo">
                    <Image
                        src={cover}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 520px"
                        priority
                        unoptimized={unoptimized}
                        style={{ objectFit: "cover" }}
                    />
                </div>
            </div>

            <div className="model-hero__right">
                <h1 className="model-hero__name">{name}</h1>

                {!!languageTags.length && (
                    <div className="model-hero__block">
                        <div className="model-hero__subtitle">Languages</div>
                        <ul className="model-hero__tags">
                            {languageTags.map((lang) => (
                                <li key={lang} className="model-hero__tag">
                                    {lang}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!!stats.length && (
                    <div className="model-hero__block">
                        <div className="model-hero__subtitle">Details</div>
                        <ul className="model-hero__grid">
                            {stats.map((s) => (
                                <li key={s.label} className="model-hero__item">
                                    <span className="model-hero__label">{s.label}</span>
                                    <span className="model-hero__value">{s.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!!featureChips.length && (
                    <div className="model-hero__block">
                        <div className="model-hero__subtitle">Features</div>
                        <ul className="model-hero__tags">
                            {featureChips.map((f) => (
                                <li key={f} className="model-hero__tag">
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
