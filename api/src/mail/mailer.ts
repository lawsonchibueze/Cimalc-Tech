import { Logger } from "@nestjs/common";

export type MailMessage = { to: string; subject: string; text: string; replyTo?: string };

const logger = new Logger("Mailer");

/**
 * Sends a transactional email through Resend's HTTP API, so no extra
 * dependency is needed. Set RESEND_API_KEY and MAIL_FROM to enable it.
 * Without them the message is written to the server log instead, which keeps
 * local development and password reset usable without a mail account.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    logger.warn(`Email is not configured. Would have sent to ${message.to}\nSubject: ${message.subject}\n${message.text}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, reply_to: message.replyTo }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Mail provider responded with ${response.status}`);
  }
}
