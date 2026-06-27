import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { Slot } from './slot.entity';

@ApiTags('Slots')
@Controller('doctors/:doctorId/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um slot de horário disponível para um médico' })
  @ApiParam({ name: 'doctorId', description: 'ID do médico', example: 1 })
  @ApiResponse({ status: 201, description: 'Slot criado com sucesso', type: Slot })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Médico já possui slot nesse horário' })
  create(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() createSlotDto: CreateSlotDto,
  ) {
    return this.slotsService.create(doctorId, createSlotDto.dateTime);
  }

  @Get()
  @ApiOperation({ summary: 'Listar slots de horário de um médico' })
  @ApiParam({ name: 'doctorId', description: 'ID do médico', example: 1 })
  @ApiQuery({ name: 'available', required: false, description: 'Filtrar apenas slots disponíveis (true/false)', example: 'true' })
  @ApiResponse({ status: 200, description: 'Lista de slots', type: [Slot] })
  findAll(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('available') available?: string,
  ) {
    const availableOnly = available === 'true';
    return this.slotsService.findByDoctor(doctorId, availableOnly);
  }
}
