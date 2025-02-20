import {
  Bucket,
  File,
  GetSignedUrlConfig,
  Storage,
} from '@google-cloud/storage';
import { HttpService } from '@nestjs/axios';
import * as path from 'path';

export class StorageService {
  #bucket: Bucket;

  readonly #storage = new Storage({
    keyFilename: path.join('google-service-account-key.json'),
  });

  constructor(bucketName: string, private readonly http: HttpService) {
    this.#bucket = this.#storage.bucket(bucketName);
  }

  async save(
    path: string,
    file: Express.Multer.File,
    options: { public?: boolean } = { public: true },
  ) {
    const savedFile = this.#bucket.file(path);
    await savedFile.save(file.buffer);
    if (options.public) {
      await savedFile.makePublic();
    }
  }

  async delete(path: string) {
    const file = this.#bucket.file(path);
    await file.delete({ ignoreNotFound: true });
  }

  async getSignedUrl(fileName: string) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    };

    const file = this.#bucket.file(fileName);

    const [url] = await file.getSignedUrl(options);
    return url;
  }
}
