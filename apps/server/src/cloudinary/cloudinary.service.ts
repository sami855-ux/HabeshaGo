import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      //eslint-disable-next-line
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'nestjs_uploads',
          resource_type: 'auto', // detects image/video/raw automatically
        },
        (
          error: UploadApiErrorResponse | undefined,
          result?: UploadApiResponse,
        ) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Cloudinary upload failed – no result'));

          resolve(result); // TypeScript is now happy
        },
      );

      // This is the correct way to stream the buffer
      Readable.from(file.buffer).pipe(upload);
    });
  }

  // Optional: upload multiple files
  async uploadMultiple(
    files: Express.Multer.File[],
  ): Promise<UploadApiResponse[]> {
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }
}
