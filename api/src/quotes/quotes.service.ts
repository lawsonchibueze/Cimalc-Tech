import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  Prisma,
  ProductStatus,
  QuoteStatus,
} from '../generated/prisma/client.js';
import { getAllowedOrigins } from '../common/origins.js';
import { pageArgs, pageMeta } from '../common/pagination.js';
import { isUniqueViolation } from '../common/prisma-errors.js';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AdminQuotesQueryDto } from './dto/admin-quotes-query.dto.js';
import { CreateQuoteDto } from './dto/create-quote.dto.js';
import { CreateQuoteMessageDto } from './dto/create-quote-message.dto.js';
import { RespondToQuoteDto } from './dto/respond-to-quote.dto.js';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto.js';

const include = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          images: {
            orderBy: { position: 'asc' },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  },
  messages: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.QuoteInclude;

type QuoteWithRelations = Prisma.QuoteGetPayload<{ include: typeof include }>;

/** The parts of a signed in user this service needs. */
export type Viewer = { id: string; email: string; emailVerified: boolean };

const CANCELLABLE: QuoteStatus[] = [QuoteStatus.PENDING, QuoteStatus.REVIEWING];
const CLOSED: QuoteStatus[] = [QuoteStatus.CANCELLED, QuoteStatus.EXPIRED];

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: 'received',
  REVIEWING: 'being reviewed',
  QUOTED: 'answered with a quote',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

@Injectable()
export class QuotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(dto: CreateQuoteDto, viewer?: Viewer) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: ProductStatus.PUBLISHED },
      select: { id: true, name: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const quote = await this.createWithReference({
      customerName: dto.customerName.trim(),
      email: dto.email.trim(),
      phone: dto.phone?.trim() || null,
      message: dto.message?.trim() || null,
      userId: viewer?.id ?? null,
      items: { create: { productId: product.id, quantity: dto.quantity } },
    });

    void this.mail.send({
      to: quote.email,
      subject: `We received your quote request ${quote.reference}`,
      text: `Hello ${quote.customerName},\n\nThanks for asking about ${product.name} (quantity ${dto.quantity}). Our team will review your request and reply with a quote.\n\nYour reference is ${quote.reference}.`,
    });
    if (this.mail.staffAddress) {
      void this.mail.send({
        to: this.mail.staffAddress,
        replyTo: quote.email,
        subject: `New quote request ${quote.reference}`,
        text: `${quote.customerName} <${quote.email}> asked for ${dto.quantity} x ${product.name}.\n\n${quote.message ?? 'No message.'}\n\n${this.adminLink(quote.id)}`,
      });
    }

    return this.present(quote);
  }

  async findMine(viewer: Viewer) {
    const quotes = await this.prisma.quote.findMany({
      where: this.ownedBy(viewer),
      include,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
    return quotes.map((quote) => this.present(quote));
  }

  async findMineById(viewer: Viewer, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, ...this.ownedBy(viewer) },
      include,
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return this.present(quote);
  }

  async cancel(viewer: Viewer, id: string) {
    const quote = await this.findMineById(viewer, id);
    if (!CANCELLABLE.includes(quote.status)) {
      throw new ConflictException(
        'This quote can no longer be cancelled. Send us a message instead.',
      );
    }
    const updated = await this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.CANCELLED, cancelledAt: new Date() },
      include,
    });
    return this.present(updated);
  }

  async addMessage(viewer: Viewer, id: string, dto: CreateQuoteMessageDto) {
    const quote = await this.findMineById(viewer, id);
    if (CLOSED.includes(quote.status)) {
      throw new ConflictException(
        'This quote is closed. Start a new request to continue.',
      );
    }
    await this.prisma.quoteMessage.create({
      data: {
        quoteId: id,
        userId: viewer.id,
        body: dto.body.trim(),
        fromStaff: false,
      },
    });

    if (this.mail.staffAddress) {
      void this.mail.send({
        to: this.mail.staffAddress,
        replyTo: quote.customer.email,
        subject: `New message on quote ${quote.reference}`,
        text: `${quote.customer.name} wrote:\n\n${dto.body}\n\n${this.adminLink(id)}`,
      });
    }
    return this.findMineById(viewer, id);
  }

  async findAdmin(query: AdminQuotesQueryDto) {
    const where: Prisma.QuoteWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { reference: { contains: query.search, mode: 'insensitive' } },
              { customerName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [quotes, total, grouped] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        ...pageArgs(query),
      }),
      this.prisma.quote.count({ where }),
      this.prisma.quote.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const counts = Object.fromEntries(
      grouped.map((group) => [group.status, group._count._all]),
    );
    return {
      data: quotes.map((quote) => this.present(quote)),
      meta: { ...pageMeta(query.page, query.limit, total), counts },
    };
  }

  async findAdminById(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include,
    });
    if (!quote) throw new NotFoundException('Quote not found');
    return this.present(quote);
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    const existing = await this.findAdminById(id);
    if (
      existing.status === QuoteStatus.CANCELLED &&
      dto.status !== QuoteStatus.CANCELLED
    ) {
      throw new ConflictException(
        'The customer cancelled this quote, so its status can no longer change.',
      );
    }
    if (existing.status === dto.status) return existing;

    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        status: dto.status,
        cancelledAt: dto.status === QuoteStatus.CANCELLED ? new Date() : null,
      },
      include,
    });

    if (
      dto.status !== QuoteStatus.PENDING &&
      dto.status !== QuoteStatus.CANCELLED
    ) {
      void this.mail.send({
        to: updated.email,
        subject: `Your quote request ${updated.reference} is ${STATUS_LABELS[dto.status]}`,
        text: `Hello ${updated.customerName},\n\nYour quote request ${updated.reference} is now ${STATUS_LABELS[dto.status]}.\n\nReply to this email or contact our team if you have questions.`,
      });
    }
    return this.present(updated);
  }

  /**
   * Records the price and availability staff chose for every product, marks the
   * request as answered, and sends the customer the quote by email. The same
   * numbers show on the customer dashboard because they are stored on the lines.
   */
  async respondToQuote(adminId: string, id: string, dto: RespondToQuoteDto) {
    const existing = await this.findAdminById(id);
    if (existing.status === QuoteStatus.CANCELLED) {
      throw new ConflictException(
        'The customer cancelled this request, so it can no longer be quoted.',
      );
    }

    const lines = new Map(existing.productLines.map((line) => [line.id, line]));
    for (const line of dto.lines) {
      if (!lines.has(line.id))
        throw new NotFoundException(
          'A product on this quote no longer exists.',
        );
    }

    const note = dto.message?.trim();
    const summary = this.quoteSummary(dto.lines, existing.productLines);

    await this.prisma.$transaction([
      ...dto.lines.map((line) =>
        this.prisma.quoteItem.update({
          where: { id: line.id },
          data: { unitPrice: line.unitPrice, availability: line.availability },
        }),
      ),
      this.prisma.quote.update({
        where: { id },
        data: { status: QuoteStatus.QUOTED, cancelledAt: null },
      }),
      this.prisma.quoteMessage.create({
        data: {
          quoteId: id,
          userId: adminId,
          fromStaff: true,
          body: note ? `${summary}\n\n${note}` : summary,
        },
      }),
    ]);

    const updated = await this.findAdminById(id);
    const link = this.accountLink(updated.id);
    void this.mail.send({
      to: updated.customer.email,
      subject: `Your quote for ${updated.reference} is ready`,
      text: `Hello ${updated.customer.name},\n\n${summary}${note ? `\n\n${note}` : ''}${link ? `\n\nView your request online: ${link}` : ''}\n\nCimalc Tech`,
    });
    return updated;
  }

  async addAdminMessage(
    adminId: string,
    id: string,
    dto: CreateQuoteMessageDto,
  ) {
    const quote = await this.findAdminById(id);
    await this.prisma.quoteMessage.create({
      data: {
        quoteId: id,
        userId: adminId,
        body: dto.body.trim(),
        fromStaff: true,
      },
    });

    void this.mail.send({
      to: quote.customer.email,
      subject: `New reply on your quote request ${quote.reference}`,
      text: `Hello ${quote.customer.name},\n\nOur team replied to your quote request ${quote.reference}:\n\n${dto.body}`,
    });
    return this.findAdminById(id);
  }

  /**
   * Quotes the customer owns. A quote requested as a guest carries no user id,
   * so it is matched by email instead. The match deliberately does not require a
   * verified address: email verification is not configured on this site, so
   * requiring it hid a guest's own quote from them the moment they created an
   * account with the same email.
   */
  private ownedBy(viewer: Viewer): Prisma.QuoteWhereInput {
    return {
      OR: [
        { userId: viewer.id },
        {
          userId: null,
          email: { equals: viewer.email, mode: 'insensitive' as const },
        },
      ],
    };
  }

  private async createWithReference(
    data: Omit<Prisma.QuoteUncheckedCreateInput, 'reference'>,
  ) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        return await this.prisma.quote.create({
          data: { ...data, reference: this.makeReference() },
          include,
        });
      } catch (error) {
        if (!isUniqueViolation(error) || attempt === 4) throw error;
      }
    }
    throw new ConflictException(
      'Could not generate a quote reference. Please try again.',
    );
  }

  private makeReference() {
    const now = new Date();
    const day = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
    return `Q-${day}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private adminLink(id: string) {
    const [origin] = getAllowedOrigins();
    return origin ? `Open it: ${origin}/admin/quotes/${id}` : '';
  }

  private accountLink(id: string) {
    const [origin] = getAllowedOrigins();
    return origin ? `${origin}/account/quotes/${id}` : '';
  }

  private money(amount: number) {
    return `NGN ${amount.toLocaleString('en-NG')}`;
  }

  /** A plain text quote that reads well in an email and in the message thread. */
  private quoteSummary(
    lines: RespondToQuoteDto['lines'],
    products: { id: string; quantity: number; product: { name: string } }[],
  ) {
    const byId = new Map(products.map((item) => [item.id, item]));
    const rows = lines.map((line) => {
      const item = byId.get(line.id);
      const availability = line.availability ? 'available' : 'out of stock';
      return `- ${item?.product.name ?? 'Product'} x ${item?.quantity ?? 1}: ${this.money(line.unitPrice)} each (${availability})`;
    });
    const total = lines.reduce(
      (sum, line) => sum + line.unitPrice * (byId.get(line.id)?.quantity ?? 0),
      0,
    );
    return `Quote summary:\n${rows.join('\n')}\n\nEstimated total: ${this.money(total)}`;
  }

  private present(quote: QuoteWithRelations) {
    return {
      id: quote.id,
      reference: quote.reference,
      status: quote.status,
      submittedAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      cancelledAt: quote.cancelledAt,
      message: quote.message,
      customer: {
        name: quote.customerName,
        email: quote.email,
        phone: quote.phone,
      },
      productLines: quote.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        availability: item.availability,
        product: {
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          image: item.product.images[0]?.url ?? null,
        },
      })),
      messages: quote.messages.map((message) => ({
        id: message.id,
        body: message.body,
        createdAt: message.createdAt,
        sender: message.fromStaff ? ('STAFF' as const) : ('CUSTOMER' as const),
      })),
    };
  }
}
