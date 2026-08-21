/**
 * Backend-resilience laag.
 *
 * Mislukte bezorgingen (kChat-webhook of SMTP) worden geregistreerd in
 * `failed_tasks` met UITSLUITEND technische velden: task_type, error_code en
 * een payload_reference (`contact_messages:<uuid>`). Geen naam, e-mail of
 * berichtinhoud — die staan al in de brontabel en worden bij een retry
 * server-side opnieuw opgehaald.
 *
 * Logging beperkt zich tot systeem-events, nooit gebruikersdata.
 */

export const MAX_ATTEMPTS = 3;

export type TaskType = "kchat_webhook" | "smtp_email";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function recordFailedTask(
  taskType: TaskType,
  payloadReference: string,
  errorCode: string,
) {
  try {
    const db = await admin();
    const { data: existing } = await db
      .from("failed_tasks")
      .select("id, attempts")
      .eq("task_type", taskType)
      .eq("payload_reference", payloadReference)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      const attempts = existing.attempts + 1;
      await db
        .from("failed_tasks")
        .update({
          attempts,
          error_code: errorCode,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: attempts >= MAX_ATTEMPTS ? "abandoned" : "pending",
        })
        .eq("id", existing.id);
      console.warn(`[system] task_retry_failed type=${taskType} attempts=${attempts}`);
      return;
    }

    await db.from("failed_tasks").insert({
      task_type: taskType,
      payload_reference: payloadReference,
      error_code: errorCode,
    });
    console.warn(`[system] task_failed type=${taskType} code=${errorCode}`);
  } catch {
    console.error("[system] task_registry_unavailable");
  }
}

export async function resolveTask(taskType: TaskType, payloadReference: string) {
  try {
    const db = await admin();
    await db
      .from("failed_tasks")
      .update({ status: "resolved", updated_at: new Date().toISOString() })
      .eq("task_type", taskType)
      .eq("payload_reference", payloadReference)
      .eq("status", "pending");
  } catch {
    console.error("[system] task_registry_unavailable");
  }
}

/** Verstuurt één taak opnieuw op basis van de referentie. */
async function replay(taskType: TaskType, payloadReference: string): Promise<boolean> {
  const [table, id] = payloadReference.split(":");
  if (table !== "contact_messages" || !id) return false;

  const db = await admin();
  const { data: row } = await db
    .from("contact_messages")
    .select("name, email, subject, message, locale")
    .eq("id", id)
    .maybeSingle();
  if (!row) return false;

  if (taskType === "smtp_email") {
    const { sendDeskMail } = await import("./mailer.server");
    const { contactEmail } = await import("./mail-templates.server");
    const mail = contactEmail(row);
    const result = await sendDeskMail({
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: row.email,
    });
    return result.sent;
  }

  const { sendChatNotification } = await import("./kchat.server");
  return (await sendChatNotification(row)).sent;
}

/**
 * Verwerkt openstaande taken (max. 3 pogingen per taak).
 * Wordt opportunistisch aangeroepen na elke inzending én door de cron-route.
 */
export async function retryPendingTasks(limit = 10) {
  let processed = 0;
  let recovered = 0;
  try {
    const db = await admin();
    const { data: tasks } = await db
      .from("failed_tasks")
      .select("id, task_type, payload_reference, attempts")
      .eq("status", "pending")
      .lt("attempts", MAX_ATTEMPTS)
      .order("last_attempt_at", { ascending: true })
      .limit(limit);

    for (const task of tasks ?? []) {
      processed += 1;
      const ok = await replay(task.task_type as TaskType, task.payload_reference);
      const attempts = task.attempts + 1;
      if (ok) {
        recovered += 1;
        console.log(`[system] retry_success type=${task.task_type} attempts=${attempts}`);
        await db
          .from("failed_tasks")
          .update({
            status: "resolved",
            attempts,
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id);
      } else {
        console.warn(`[system] retry_failed type=${task.task_type} attempts=${attempts}`);
        await db
          .from("failed_tasks")
          .update({
            attempts,
            status: attempts >= MAX_ATTEMPTS ? "abandoned" : "pending",
            last_attempt_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id);
      }
    }
  } catch {
    console.error("[system] retry_sweep_unavailable");
  }
  return { processed, recovered };
}
