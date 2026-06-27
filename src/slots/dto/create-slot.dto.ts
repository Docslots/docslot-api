import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty({
    description: 'Data e hora do horário disponível (ISO 8601)',
    format: 'date-time',
    example: '2026-07-15T14:00:00.000Z',
  })
  @IsDateString()
  dateTime: string;
}
