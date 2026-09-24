import { Controller, Get, Param, Query } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ProductsQueryDto } from "./dto/products-query.dto.js";
import { ProductsService } from "./products.service.js";

@AllowAnonymous()
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findPublished(@Query() query: ProductsQueryDto) {
    return this.productsService.findPublished(query);
  }

  @Get("new-arrivals")
  findNewArrivals(@Query() query: ProductsQueryDto) {
    return this.productsService.findNewArrivals(query);
  }

  @Get("featured")
  findFeatured(@Query() query: ProductsQueryDto) {
    return this.productsService.findFeatured(query);
  }

  @Get(":slug/related")
  findRelated(@Param("slug") slug: string, @Query() query: ProductsQueryDto) {
    return this.productsService.findRelated(slug, query);
  }

  @Get(":slug")
  findPublishedBySlug(@Param("slug") slug: string) {
    return this.productsService.findPublishedBySlug(slug);
  }
}
