import type { Model } from "@/models/model.model";

export type Slide = { type: "image" | "video"; src: string };

export type StoryViewerProps = {
    models: Model[];
    startModelIndex: number;
    onClose: () => void;
    city?: string;
};