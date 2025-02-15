// app/api/user/cancel-role/route.ts
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URL!;

export async function POST(req: Request) {
  try {
    // Parse the incoming JSON request body
    const body = await req.json();

    // Log the body to check if userId is being passed correctly
    console.log("Received request body:", body);

    const { userId } = body;

    // Validate userId presence
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const usersCollection = db.collection("users");

    // Update the user's role to 'buyer' and subscription status to 'inactive'
    const updateResult = await usersCollection.updateOne(
      { clerkId: userId },
      {
        $set: {
          role: "buyer",
          subscriptionStatus: "inactive",
        },
      }
    );

    // Check if the update was successful
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "User not found or no changes made" },
        { status: 404 }
      );
    }

    // Close MongoDB connection
    await client.close();

    // Return success response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
