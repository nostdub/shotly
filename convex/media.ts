import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyMedia = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const media = await ctx.db
      .query("media")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return media;
  },
});

export const insertMedia = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("product_upload"),
      v.literal("style_upload"),
      v.literal("generated")
    ),
    mimeType: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    sizeBytes: v.optional(v.number()),
    urls: v.object({
      full: v.string(),
      small: v.string(),
      preview: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const doc = {
      userId: userId ?? "anonymous",
      name: args.name,
      type: args.type,
      mimeType: args.mimeType,
      width: args.width,
      height: args.height,
      sizeBytes: args.sizeBytes,
      urls: args.urls,
    };
    const id = await ctx.db.insert("media", doc);
    return id;
  },
});

// Get all product media for user
export const getProductImages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const media = await ctx.db
      .query("media")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), "product_upload"))
      .order("desc")
      .collect();
    return media;
  },
});

// Get product media for user - paginated by cursor (ID-based)
export const getProductImagesPaginated = query({
  args: { limit: v.number(), cursor: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const allMedia = await ctx.db
      .query("media")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let productMedia = allMedia
      .filter((m) => m.type === "product_upload")
      .sort((a, b) => b._creationTime - a._creationTime);

    // Si cursor fourni, skip jusqu'au cursor (exclusif)
    if (args.cursor) {
      const cursorIndex = productMedia.findIndex((p) => p._id === args.cursor);
      if (cursorIndex >= 0) {
        productMedia = productMedia.slice(cursorIndex + 1);
      }
    }

    return productMedia.slice(0, args.limit);
  },
});

// Get all style media for user
export const getStyleImages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const media = await ctx.db
      .query("media")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), "style_upload"))
      .order("desc")
      .collect();
    return media;
  },
});

// Get all generated media for user
export const getGeneratedImages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const media = await ctx.db
      .query("media")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), "generated"))
      .order("desc")
      .collect();
    return media;
  },
});
