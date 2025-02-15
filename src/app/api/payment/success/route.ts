import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URL!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("ClerkId");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const client = await MongoClient.connect(uri);
    const db = client.db("Clerk-Auth");
    const usersCollection = db.collection("users");

    // Update the user's role to 'seller' and subscription status to 'active'
    await usersCollection.updateOne(
      { clerkId: userId },
      {
        $set: {
          role: "seller",
          subscriptionStatus: "active", // Add subscriptionStatus update
        },
      }
    );

    await client.close();

    // Redirect user to the homepage after role and subscription status update
    return NextResponse.redirect(new URL(`/`, req.url));
  } catch (error) {
    console.error("Error updating user role and subscription status:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
