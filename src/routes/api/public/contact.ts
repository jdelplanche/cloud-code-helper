import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["en", "nl", "fr"]).default("en"),
  // Honeypot: moet leeg blijven — bots vullen dit in.
  company: z.string().max(200).optional(),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";

        if (rateLimited(ip)) {
          return Response.json({ error: "rate_limited" }, { status: 429 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ error: "invalid_input" }, { status: 400 });
        }

        const { company, ...data } = parsed.data;
        // Honeypot ingevuld → stilzwijgend accepteren, niets doorsturen.
        if (company) return Response.json({ ok: true });

        // 1) Bericht persisteren: dit is de bron van waarheid voor retries.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("contact_messages")
          .insert({
            locale: data.locale,
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
          })
          .select("id")
          .single();

        if (insertError || !inserted) {
          console.error("[system] submission_persist_failed");
          return Response.json({ error: "storage_failed" }, { status: 500 });
        }

        const reference = `contact_messages:${inserted.id}`;
        const { recordFailedTask, resolveTask, retryPendingTasks } =
          await import("@/lib/tasks.server");

        // 2) Beide kanalen parallel: SMTP-mail én kChat-webhook.
        const { sendDeskMail } = await import("@/lib/mailer.server");
        const { contactEmail } = await import("@/lib/mail-templates.server");
        const { sendChatNotification } = await import("@/lib/kchat.server");
        const mail = contactEmail(data);

        const [mailResult, chatResult] = await Promise.all([
          sendDeskMail({
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            replyTo: data.email,
          }),
          sendChatNotification(data),
        ]);

        // 3) Falende kanalen registreren voor de retry-worker.
        if (mailResult.sent) await resolveTask("smtp_email", reference);
        else await recordFailedTask("smtp_email", reference, mailResult.errorCode ?? "unknown");

        if (chatResult.sent) await resolveTask("kchat_webhook", reference);
        else await recordFailedTask("kchat_webhook", reference, chatResult.errorCode ?? "unknown");

        // 4) Opportunistische sweep van oudere openstaande taken.
        void retryPendingTasks(5);

        return Response.json({ ok: true, email: mailResult.sent, chat: chatResult.sent });
      },
    },
  },
});
