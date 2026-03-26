import mongoose, { Schema, models } from "mongoose";
import { CITIES } from "@/constants/cities";

const StorySchema = new Schema(
    {
            url: { type: String, required: true },
            type: { type: String, enum: ["image", "video"], default: "image" },
            createdAt: { type: Date, default: Date.now },
            expiresAt: { type: Date },
    },
    { _id: true }
);

const PriceItemSchema = new Schema({ duration: String, price: String }, { _id: false });
const PricingSchema = new Schema(
    {
            incall: { type: [PriceItemSchema], default: [] },
            outcall: { type: [PriceItemSchema], default: [] },
    },
    { _id: false }
);

const TimeRangeSchema = new Schema({ start: String, end: String, endNextDay: Boolean }, { _id: false });
const DayScheduleSchema = new Schema({ day: String, ranges: [TimeRangeSchema] }, { _id: false });
const ScheduleSchema = new Schema({ timezone: String, days: [DayScheduleSchema] }, { _id: false });

const AvailabilitySchema = new Schema(
    { city: { type: String, enum: CITIES }, startDate: String, endDate: String, address: String },
    { _id: false }
);

const ModelSchema = new Schema(
    {
            slug: { type: String, required: true, trim: true },
            name: { type: String, required: true, trim: true },

            age: Number,
            nationality: String,
            languages: { type: [String], default: [] },

            smoking: { type: Boolean, default: false },
            drinking: { type: Boolean, default: false },
            snowParty: { type: Boolean, default: false },

            eyeColor: String,
            hairColor: String,
            dressSize: String,
            shoeSize: Number,
            heightCm: Number,
            weightKg: Number,
            cupSize: String,

            tattoo: { type: Boolean, default: false },
            piercing: { type: Boolean, default: false },
            silicone: { type: Boolean, default: false },

            city: { type: String, enum: CITIES, required: true },
            availability: { type: [AvailabilitySchema], default: [] },
            schedule: { type: ScheduleSchema },

            photo: String,
            gallery: { type: [String], default: [] },
            videos: { type: [String], default: [] },

            about: String,
            pricing: { type: PricingSchema, default: {} },

            stories: { type: [StorySchema], default: [] },
    },
    { timestamps: true }
);

ModelSchema.index({ slug: 1 }, { unique: true });
ModelSchema.index({ city: 1 });
ModelSchema.index({ updatedAt: -1 });

export default models.Model || mongoose.model("Model", ModelSchema, "models");
