import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDTO {
  @IsString()
  @IsNotEmpty()
  chat_id: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
