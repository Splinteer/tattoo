import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CredentialsService } from './credentials.service';
import { AuthModule } from '../auth/auth.module';
import { CustomerService } from './customer.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule, AuthModule],
  declarations: [],
  providers: [CredentialsService, CustomerService],
})
export class CustomerModule {}
