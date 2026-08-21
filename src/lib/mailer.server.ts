/**
 * SMTP-verzending.
 *
 * SECURITY: geen enkele credential staat in de broncode. Host, poort,
 * gebruiker en wachtwoord komen uitsluitend uit process.env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *
 * De Cloudflare Worker-runtime heeft geen Node-net-stack voor Nodemailer;
 * `worker-mailer` spreekt SMTP over de TCP-sockets van de worker. De import
 * gebeurt lazy zodat de lokale dev-server (Node) niet breekt.
 */

export type MailPayload = {
  to?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

export type MailResult = { sent: boolean; errorCode?: string };

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
};

function readConfig(): SmtpConfig | null {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? "587");
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!host || !user || !pass || !Number.isFinite(port)) return null;
  return {
    host,
    port,
    user,
    pass,
    from: process.env["MAIL_FROM"] ?? user,
    to: process.env["MAIL_TO"] ?? user,
  };
}

/**
 * Lokale development-mock. Actief zodra MAIL_DEV_MOCK gezet is:
 *   MAIL_DEV_MOCK=1     -> doet alsof de mail vertrokken is
 *   MAIL_DEV_MOCK=fail  -> forceert een fout, zodat de retry-keten
 *                          end-to-end getest kan worden zonder echte SMTP
 * Er wordt nooit ontvanger of inhoud gelogd, enkel het systeem-event.
 */
function devMock(): MailResult | null {
  const mode = process.env["MAIL_DEV_MOCK"];
  if (!mode) return null;
  if (mode === "fail") {
    console.warn("[system] smtp_mock_failed");
    return { sent: false, errorCode: "smtp_failed:mock" };
  }
  console.log("[system] smtp_mock_sent");
  return { sent: true };
}

export async function sendDeskMail(payload: MailPayload): Promise<MailResult> {
  const mocked = devMock();
  if (mocked) return mocked;

  const config = readConfig();
  if (!config) {
    console.error("[system] smtp_not_configured");
    return { sent: false, errorCode: "smtp_not_configured" };
  }

  try {
    const { WorkerMailer } = await import("worker-mailer");
    await WorkerMailer.send(
      {
        credentials: { username: config.user, password: config.pass },
        authType: "plain",
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        startTls: config.port !== 465,
      },
      {
        from: { name: "delplanche.cloud", email: config.from },
        to: payload.to ?? config.to,
        ...(payload.replyTo ? { reply: payload.replyTo } : {}),
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      },
    );
    console.log("[system] smtp_sent");
    return { sent: true };
  } catch (error) {
    // Enkel systeem-events loggen — nooit ontvanger, inhoud of credentials.
    const code = error instanceof Error ? error.name : "unknown_error";
    console.error(`[system] smtp_failed code=${code}`);
    return { sent: false, errorCode: `smtp_failed:${code}` };
  }
}
