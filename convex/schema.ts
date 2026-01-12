import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  // User profiles - linked to Convex Auth's users table by _id
  profiles: defineTable({
    userId: v.string(), // Reference to users._id from Convex Auth (stable!)
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    // Unix timestamp in milliseconds of last login (optional)
    lastLogin: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // Media table: linked to profiles.userId. Keep simple for now (no internal/external fields).
  media: defineTable({
    userId: v.string(), // links to profiles.userId
    name: v.optional(v.string()),
    type: v.union(
      v.literal("product_upload"),
      v.literal("style_upload"),
      v.literal("generated"),
      v.literal("style_template")
    ), // "product" | "style" | "generated"
    mimeType: v.optional(v.string()),
    // Optional metadata: width/height/size
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    sizeBytes: v.optional(v.number()),
    // URLs for the image variants (full, small, preview)
    urls: v.optional(
      v.object({
        full: v.string(),
        small: v.string(),
        preview: v.string(),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_type", ["type"]),

  // Style Library: Public style templates available to all users
  styleLibrary: defineTable({
    styleId: v.string(), // e.g., "style-001", "style-002" — UNIQUE
    fileHash: v.string(), // SHA-256 hash to detect duplicate images
    description: v.optional(v.string()),
    categories: v.array(v.union(v.literal("normal"), v.literal("trending"))), // Can have multiple
    tags: v.array(v.string()), // e.g., ["minimal", "dark", "colorful"]
    urls: v.object({
      full: v.string(),
      small: v.string(),
      preview: v.string(),
    }),
    width: v.number(),
    height: v.number(),
    mimeType: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_styleId", ["styleId"])
    .index("by_fileHash", ["fileHash"])
    .index("by_createdAt", ["createdAt"]),

  // Generations: Track all generated images
  generations: defineTable({
    userId: v.string(), // links to profiles.userId
    productId: v.string(), // _id of media (product used)
    styleId: v.string(), // _id of styleLibrary (style used)
    aspectRatio: v.string(), // "9:16", "3:4", "1:1", etc.
    prompt: v.optional(v.string()), // Optional text prompt
    replicateId: v.string(), // Replicate prediction ID
    mediaId: v.optional(v.string()), // _id of generated media (set when status="succeeded")
    status: v.string(), // "starting", "processing", "succeeded", "failed", "canceled"
    error: v.optional(v.string()), // Error message if failed
    createdAt: v.number(), // Timestamp
  })
    .index("by_userId", ["userId"])
    .index("by_replicateId", ["replicateId"])
    .index("by_createdAt", ["createdAt"]),
});
