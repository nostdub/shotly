import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query(async (ctx) => {
  // Use getAuthUserId to get the actual users._id
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  // Fetch the user document from users table
  const user = await ctx.db.get("users", userId);

  if (!user) {
    console.log("User not found for userId:", userId);
    return null;
  }

  console.log(
    "getCurrentUser - found user._id:",
    user._id,
    "email:",
    user.email,
    "image:",
    user.image
  );
  return {
    id: user._id,
    email: user.email || "",
    image: user.image,
    name: user.name,
  };
});

export const syncOrCreateProfile = mutation({
  async handler(ctx) {
    // Get authenticated user ID (stable users._id from Convex Auth)
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      console.log("syncOrCreateProfile: No authenticated user");
      return null;
    }

    // Fetch user data from users table (managed by Convex Auth)
    const user = await ctx.db.get("users", userId);
    if (!user) {
      console.log("syncOrCreateProfile: User not found for userId:", userId);
      return null;
    }

    console.log("syncOrCreateProfile called for userId:", userId);

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      console.log("syncOrCreateProfile: Profile exists for userId:", userId);

      // Only patch if name or email are missing
      if (!existingProfile.name || !existingProfile.email) {
        console.log(
          "syncOrCreateProfile: Patching missing fields for:",
          userId
        );
        await ctx.db.patch(existingProfile._id, {
          name: user.name,
          email: user.email,
        });
      }
      return existingProfile._id;
    }

    // First login: insert new profile with all fields populated
    console.log(
      "syncOrCreateProfile: Inserting new profile for userId:",
      userId
    );
    const newId = await ctx.db.insert("profiles", {
      userId,
      name: user.name,
      email: user.email,
      lastLogin: Date.now(),
    });
    console.log("syncOrCreateProfile: Successfully inserted profile:", newId);
    return newId;
  },
});
