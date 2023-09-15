import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import {
  TransformStringToArray,
  TransformStringToBoolean,
  TransformStringToNumber,
} from '@app/common/custom-transformers';
import { ProjectType } from 'src/project/project.service';

export class BookingDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @TransformStringToArray()
  @IsArray()
  @IsString({
    each: true,
  })
  @IsNotEmpty({
    each: true,
  })
  types: ProjectType[];

  @TransformStringToBoolean()
  @IsBoolean()
  is_first_tattoo: boolean;

  @TransformStringToBoolean()
  @IsBoolean()
  is_cover_up: boolean;

  @TransformStringToBoolean()
  @IsBoolean()
  is_post_operation_or_over_scar: boolean;

  @IsString()
  @IsNotEmpty()
  zone: string;

  @TransformStringToNumber()
  @IsNumber()
  height_cm: number;

  @TransformStringToNumber()
  @IsNumber()
  width_cm: number;

  @IsOptional()
  @IsString()
  additional_information?: string;

  @IsOptional()
  @IsString()
  customer_availability?: string;

  // pour les champs client
  @IsString()
  @IsNotEmpty()
  customer_firstname: string;

  @IsString()
  @IsNotEmpty()
  customer_lastname: string;

  @IsString()
  @IsNotEmpty()
  customer_birthday: string;

  @IsOptional()
  @IsString()
  customer_pronouns?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customer_personal_information?: string;

  @IsString()
  @IsNotEmpty()
  customer_address: string;

  @IsOptional()
  @IsString()
  customer_address2?: string;

  @IsString()
  @IsNotEmpty()
  customer_city: string;

  @IsString()
  @IsNotEmpty()
  customer_zipcode: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsOptional()
  @IsString()
  customer_twitter?: string;

  @IsOptional()
  @IsString()
  customer_instagram?: string;

  @IsOptional()
  @TransformStringToArray()
  @IsArray()
  @IsUUID(4, {
    each: true,
  })
  availabilities: string[];

  @IsOptional()
  @TransformStringToArray()
  @IsArray()
  @IsUUID(4, {
    each: true,
  })
  flashs: string[];
}
