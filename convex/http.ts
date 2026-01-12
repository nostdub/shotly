import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

// ============ WEBHOOK: REPLICATE CALLBACK ============
export const updateGenerationResult = httpAction(async (ctx, request) => {
  try {
    const payload = await request.json();

    // Replicate webhook payload structure:
    // {
    //   id: "prediction-id",
    //   status: "succeeded" | "failed" | "canceled",
    //   output: ["image_url"] if succeeded,
    //   error: error message if failed
    // }

    const replicateId = payload.id;
    const status = payload.status;
    const imageUrl = payload.output?.[0] || null;
    const error = payload.error || null;

    if (!replicateId) {
      return new Response(JSON.stringify({ error: "Missing prediction id" }), {
        status: 400,
      });
    }

    // TODO download image on own server and use this URL instead

    // Call updateGenerationResult mutation
    await ctx.runMutation(api.generations.updateGenerationResult, {
      replicateId,
      status,
      imageUrl: imageUrl || undefined,
      error: error || undefined,
    });

    return new Response(JSON.stringify({ status: "ok", replicateId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
});

// ============ HEALTH CHECK ============
export const healthCheck = httpAction(async (ctx, request) => {
  return new Response(
    JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});

// ============ ROUTER SETUP ============
const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/updateGenerationResult",
  method: "POST",
  handler: updateGenerationResult,
});

http.route({
  path: "/health",
  method: "GET",
  handler: healthCheck,
});

export default http;
