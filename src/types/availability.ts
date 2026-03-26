import type { City } from "@/constants/cities";
import type {Model} from "@/models/model.model";

export type AvailabilityProps = {
    model: Pick<Model, "name" | "availability">;
};

export type AvailabilityList = { city: City; startDate: string; endDate: string };
