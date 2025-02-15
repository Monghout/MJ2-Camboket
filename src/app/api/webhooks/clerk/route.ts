import { clerkClient } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { UserCreate } from "@/lib/action/user.action";
// You'll need to create this function to update user online status
import { updateUserOnlineStatus } from "@/lib/action/user.action";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.WEBHOOK_SECRET_KEY;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (!id) {
    console.error("Missing user id in webhook event data.");
    return new Response("Error: Missing user ID", { status: 400 });
  }

  // Handle user creation
  if (eventType === "user.created") {
    const { email_addresses, image_url, first_name, last_name } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      name: `${first_name} ${last_name}`,
      role: "buyer",
      subscriptionStatus: "inactive",
      photo: image_url || "",
      socialMediaLinks: [],
      isOnline: false,
      lastSeen: new Date(),
    };

    console.log("Creating user:", user);

    try {
      const newUser = await UserCreate(user);

      if (newUser) {
        const client = await clerkClient();
        console.log("Clerk User ID:", id);

        if (typeof id !== "string") {
          console.error(
            "Invalid user id type. Expected string, got:",
            typeof id
          );
          return new Response("Error: Invalid user ID type", { status: 400 });
        }

        try {
          await client.users.updateUserMetadata(id, {
            publicMetadata: { userId: newUser._id },
          });
        } catch (updateError) {
          console.error("Error updating user metadata:", updateError);
          return new Response("Error updating user metadata", { status: 500 });
        }
      }

      return new Response("New User Created", { status: 201 });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user in database", { status: 500 });
    }
  }

  // Handle user sign in - set online status to true
  if (eventType === "session.created") {
    try {
      await updateUserOnlineStatus(id, true);
      return new Response("User online status updated", { status: 200 });
    } catch (error) {
      console.error("Error updating user online status:", error);
      return new Response("Error updating online status", { status: 500 });
    }
  }

  // Handle user sign out - set online status to false
  if (eventType === "session.ended" || eventType === "session.removed") {
    try {
      await updateUserOnlineStatus(id, false);
      return new Response("User offline status updated", { status: 200 });
    } catch (error) {
      console.error("Error updating user offline status:", error);
      return new Response("Error updating offline status", { status: 500 });
    }
  }

  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  return new Response("Webhook received successfully", { status: 200 });
}
