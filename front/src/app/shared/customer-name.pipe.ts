import { Pipe, PipeTransform } from '@angular/core';
import { Customer } from '@app/chatV2/chat.interface';

@Pipe({
  name: 'customerName',
  standalone: true,
})
export class CustomerNamePipe implements PipeTransform {
  transform(customer: Customer): string {
    return `${customer.firstname} ${customer.lastname}`.trim();
  }
}
