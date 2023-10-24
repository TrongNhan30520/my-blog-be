import { Post } from 'src/post/Entities/post.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Entity,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'int', default: 1 })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
