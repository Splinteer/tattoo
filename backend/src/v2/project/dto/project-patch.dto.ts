import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum ProjectState {
  PAID = 'paid',
}

export class ProjectPatchDTO {
  @ApiProperty()
  @IsOptional()
  @IsEnum(ProjectState)
  state?: ProjectState;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  customer_rating?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  shop_rating?: number;
}
