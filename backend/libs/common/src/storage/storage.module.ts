import { Module, Provider } from '@nestjs/common';
import { StorageService } from './storage.service';
import { HttpModule, HttpService } from '@nestjs/axios';

const storageProvider: Provider<StorageService> = {
  provide: 'public',
  inject: [HttpService],
  useFactory: async (http: HttpService) => {
    return new StorageService('tattoo-public', http);
  },
};

@Module({
  imports: [HttpModule],
  providers: [storageProvider],
  exports: [storageProvider],
})
export class StorageModule {}
