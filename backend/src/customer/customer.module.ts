import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [HttpModule, CommonModule, AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
