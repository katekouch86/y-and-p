import type {Model} from "@/models/model.model";

export type AvailabilityProps = {
    model: Pick<Model, "name" | "availability">;
};

export type AvailabilityList = { city: string; startDate: string; endDate: string };
