import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all normal style templates (legacy, kept for compatibility)
export const getNormalStyles = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("styleLibrary")
      .collect()
      .then((styles) => styles.filter((s) => s.categories.includes("normal")))
      .then((styles) =>
        styles.sort((a, b) => b._creationTime - a._creationTime)
      );
  },
});

// Get all trending style templates (legacy, kept for compatibility)
export const getTrendingStyles = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("styleLibrary")
      .collect()
      .then((styles) => styles.filter((s) => s.categories.includes("trending")))
      .then((styles) =>
        styles.sort((a, b) => b._creationTime - a._creationTime)
      );
  },
});

// Get normal styles paginated (cursor-based with Convex)
export const getNormalStylesPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("styleLibrary")
      .withIndex("by_styleId")
      .filter((q) => q.neq(q.field("categories"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Get trending styles paginated (cursor-based with Convex)
export const getTrendingStylesPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("styleLibrary")
      .withIndex("by_styleId")
      .filter((q) => q.neq(q.field("categories"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Validate that a style exists (anti-stale-data)
export const validateStyle = query({
  args: { styleId: v.id("styleLibrary") },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    return style ? { exists: true, style } : { exists: false, style: null };
  },
});

// Get user's imported styles
export const getUserStyleUploads = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query("media")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("type"), "style_upload"))
      .order("desc")
      .collect();
  },
});

// Create a new style template (admin only)
export const createStyleTemplate = mutation({
  args: {
    description: v.optional(v.string()),
    categories: v.array(v.union(v.literal("normal"), v.literal("trending"))),
    tags: v.array(v.string()),
    urls: v.object({
      full: v.string(),
      small: v.string(),
      preview: v.string(),
    }),
    width: v.number(),
    height: v.number(),
    fileHash: v.string(), // SHA-256 hash to detect duplicates
  },
  handler: async (ctx, args) => {
    // Optional: Add admin check here
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate unique styleId (e.g., "style-1704753600000")
    const styleId = `style-${Date.now()}`;

    return await ctx.db.insert("styleLibrary", {
      styleId,
      fileHash: args.fileHash,
      description: args.description,
      categories: args.categories,
      tags: args.tags,
      urls: args.urls,
      width: args.width,
      height: args.height,
      mimeType: "image/webp",
    });
  },
});
