import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID do slot de horário',
    example: 1,
  })
  @IsInt()
  slotId: number;

  @ApiProperty({
    description: 'ID do paciente',
    example: 1,
  })
  @IsInt()
  patientId: number;
}
