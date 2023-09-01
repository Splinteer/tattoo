import { Bucket, Storage } from '@google-cloud/storage';
import { Module, Provider } from '@nestjs/common';
import * as path from 'path';

export class StorageService {
  #bucket: Bucket;

  readonly #storage = new Storage({
    keyFilename: path.join('google-service-account-key.json'),
  });

  constructor(bucketName: string) {
    this.#bucket = this.#storage.bucket(bucketName);
  }

  async save(
    path: string,
    file: Express.Multer.File,
    options: { public?: boolean },
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
}
