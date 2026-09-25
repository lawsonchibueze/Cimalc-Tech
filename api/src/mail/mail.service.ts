import { Injectable, Logger } from '@nestjs/common';
import { sendMail, type MailMessage } from './mailer.js';

/** Nest wrapper around the framework independent mailer used by Better Auth. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /** Never throws. Email must not break the request that triggered it. */
  async send(message: MailMessage): Promise<void> {
    try {
      await sendMail(message);
    } catch (error) {
      // Logged as an error, not a warning: a swallowed failure here is exactly
      // what "the customer says no email ever arrived" looks like.
      this.logger.error(
        `Could not send "${message.subject}" to ${message.to}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** Address that receives staff notifications such as new quotes and contact messages. */
  get staffAddress(): string | undefined {
    return process.env.STAFF_NOTIFY_EMAIL?.trim() || undefined;
  }
}
