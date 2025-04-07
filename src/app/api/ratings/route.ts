import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { cookies } from "next/headers";
import LiveStream from "@/app/models/LiveStream";
import ProductRating from "@/app/models/rating";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URL!;

export async function POST(req: Request) {
  try {
    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const ratingsCollection = db.collection("productratings");

    const {
      userId,
      userClerkId,
      userName,
      livestreamId,
      productId,
      rating,
      comment,
    } = await req.json();

    // Validate required fields
    if (
      !userId ||
      !userClerkId ||
      !userName ||
      !livestreamId ||
      !productId ||
      !rating
    ) {
      await client.close();
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      await client.close();
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if the livestream exists
    const livestream = await db
      .collection("livestreams")
      .findOne({ _id: new mongoose.Types.ObjectId(livestreamId) });

    if (!livestream) {
      await client.close();
      return NextResponse.json(
        { error: "Livestream not found" },
        { status: 404 }
      );
    }

    // Check if the product exists in the livestream
    const productExists = livestream.products.some(
      (product: any, index: number) =>
        product._id?.toString() === productId || index.toString() === productId
    );

    if (!productExists) {
      await client.close();
      return NextResponse.json(
        { error: "Product not found in this livestream" },
        { status: 404 }
      );
    }

    // Create or update the rating
    const existingRating = await ratingsCollection.findOne({
      userId,
      livestreamId,
      productId,
    });

    let result;
    if (existingRating) {
      // Update existing rating
      result = await ratingsCollection.updateOne(
        { _id: existingRating._id },
        {
          $set: {
            rating,
            comment: comment || existingRating.comment,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // Create new rating
      result = await ratingsCollection.insertOne({
        userId,
        userClerkId,
        userName,
        livestreamId,
        productId,
        rating,
        comment: comment || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await client.close();

    // Calculate average rating for the product
    const averageRating = await calculateAverageRating(livestreamId, productId);

    return NextResponse.json({
      success: true,
      averageRating,
      message: existingRating
        ? "Rating updated successfully"
        : "Rating added successfully",
    });
  } catch (error) {
    console.error("Error processing rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate average rating
async function calculateAverageRating(livestreamId: string, productId: string) {
  const client = await MongoClient.connect(uri);
  const db = client.db("Clerk-Auth");
  const ratingsCollection = db.collection("productratings");

  const result = await ratingsCollection
    .aggregate([
      {
        $match: {
          livestreamId,
          productId,
        },
      },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ])
    .toArray();

  await client.close();

  return result[0] || { averageRating: 0, totalRatings: 0 };
}
// Add to your existing ratings route
export async function DELETE(req: Request) {
  try {
    const { ratingId, livestreamId, productId } = await req.json();

    if (!ratingId || !livestreamId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const ratingsCollection = db.collection("productratings");

    // Delete the rating
    const result = await ratingsCollection.deleteOne({
      _id: new mongoose.Types.ObjectId(ratingId),
    });

    if (result.deletedCount === 0) {
      await client.close();
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    // Calculate new average rating
    const averageResult = await calculateAverageRating(livestreamId, productId);

    await client.close();

    return NextResponse.json({
      success: true,
      averageRating: averageResult.averageRating,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const livestreamId = searchParams.get("livestreamId");
    const productId = searchParams.get("productId");

    if (!livestreamId || !productId) {
      return NextResponse.json(
        { error: "Missing livestreamId or productId" },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const ratingsCollection = db.collection("productratings");

    // Get all ratings for this product
    const ratings = await ratingsCollection
      .find({
        livestreamId,
        productId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate average rating
    const averageResult = await calculateAverageRating(livestreamId, productId);

    await client.close();

    return NextResponse.json({
      success: true,
      ratings,
      averageRating: Number(averageResult.averageRating) || 0,
      totalRatings: Number(averageResult.totalRatings) || 0,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
