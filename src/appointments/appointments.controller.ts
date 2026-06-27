import { Controller, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './appointment.entity';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Agendar uma consulta' })
  @ApiResponse({ status: 201, description: 'Consulta agendada com sucesso', type: Appointment })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou horário no passado' })
  @ApiResponse({ status: 404, description: 'Slot não encontrado' })
  @ApiResponse({ status: 409, description: 'Slot já está ocupado' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar uma consulta' })
  @ApiParam({ name: 'id', description: 'ID da consulta', example: 1 })
  @ApiResponse({ status: 200, description: 'Consulta cancelada com sucesso', type: Appointment })
  @ApiResponse({ status: 400, description: 'Não é possível cancelar consulta no passado' })
  @ApiResponse({ status: 404, description: 'Consulta não encontrada' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.cancel(id);
  }
}
