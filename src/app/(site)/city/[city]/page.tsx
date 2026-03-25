import Stories from "@/components/stories/Stories";
import ModelCatalog from "@/components/model/model-catalog/ModelCatalog";
import { getCatalogModelsByCity, getStoryModelsByCity } from "@/lib/model-data";

export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: {
    params: Promise<{ city: string }>;
}) {
    const { city } = await params;
    const [stories, models] = await Promise.all([
        getStoryModelsByCity(city, 24),
        getCatalogModelsByCity(city),
    ]);

    return (
        <>
            <Stories city={city} items={stories} />
            <ModelCatalog city={city} models={models} />
        </>
    );
}
