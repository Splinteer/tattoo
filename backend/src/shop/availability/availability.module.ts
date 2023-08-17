import { Module } from '@nestjs/common';
import { DefaultAvailabilityController } from './default-availability/default-availability.controller';
import { DefaultAvailabilityService } from './default-availability/default-availability.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  controllers: [DefaultAvailabilityController],
  providers: [DefaultAvailabilityService],
})
export class AvailabilityModule {}
