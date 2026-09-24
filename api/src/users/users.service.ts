import { BadRequestException, Injectable, Logger, NotFoundException, type OnApplicationBootstrap } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import type { auth } from "../auth/auth.js";
import { Prisma, UserRole } from "../generated/prisma/client.js";
import { pageArgs, pageMeta } from "../common/pagination.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AdminUsersQueryDto } from "./dto/admin-users-query.dto.js";
import { UpdateMeDto } from "./dto/update-me.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates the first administrator. Sign up normally, list the address in
   * ADMIN_EMAILS and restart the API. Only accounts that already exist are
   * promoted, so nobody can claim an address by registering it later.
   */
  async onApplicationBootstrap() {
    const emails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (!emails.length) return;

    const { count } = await this.prisma.user.updateMany({
      where: { email: { in: emails }, role: { not: UserRole.ADMIN } },
      data: { role: UserRole.ADMIN },
    });
    if (count > 0) this.logger.log(`Promoted ${count} user(s) listed in ADMIN_EMAILS to ADMIN`);
  }

  getMe(session: UserSession<typeof auth>) {
    return session.user;
  }

  updateMe(id: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicUserSelect,
    });
  }

  async findAll(query: AdminUsersQueryDto) {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "asc" }], select: publicUserSelect, ...pageArgs(query) }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: pageMeta(query.page, query.limit, total) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async update(actorId: string, id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (actorId === id && dto.role && dto.role !== user.role) {
      throw new BadRequestException("You cannot change your own role. Ask another administrator.");
    }
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: publicUserSelect,
    });
  }
}
