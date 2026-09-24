import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";
import { AdminProductsQueryDto } from "./dto/products-query.dto.js";
import { ProductsService } from "./products.service.js";

@Roles(["ADMIN"])
@Controller("admin/products")
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: AdminProductsQueryDto) {
    return this.productsService.findAdmin(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findAdminById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }
}
