import { Post } from 'src/post/Entities/post.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ nullable: true, default: null })
  refresh_token: string;

  @Column({ default: 0 })
  status: number;

  @Column({ nullable: true })
  otp: number;

  @Column({ nullable: true })
  otp_expire_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
