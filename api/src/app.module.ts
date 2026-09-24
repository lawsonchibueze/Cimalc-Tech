import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AdminModule } from './admin/admin.module.js';
import { auth } from './auth/auth.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CategoriesModule } from './categories/categories.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { UsersModule } from './users/users.module.js';
import { QuotesModule } from './quotes/quotes.module.js';
import { ContactModule } from './contact/contact.module.js';

@Module({
  imports: [PrismaModule, AuthModule.forRoot({ auth }), UsersModule, CategoriesModule, ProductsModule, AdminModule, QuotesModule, ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
