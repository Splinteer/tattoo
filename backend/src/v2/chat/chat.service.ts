import { Injectable } from '@nestjs/common';
import { ChatSchema } from './chat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSchema)
    private chatRepository: Repository<ChatSchema>,
  ) {}

  async getById(id: string) {
    return this.chatRepository.findOne({
      where: { projectId: id },
      relations: ['project'],
    });
  }
}
