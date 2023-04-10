import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '@app/common';

@Module({
  imports: [HttpModule, CommonModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
