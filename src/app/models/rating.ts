import mongoose, { Schema, Document } from "mongoose";

export interface IProductRating extends Document {
  userId: string; // Reference to the user who gave the rating
  userClerkId: string; // Clerk ID of the user
  userName: string; // Name of the user
  livestreamId: string; // Reference to the livestream
  productId: string; // Identifier for the product (could be index or unique ID)
  rating: number; // Rating value (e.g., 1-5)
  comment?: string; // Optional comment
  createdAt: Date;
  updatedAt: Date;
}

const ProductRatingSchema = new Schema<IProductRating>(
  {
    userId: { type: String, required: true }, // User's database ID
    userClerkId: { type: String, required: true }, // User's Clerk ID
    userName: { type: String, required: true }, // User's name
    livestreamId: {
      type: String,
      required: true,
      ref: "LiveStream", // Reference to the LiveStream model
    },
    productId: { type: String, required: true }, // Identifier for the product
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: { type: String },
  },
  { timestamps: true }
);

// Optional: Add compound index for unique rating per user per product
ProductRatingSchema.index(
  { userId: 1, livestreamId: 1, productId: 1 },
  { unique: true }
);

const ProductRating =
  mongoose.models.ProductRating ||
  mongoose.model<IProductRating>("ProductRating", ProductRatingSchema);

export default ProductRating;
