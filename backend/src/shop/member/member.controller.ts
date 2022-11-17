import { Body, Controller, Post } from '@nestjs/common';
import { MemberService, MemberType } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Post('create')
  create(
    @Body('customer_id') customer_id: string,
    @Body('type') type: MemberType,
    @Body('can_read_message') can_read_message: boolean,
    @Body('can_write_message') can_write_message: boolean,
  ) {
    return this.memberService.create(
      customer_id,
      type,
      can_read_message,
      can_write_message,
    );
  }

  @Post('updateCanReadMessage')
  updateCanReadMessage(
    @Body('customer_id') customer_id: string,
    @Body('can_read_message') can_read_message: boolean,
  ) {
    return this.memberService.updateCanReadMessage(
      customer_id,
      can_read_message,
    );
  }

  @Post('updateCanWriteMessage')
  updateCanWriteMessage(
    @Body('customer_id') customer_id: string,
    @Body('can_write_message') can_write_message: boolean,
  ) {
    return this.memberService.updateCanWriteMessage(
      customer_id,
      can_write_message,
    );
  }
}
