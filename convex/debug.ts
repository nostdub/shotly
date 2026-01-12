import { query } from "./_generated/server";

export const checkEnv = query({
  args: {},
  handler: async (ctx) => {
    return {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✓ Loaded" : "✗ Missing",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        ? "✓ Loaded"
        : "✗ Missing",
      VITE_CONVEX_URL: process.env.VITE_CONVEX_URL ? "✓ Loaded" : "✗ Missing",
    };
  },
});
