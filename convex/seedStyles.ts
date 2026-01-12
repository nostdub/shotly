import { mutation } from "./_generated/server";
import seedData from "./seed-styles-data.json";

export const seedAllStyles = mutation({
  args: {},
  handler: async (ctx) => {
    const styles = seedData as any;
    let count = 0;
    for (const style of styles) {
      // Vérifier si fileHash existe déjà (détecte vrais duplicates)
      const existingHash = await ctx.db
        .query("styleLibrary")
        .withIndex("by_fileHash", (q) => q.eq("fileHash", style.fileHash))
        .first();

      if (existingHash) {
        console.log(`Skipping ${style.styleId}: duplicate file (hash exists)`);
        continue;
      }

      await ctx.db.insert("styleLibrary", {
        styleId: style.styleId,
        fileHash: style.fileHash,
        categories: style.categories || ["normal"], // Use array
        tags: style.tags,
        urls: style.urls,
        width: style.width,
        height: style.height,
        description: style.description,
        mimeType: "image/webp",
        createdAt: Date.now(),
      });
      count++;
    }
    return { inserted: count };
  },
});
