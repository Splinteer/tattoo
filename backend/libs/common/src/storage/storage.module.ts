import { Bucket, Storage } from '@google-cloud/storage';
import { Module, Provider } from '@nestjs/common';
import * as path from 'path';

const storageProvider: Provider<Bucket> = {
  provide: 'public',
  useFactory: async () => {
    const storage = new Storage({
      keyFilename: path.join('google-service-account-key.json'),
    });

    return storage.bucket('tattoo-public');
  },
};

@Module({
  providers: [storageProvider],
  exports: [storageProvider],
})
export class StorageModule {}
