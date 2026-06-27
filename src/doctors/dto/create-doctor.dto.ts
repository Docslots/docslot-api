import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'Nome do médico',
    minLength: 3,
    maxLength: 100,
    example: 'Dr. João Silva',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Especialidade médica',
    example: 'Cardiologia',
  })
  @IsString()
  specialty: string;
}
