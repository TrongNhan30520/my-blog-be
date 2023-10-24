import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { storageConfig } from 'helpers/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { extname } from 'path';
import { PostService } from './post.service';
import { FilterPostDto } from './dto/filter-post.dto';
import { Post as PostEntity } from './Entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UsePipes(ValidationPipe)
  //xử lí file tiền request => luu trữ ảnh lên folder uploads/post
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', 'JPEG'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Access file extension are: ${allowedExtArr.join(
            ', ',
          )}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large. Access file size is less than 5 MB.`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  @UseGuards(AuthGuard)
  create(
    @Req() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.postService.create(req['user_data'].id, {
      ...createPostDto,
      thumbnail: file.destination + '/' + file.filename,
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() query: FilterPostDto): Promise<any> {
    return this.postService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findDetail(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findDetail(Number(id));
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  //xử lí file tiền request => luu trữ ảnh lên folder uploads/post
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', 'JPEG'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Access file extension are: ${allowedExtArr.join(
            ', ',
          )}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large. Access file size is less than 5 MB.`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (file) {
      updatePostDto.thumbnail = file.destination + '/' + file.filename;
    }

    return this.postService.update(Number(id), updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  delete(@Param('id') id: string) {
    return this.postService.delete(Number(id));
  }
}
