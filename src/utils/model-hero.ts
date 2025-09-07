export function getBasics(model: {
    age?: number;
    nationality?: string;
    languages?: string[];
}): [string, string][] {
    return [
        ["Age", model.age != null ? String(model.age) : undefined],
        ["Nationality", model.nationality],
        ["Languages", model.languages?.length ? model.languages.join(", ") : undefined],
    ].filter(([, v]) => !!v) as [string, string][];
}

export function getAppearance(model: {
    heightCm?: number;
    weightKg?: number;
    dressSize?: string;
    shoeSize?: number;
    cupSize?: string;
    eyeColor?: string;
    hairColor?: string;
}): [string, string][] {
    return [
        ["Height", model.heightCm != null ? `${model.heightCm} cm` : undefined],
        ["Weight", model.weightKg != null ? `${model.weightKg} kg` : undefined],
        ["Dress size", model.dressSize],
        ["Shoe size", model.shoeSize != null ? String(model.shoeSize) : undefined],
        ["Cup size", model.cupSize],
        ["Eyes", model.eyeColor],
        ["Hair", model.hairColor],
    ].filter(([, v]) => !!v) as [string, string][];
}

export function getFeatures(model: {
    smoking?: boolean;
    drinking?: boolean;
    snowParty?: boolean;
    tattoo?: boolean;
    piercing?: boolean;
    silicone?: boolean;
}): string[] {
    return [
        model.smoking ? "Smoking" : null,
        model.drinking ? "Drinking" : null,
        model.snowParty ? "Snow party" : null,
        model.tattoo ? "Tattoo" : null,
        model.piercing ? "Piercing" : null,
        model.silicone ? "Silicone" : null,
    ].filter(Boolean) as string[];
}

