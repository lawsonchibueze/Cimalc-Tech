import { Body, Controller, Get, Patch } from "@nestjs/common";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { auth } from "../auth/auth.js";
import { UsersService } from "./users.service.js";
import { UpdateMeDto } from "./dto/update-me.dto.js";

/**
 * Self service profile routes. Changing anyone else, or any role, lives in
 * AdminUsersController behind the admin guard.
 */
@Controller("me")
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMe(@Session() session: UserSession<typeof auth>) {
    return this.usersService.getMe(session);
  }

  @Patch()
  updateMe(@Session() session: UserSession<typeof auth>, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(session.user.id, dto);
  }
}
