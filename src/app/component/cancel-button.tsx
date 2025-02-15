// app/api/cancel-role/route.ts
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

const uri = process.env.MONGODB_URL!;

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const usersCollection = db.collection("users");

    // Update the user's role to 'buyer' and subscription status to 'inactive'
    await usersCollection.updateOne(
      { clerkId: userId },
      {
        $set: {
          role: "buyer",
          subscriptionStatus: "inactive",
        },
      }
    );

    await client.close();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
