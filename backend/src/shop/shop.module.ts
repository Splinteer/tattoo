import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { MemberService } from './member/member.service';
import { MemberController } from './member/member.controller';
import { AuthModule } from '@app/common/auth/auth.module';

@Module({
  imports: [CommonModule, ConfigModule.forRoot()],
  controllers: [ShopController, MemberController],
  providers: [ShopService, MemberService],
})
export class ShopModule {}
