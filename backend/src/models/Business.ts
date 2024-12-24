import { Schema, model, Document, Types } from "mongoose";

interface IReview {
  userId: Types.ObjectId;
  comment: string;
  createdAt: Date;
}

export interface IBusiness extends Document {
  name: string;
  description: string;
  category: string;
  owner: Types.ObjectId;
  subscribers: Types.ObjectId[];
  reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscribers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create text indexes for search functionality
businessSchema.index({ name: "text", description: "text" });

export const Business = model<IBusiness>("Business", businessSchema);
