import mongoose, { Schema, Document } from "mongoose";
import { features } from "process";

export interface ILiveStream extends Document {
  sellerId: string;
  sellerName: string; // Added sellerName
  title: string;
  description: string;
  category: string;
  products: {
    name: string;
    price: number;
    image: string;
    description: string;
    feature: boolean;
  }[];
  thumbnail: string | null;
  isLive: boolean;
  streamKey: string;
  playbackId: string;
  createdAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    sellerId: { type: String, required: true },
    sellerName: { type: String, required: true }, // Added sellerName
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    products: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true },
        feature: { type: Boolean, default: false },
      },
    ],
    thumbnail: { type: String, default: null },
    isLive: { type: Boolean, default: true },
    streamKey: { type: String, required: true, unique: true },
    playbackId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const LiveStream =
  mongoose.models.LiveStream ||
  mongoose.model<ILiveStream>("LiveStream", LiveStreamSchema);
export default LiveStream;
