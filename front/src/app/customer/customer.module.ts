import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from './customer.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [],
  providers: [CustomerService],
})
export class CustomerModule {}
