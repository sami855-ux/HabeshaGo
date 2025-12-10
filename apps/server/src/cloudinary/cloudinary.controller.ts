import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // expects form-data key: "file"
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const uploaded = await this.cloudinaryService.uploadImage(file);
    console.log('hi');
    return {
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };
  }
}
