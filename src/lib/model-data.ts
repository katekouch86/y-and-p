import Model from "@/db/Model";
import { dbConnect } from "@/lib/mongoose";
import type { Model as ModelRecord, Story } from "@/models/model.model";
import { canonCity, isAvailableNow } from "@/utils/availability";
import { formatCityName, slugifyCity } from "@/utils/city";
import type { ModelCatalogItemProps } from "@/types/model-catalog-item";
import type { ModelCardList } from "@/types/model-card-list";

function toPlain<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeAvailability<T extends { city: string; startDate: string; endDate: string }>(
    availability?: T[] | null
): T[] {
    const normalized: T[] = [];

    for (const slot of availability ?? []) {
        const city = formatCityName(slot.city);
        if (!city) continue;

        normalized.push({ ...slot, city } as T);
    }

    return normalized;
}

function normalizeModelCities<T extends { city?: string | null; availability?: { city: string; startDate: string; endDate: string }[] | null }>(
    model: T
): T {
    const availability = normalizeAvailability(model.availability);
    const mainCity = formatCityName(model.city ?? "") || availability[0]?.city;

    return {
        ...model,
        ...(mainCity ? { city: mainCity } : {}),
        availability,
    } as T;
}

type PublicModelListItem = Pick<
    ModelRecord,
    "_id" | "slug" | "name" | "photo" | "city" | "availability" | "stories" | "updatedAt"
>;

async function queryPublicModelList(): Promise<PublicModelListItem[]> {
    await dbConnect();

    const docs = await Model.find({}, "_id slug name photo city availability stories updatedAt")
        .sort({ updatedAt: -1 })
        .lean<PublicModelListItem[]>()
        .exec();

    return toPlain(docs);
}

async function queryAdminModelList(): Promise<ModelCardList[]> {
    await dbConnect();

    const docs = await Model.find({}, "slug name photo availability updatedAt")
        .sort({ updatedAt: -1 })
        .lean<ModelCardList[]>()
        .exec();

    return toPlain(docs);
}

export async function getPublicModelList(): Promise<PublicModelListItem[]> {
    return (await queryPublicModelList()).map((model) => normalizeModelCities(model));
}

export type SeoCityEntry = {
    slug: string;
    name: string;
};

function collectCityEntries(models: Array<{ city?: string; availability?: { city: string }[] }>): SeoCityEntry[] {
    const entries = new Map<string, SeoCityEntry>();

    for (const model of models) {
        const rawCities = [model.city, ...(model.availability ?? []).map((slot) => slot.city)];

        for (const rawCity of rawCities) {
            const slug = slugifyCity(rawCity);
            const name = formatCityName(rawCity);

            if (!slug || !name || entries.has(slug)) continue;

            entries.set(slug, { slug, name });
        }
    }

    return Array.from(entries.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export async function getSeoCities(): Promise<SeoCityEntry[]> {
    const models = await getPublicModelList();

    return collectCityEntries(models);
}

export async function getSeoCityBySlug(citySlug: string): Promise<SeoCityEntry | null> {
    const normalizedSlug = slugifyCity(citySlug);

    if (!normalizedSlug) return null;

    const cities = await getSeoCities();

    return cities.find((city) => city.slug === normalizedSlug) ?? null;
}

export async function getSeoModels(): Promise<Array<{ slug: string; updatedAt?: string }>> {
    const models = await getPublicModelList();

    return models
        .filter((model) => Boolean(model.slug))
        .map((model) => ({
            slug: model.slug,
            updatedAt: model.updatedAt,
        }));
}

export async function getCatalogModelsByCity(city: string): Promise<ModelCatalogItemProps[]> {
    const cityKey = canonCity(city);
    const models = await getPublicModelList();

    return models
        .filter((model) =>
            (model.availability ?? []).some((slot) => canonCity(slot.city) === cityKey)
        )
        .map((model) => ({
            _id: model._id,
            slug: model.slug,
            name: model.name,
            photo: model.photo ?? "/images/placeholder.jpg",
            city: model.city,
            availability: normalizeAvailability(model.availability),
        }));
}

type StoryListItem = {
    _id?: string;
    slug: string;
    name: string;
    photo?: string;
    city?: string;
    availability?: { city: string; startDate: string; endDate: string }[];
    stories?: Story[];
};

export async function getStoryModelsByCity(
    city?: string,
    limit = 24
): Promise<StoryListItem[]> {
    const cityKey = canonCity(city);
    const models = await getPublicModelList();

    return models
        .filter((model) => (model.stories?.length ?? 0) > 0)
        .filter((model) => !cityKey || isAvailableNow(model.availability, cityKey))
        .filter(
            (model) =>
                !cityKey ||
                (model.availability ?? []).some((slot) => canonCity(slot.city) === cityKey)
        )
        .slice(0, Math.max(limit, 0))
        .map((model) => ({
            _id: model._id,
            slug: model.slug,
            name: model.name,
            photo: model.photo,
            city: model.city,
            availability: model.availability,
            stories: model.stories,
        }));
}

export async function getAdminModelList(): Promise<ModelCardList[]> {
    return (await queryAdminModelList()).map((model) => normalizeModelCities(model));
}

async function queryModelBySlug(slug: string): Promise<ModelRecord | null> {
    await dbConnect();

    const doc = await Model.findOne(
        { slug },
        "_id slug name about photo gallery videos stories age nationality languages eyeColor hairColor dressSize shoeSize heightCm weightKg cupSize smoking drinking snowParty tattoo piercing silicone city availability pricing schedule createdAt updatedAt"
    )
        .lean<ModelRecord | null>()
        .exec();

    return doc ? normalizeModelCities(toPlain(doc)) : null;
}

export async function getModelBySlug(slug: string): Promise<ModelRecord | null> {
    return queryModelBySlug(slug);
}
