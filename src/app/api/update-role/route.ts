import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URL!;
const client = new MongoClient(uri);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db("Clerk-auth");
    const usersCollection = db.collection("users");

    // Update the user's role to 'seller'
    await usersCollection.updateOne(
      { ClerkId: userId },
      { $set: { role: "seller" } }
    );

    return NextResponse.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
