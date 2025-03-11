import mongoose, { Schema, Document } from "mongoose";

export interface ILiveStream extends Document {
  sellerId: string;
  sellerName: string;
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
  followers: { followerId: string; followerName: string }[]; // Array of followers
  followerCount: number; // Counter for followers
  createdAt: Date;
  updatedAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    sellerId: { type: String, required: true },
    sellerName: { type: String, required: true },
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
    followers: [
      {
        followerId: { type: String, required: true }, // Follower's ID
        followerName: { type: String, required: true }, // Follower's name
      },
    ],
    followerCount: { type: Number, default: 0 }, // Follower counter
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const LiveStream =
  mongoose.models.LiveStream ||
  mongoose.model<ILiveStream>("LiveStream", LiveStreamSchema);

export default LiveStream;
