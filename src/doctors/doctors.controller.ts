import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { Doctor } from './doctor.entity';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo médico' })
  @ApiResponse({ status: 201, description: 'Médico cadastrado com sucesso', type: Doctor })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os médicos' })
  @ApiResponse({ status: 200, description: 'Lista de médicos', type: [Doctor] })
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar médico por ID' })
  @ApiParam({ name: 'id', description: 'ID do médico', example: 1 })
  @ApiResponse({ status: 200, description: 'Médico encontrado', type: Doctor })
  @ApiResponse({ status: 404, description: 'Médico não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.findOne(id);
  }
}
