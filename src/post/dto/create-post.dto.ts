import { IsNotEmpty } from 'class-validator';
import { Category } from 'src/category/Entities/category.entity';
import { User } from 'src/user/Entities/user.entity';

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  thumbnail: string;

  status: number;

  user: User;

  @IsNotEmpty()
  category: Category;
}
