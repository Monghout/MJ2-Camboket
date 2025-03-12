import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URL!;
const client = new MongoClient(uri);

// Initialize the client once, outside of the handler
let db: any;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("Clerk-auth");
  }
  return db;
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate the userId to ensure it's an ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Update the user's role to 'seller'
    const result = await usersCollection.updateOne(
      { ClerkId: userId },
      { $set: { role: "seller" } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "User not found or role already set to seller" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
