import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get the raw body text (important for signature verification!)
  const body = await req.text();

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

    if (!email) {
      console.error("Webhook user.created: No email found for user", id);
      return new Response("Error: No email found", { status: 400 });
    }

    try {
      // Check if user already exists (in case of retry)
      const existingUser = await db.query.users.findFirst({
        where: eq(users.clerkId, id),
      });

      if (existingUser) {
        console.log("User already exists, skipping creation:", id);
        return new Response("User already exists", { status: 200 });
      }

      await db.insert(users).values({
        clerkId: id,
        email,
        name,
      });

      console.log("User created successfully:", id);
      return new Response("User created", { status: 200 });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error: Failed to create user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

    if (!email) {
      console.error("Webhook user.updated: No email found for user", id);
      return new Response("Error: No email found", { status: 400 });
    }

    try {
      await db
        .update(users)
        .set({ email, name, updatedAt: new Date() })
        .where(eq(users.clerkId, id));

      console.log("User updated successfully:", id);
      return new Response("User updated", { status: 200 });
    } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Error: Failed to update user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (!id) {
      return new Response("Error: No user id", { status: 400 });
    }

    try {
      await db.delete(users).where(eq(users.clerkId, id));
      console.log("User deleted successfully:", id);
      return new Response("User deleted", { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error: Failed to delete user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}