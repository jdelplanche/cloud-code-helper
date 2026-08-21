import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron-endpoint voor de retry-worker.
 * Beveiligd met een bearer token uit process.env.CRON_SECRET — zonder dat
 * secret is het endpoint niet bruikbaar. Geeft enkel tellers terug, geen data.
 *
 * Vercel Cron roept het pad met GET aan en zet zelf
 * `Authorization: Bearer $CRON_SECRET`; POST blijft beschikbaar voor
 * handmatige of externe triggers.
 */
async function handle(request: Request) {
  const secret = process.env["CRON_SECRET"];
  if (!secret) {
    console.error("[system] cron_not_configured");
    return new Response("Not configured", { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    console.warn("[system] cron_unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }

  const { retryPendingTasks } = await import("@/lib/tasks.server");
  const result = await retryPendingTasks(25);
  console.log(`[system] retry_sweep processed=${result.processed} recovered=${result.recovered}`);
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/public/tasks/retry")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
