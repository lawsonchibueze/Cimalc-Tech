import { Controller, Get, Param, Query } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ProductsQueryDto } from "../products/dto/products-query.dto.js";
import { CategoriesService } from "./categories.service.js";

@AllowAnonymous()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.categoriesService.findOne(slug);
  }

  @Get(":slug/products")
  findProducts(@Param("slug") slug: string, @Query() query: ProductsQueryDto) {
    return this.categoriesService.findProducts(slug, query);
  }
}
