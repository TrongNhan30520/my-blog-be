import { Post } from './Entities/post.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/Entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}
  async create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: userId });

    try {
      const res = await this.postRepository.save({ ...createPostDto, user });
      return await this.postRepository.findOneBy({ id: res.id });
    } catch (error) {
      throw new HttpException("Can't create post", HttpStatus.BAD_REQUEST);
    }
  }
}
