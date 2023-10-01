import { Module } from '@nestjs/common';
import { ProjectFlashController } from './project-flash.controller';
import { ProjectFlashService } from './project-flash.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectSchema } from '../project.entity';
import { ProjectFlashSchema } from './project-flash.entity';
import { FlashSchema } from 'src/v2/flash/flash.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectSchema, ProjectFlashSchema, FlashSchema]),
  ],
  controllers: [ProjectFlashController],
  providers: [ProjectFlashService],
})
export class ProjectFlashModule {}
