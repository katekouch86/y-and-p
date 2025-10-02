import mongoose, { Schema, models } from "mongoose";

const StorySchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true, unique: true },
        media: { type: [String], default: [] }, // фото/відео
        city: { type: String, required: false },
        active: { type: Boolean, default: true }, // чи показувати
        expiresAt: { type: Date }, // можна зробити "як в Instagram" 24h
    },
    { timestamps: true }
);

export default models.Story || mongoose.model("Story", StorySchema, "stories");
