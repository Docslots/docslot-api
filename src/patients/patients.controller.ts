import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { AppointmentsService } from '../appointments/appointments.service';
import { Patient } from './patient.entity';
import { Appointment } from '../appointments/appointment.entity';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente cadastrado com sucesso', type: Patient })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiParam({ name: 'id', description: 'ID do paciente', example: 1 })
  @ApiResponse({ status: 200, description: 'Paciente encontrado', type: Patient })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findOne(id);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Listar consultas de um paciente' })
  @ApiParam({ name: 'id', description: 'ID do paciente', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de consultas do paciente', type: [Appointment] })
  findAppointments(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findByPatient(id);
  }
}
