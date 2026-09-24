import { Module } from "@nestjs/common";
import { MeController } from "./users.controller.js";
import { AdminUsersController } from "./admin-users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
  controllers: [MeController, AdminUsersController],
  providers: [UsersService],
})
export class UsersModule {}
