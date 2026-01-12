import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============ GET GENERATION BY ID ============
export const getGeneration = query({
  args: { generationId: v.id("generations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.generationId);
  },
});

// ============ GET ALL GENERATIONS FOR CURRENT USER ============
export const getMyGenerations = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("generations")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// ============ UPDATE GENERATION RESULT (from Replicate webhook) ============
export const updateGenerationResult = mutation({
  args: {
    replicateId: v.string(),
    status: v.string(),
    imageUrl: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find generation by replicateId
    const generations = await ctx.db
      .query("generations")
      .filter((q) => q.eq(q.field("replicateId"), args.replicateId))
      .collect();

    if (generations.length === 0) {
      throw new Error(
        `Generation with replicateId ${args.replicateId} not found`
      );
    }

    const generation = generations[0];

    // If succeeded, create media record
    let mediaId: string | undefined;
    if (args.status === "succeeded" && args.imageUrl) {
      mediaId = await ctx.db.insert("media", {
        userId: generation.userId,
        name: `Generated - ${generation.aspectRatio}`,
        type: "generated",
        urls: {
          full: args.imageUrl,
          small: args.imageUrl,
          preview: args.imageUrl,
        },
        createdAt: Date.now(),
      });
    }

    // Update generation record
    await ctx.db.patch(generation._id, {
      status: args.status,
      mediaId: mediaId,
      error: args.error,
    });

    return generation._id;
  },
});

// ============ CREATE GENERATION ============
export const createGeneration = mutation({
  args: {
    userId: v.string(),
    productId: v.id("media"),
    styleId: v.id("styleLibrary"),
    aspectRatio: v.string(),
    prompt: v.optional(v.string()),
    replicateId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generations", {
      userId: args.userId,
      productId: args.productId,
      styleId: args.styleId,
      aspectRatio: args.aspectRatio,
      prompt: args.prompt,
      replicateId: args.replicateId,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

// ============ GET MEDIA BY ID ============
export const getMediaById = query({
  args: { mediaId: v.id("media") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mediaId);
  },
});

// ============ GET STYLE BY ID ============
export const getStyleById = query({
  args: { styleId: v.id("styleLibrary") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.styleId);
  },
});

// ============ GENERATE IMAGE ASYNC (launch Replicate prediction) ============
export const generateImageAsync = action({
  args: {
    productId: v.id("media"),
    styleId: v.id("styleLibrary"),
    aspectRatio: v.string(),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get product and style from DB
    const product = await ctx.runQuery(api.generations.getMediaById, {
      mediaId: args.productId,
    });
    const style = await ctx.runQuery(api.generations.getStyleById, {
      styleId: args.styleId,
    });

    if (!product || !style) {
      throw new Error("Product or style not found");
    }

    const productUrl: string | undefined =
      product.urls?.full || product.urls?.preview;
    const styleUrl: string | undefined = style.urls?.full || style.urls?.small;

    if (!productUrl || !styleUrl) {
      throw new Error("Product or style missing image URLs");
    }

    // Map aspect ratio to size for Replicate
    const aspectRatioMap: Record<string, { size?: string }> = {
      "9:16": { size: "4K" },
      "3:4": { size: "4K" },
      "1:1": { size: "4K" },
      "4:3": { size: "4K" },
      "16:9": { size: "4K" },
    };

    const sizeConfig = aspectRatioMap[args.aspectRatio] || { size: "4K" };

    try {
      // Call Replicate API
      const replicateToken = process.env.REPLICATE_API_TOKEN;
      if (!replicateToken) {
        throw new Error("REPLICATE_API_TOKEN not configured");
      }

      const response: Response = await fetch(
        "https://api.replicate.com/v1/predictions",
        {
          method: "POST",
          headers: {
            Authorization: `Token ${replicateToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: process.env.SEADREAM_VERSION_ID,
            input: {
              prompt:
                args.prompt ||
                "Get inspiration from the creativity of image b to create a product photography for image a",
              image_input: [productUrl, styleUrl],
              aspect_ratio: args.aspectRatio,
              size: sizeConfig.size || "2K",
            },
          }),
        }
      );

      if (!response.ok) {
        const error = (await response.json()) as Record<string, unknown>;
        throw new Error(
          `Replicate error: ${(error.detail as string | undefined) || response.statusText}`
        );
      }

      const prediction = (await response.json()) as Record<string, unknown>;

      // Create generation record in DB
      const generationId: string = await ctx.runMutation(
        api.generations.createGeneration,
        {
          userId,
          productId: args.productId,
          styleId: args.styleId,
          aspectRatio: args.aspectRatio,
          prompt: args.prompt,
          replicateId: prediction.id,
          status: prediction.status,
        }
      );

      return generationId;
    } catch (error) {
      console.error("Generate image failed:", error);
      throw error;
    }
  },
});
