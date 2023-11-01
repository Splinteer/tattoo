import { IsArray, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentProposal {
  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;
}

export class AppointmentsProposalDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentProposal)
  proposals: AppointmentProposal[];
}
