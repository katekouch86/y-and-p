export const LANGUAGE_OPTIONS = [
    "English","Italian","Ukrainian","Russian","Polish","German","French",
    "Spanish","Portuguese","Romanian","Czech","Slovak","Hungarian","Greek",
    "Turkish","Dutch","Swedish","Norwegian","Danish","Finnish","Arabic",
    "Hebrew","Chinese","Japanese","Korean",
] as const;

export const DRESS_SIZE_OPTIONS = [
    "XXS","XS","S","M","L","XL","XXL","EU 32","EU 34","EU 36","EU 38","EU 40",
    "EU 42","EU 44","EU 46",
] as const;

export const EYE_COLOR_OPTIONS = ["Blue","Green","Brown","Hazel","Grey","Amber","Black"] as const;
export const HAIR_COLOR_OPTIONS = [
    "Blonde","Brown","Black","Red","Auburn","Chestnut","Grey","White","Dyed","Highlights",
] as const;

// Для тумблерів
export const TOGGLE_FIELDS = [
    { key: "smoking",  label: "Smoking"  },
    { key: "drinking", label: "Drinking" },
    { key: "snowParty",label: "Snow party" },
    { key: "tattoo",   label: "Tattoo"   },
    { key: "piercing", label: "Piercing" },
    { key: "silicone", label: "Silicone" },
] as const;
