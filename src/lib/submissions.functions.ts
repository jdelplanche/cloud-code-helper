import { createServerFn } from "@tanstack/react-start";
import {
  contactMessageSchema,
  getAdmin,
  infraRequestSchema,
  makeTicket,
} from "./submissions.server";

export const submitInfraRequest = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => infraRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const ticket = makeTicket();

    const { error } = await admin.from("infra_requests").insert({
      ticket,
      locale: data.locale,
      org: data.org,
      domain: data.domain,
      stack: data.stack,
      account_status: data.account,
      contact_email: data.email,
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);

    const { count } = await admin
      .from("infra_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    const { sendDeskMail } = await import("./mailer.server");
    const { infraRequestEmail } = await import("./mail-templates.server");
    const mail = infraRequestEmail({ ...data, ticket, notes: data.notes || undefined });
    await sendDeskMail({
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: data.email,
    });

    return { ticket, queue: count ?? 1 };
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactMessageSchema.parse(data))
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const { error } = await admin.from("contact_messages").insert({
      locale: data.locale,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error(error.message);

    const { sendDeskMail } = await import("./mailer.server");
    const { contactEmail } = await import("./mail-templates.server");
    const mail = contactEmail(data);
    await sendDeskMail({
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      replyTo: data.email,
    });

    return { received: true };
  });

export const getSystemStatus = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await getAdmin();
  const started = Date.now();
  const { error } = await admin.from("infra_requests").select("id", { count: "exact", head: true });
  const latency = Date.now() - started;

  return {
    operational: !error,
    latencyMs: latency,
    region: "Genève — CH (Tier 3+)",
    checkedAt: new Date().toISOString(),
  };
});
