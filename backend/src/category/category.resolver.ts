import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Category } from './dto/category.object';
import { CategoryService } from './category.service';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/auth.guard';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(() => [Category], { name: 'categories' })
  async getCategories() {
    return this.categoryService.findAll();
  }

  @Query(() => Category, { name: 'category', nullable: true })
  async getCategory(@Args('id', { type: () => ID }) id: string) {
    return this.categoryService.findOne(id);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  whoAmI(@CurrentUser() user: { supabaseId: string; email: string }) {
    return `You are: ${user.email} (Supabase ID: ${user.supabaseId})`;
  }
}
