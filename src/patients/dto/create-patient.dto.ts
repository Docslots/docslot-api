import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Nome do paciente',
    minLength: 3,
    maxLength: 100,
    example: 'Maria Oliveira',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Telefone do paciente',
    example: '(11) 99999-8888',
  })
  @IsString()
  phone: string;
}
