import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client.js";
import { pageArgs, pageMeta } from "../common/pagination.js";
import { MailService } from "../mail/mail.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ContactQueryDto } from "./dto/contact-query.dto.js";
import { CreateContactDto } from "./dto/create-contact.dto.js";

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateContactDto) {
    const message = await this.prisma.contactMessage.create({
      data: { name: dto.name.trim(), email: dto.email.trim(), message: dto.message.trim() },
    });

    const staff = this.mail.staffAddress;
    if (staff) {
      void this.mail.send({
        to: staff,
        replyTo: message.email,
        subject: `New contact message from ${message.name}`,
        text: `${message.name} <${message.email}> wrote:\n\n${message.message}`,
      });
    }

    return { success: true, message: "Your message has been received." };
  }

  async findAll(query: ContactQueryDto) {
    const where: Prisma.ContactMessageWhereInput =
      query.handled === undefined ? {} : { handledAt: query.handled ? { not: null } : null };

    const [data, total, open] = await Promise.all([
      this.prisma.contactMessage.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "asc" }], ...pageArgs(query) }),
      this.prisma.contactMessage.count({ where }),
      this.prisma.contactMessage.count({ where: { handledAt: null } }),
    ]);

    return { data, meta: { ...pageMeta(query.page, query.limit, total), open } };
  }

  async setHandled(id: string, handled: boolean) {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Message not found");
    return this.prisma.contactMessage.update({ where: { id }, data: { handledAt: handled ? new Date() : null } });
  }
}
