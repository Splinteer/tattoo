import { Injectable } from '@nestjs/common';
import { FlashSchema } from './flash.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FlashService {
  constructor(
    @InjectRepository(FlashSchema)
    private flashRepository: Repository<FlashSchema>,
  ) {}
}
