import { Controller, Get } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";
import { AdminService } from "./admin.service.js";

@Roles(["ADMIN"])
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  getStats() {
    return this.adminService.getDashboardStats();
  }
}
