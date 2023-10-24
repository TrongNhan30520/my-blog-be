import { Category } from 'src/category/Entities/category.entity';

export class UpdatePostDto {
  title: string;

  description: string;

  thumbnail: string;

  status: number;

  category: Category;
}
