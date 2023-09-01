import { Module, Provider } from '@nestjs/common';
import { StorageService } from './storage.service';

const storageProvider: Provider<StorageService> = {
  provide: 'public',
  useFactory: async () => {
    return new StorageService('tattoo-public');
  },
};

@Module({
  providers: [storageProvider],
  exports: [storageProvider],
})
export class StorageModule {}
