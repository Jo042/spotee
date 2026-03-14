import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Category } from './dto/category.object';
import { CategoryService } from './category.service';

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
}
