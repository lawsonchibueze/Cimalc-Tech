import { Module } from "@nestjs/common";
import { UploadsModule } from "../uploads/uploads.module.js";
import { ProductsController } from "./products.controller.js";
import { AdminProductsController } from "./admin-products.controller.js";
import { ProductsService } from "./products.service.js";

@Module({
  imports: [UploadsModule],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
