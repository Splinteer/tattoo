import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectPatchBodyDTO {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  customer_rating?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  shop_rating?: number;
}
