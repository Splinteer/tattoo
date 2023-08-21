import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
