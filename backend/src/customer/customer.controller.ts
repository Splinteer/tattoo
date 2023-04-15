import { Controller, Get, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get(':userId')
  public getCustomerCredentials(@Param('userId') userId: string) {
    return this.customerService.getCustomerCredentials(userId);
  }
}
