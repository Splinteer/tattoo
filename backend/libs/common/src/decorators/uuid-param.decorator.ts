import {
  applyDecorators,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Param,
  PipeTransform,
} from '@nestjs/common';
import { validate as validateUUID } from 'uuid';

@Injectable()
class UuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!validateUUID(value)) {
      throw new BadRequestException('Invalid UUID');
    }

    return value;
  }
}

export function UUIDParam(property: string) {
  return Param(property, new UuidPipe());
}
