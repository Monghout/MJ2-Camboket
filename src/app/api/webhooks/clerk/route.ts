import { WebhookEvent } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    await connectDB();

    const event: WebhookEvent = req.body;

    switch (event.type) {
      case "user.created":
        const newUser = new User({
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
          name: `${event.data.first_name} ${event.data.last_name}`,
          role: "buyer", // Default role
          subscriptionStatus: "inactive",
        });
        await newUser.save();
        console.log("✅ User Created in MongoDB:", newUser);
        break;

      case "user.updated":
        await User.findOneAndUpdate(
          { clerkId: event.data.id },
          { name: `${event.data.first_name} ${event.data.last_name}` }
        );
        console.log("🔄 User Updated in MongoDB");
        break;

      case "user.deleted":
        await User.findOneAndDelete({ clerkId: event.data.id });
        console.log("❌ User Deleted from MongoDB");
        break;

      default:
        console.log("⚠️ Unhandled Clerk Webhook Event:", event.type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
