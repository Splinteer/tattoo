import { Module } from '@nestjs/common';
import { DefaultAvailabilityController } from './default-availability/default-availability.controller';
import { DefaultAvailabilityService } from './default-availability/default-availability.service';
import { CommonModule } from '@app/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { ShopService } from '../shop.service';

@Module({
  imports: [CommonModule],
  controllers: [DefaultAvailabilityController, AvailabilityController],
  providers: [DefaultAvailabilityService, AvailabilityService, ShopService],
})
export class AvailabilityModule {}
