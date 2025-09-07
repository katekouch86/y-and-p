import {ModelValues} from "@/components/model-upsert-modal/ModelUpsertModal";
import {AvailabilityList} from "@/types/availability";

export type ModelCardList = ModelValues & { _id: string; slug: string; availability: AvailabilityList[] };
