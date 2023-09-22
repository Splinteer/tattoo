import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class ProjectPatchBodyDTO {
  @IsOptional()
  @IsBoolean()
  is_paid?: boolean;

  @IsOptional()
  @IsNumber()
  customer_rating?: number;

  @IsOptional()
  @IsNumber()
  shop_rating?: number;
}
