import { Module } from "@nestjs/common";
import { ProductsModule } from "../products/products.module.js";
import { CategoriesController } from "./categories.controller.js";
import { AdminCategoriesController } from "./admin-categories.controller.js";
import { CategoriesService } from "./categories.service.js";

@Module({
  imports: [ProductsModule],
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
