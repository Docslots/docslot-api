import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Slot } from '../slots/slot.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const slot = await this.slotRepository.findOne({
      where: { id: dto.slotId },
      relations: { doctor: true },
    });
    if (!slot) {
      throw new NotFoundException(`Slot with id ${dto.slotId} not found`);
    }

    if (new Date(slot.dateTime) < new Date()) {
      throw new BadRequestException('Cannot book an appointment in the past');
    }

    if (slot.isBooked) {
      throw new ConflictException('Slot is already booked');
    }

    const appointment = this.appointmentRepository.create({
      slotId: dto.slotId,
      patientId: dto.patientId,
      status: AppointmentStatus.SCHEDULED,
    });

    slot.isBooked = true;
    await this.slotRepository.save(slot);

    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: { slot: true },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }

    if (new Date(appointment.slot.dateTime) < new Date()) {
      throw new BadRequestException('Cannot cancel an appointment in the past');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.slot.isBooked = false;
    await this.slotRepository.save(appointment.slot);

    return this.appointmentRepository.save(appointment);
  }

  async findByPatient(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patientId },
      relations: { slot: { doctor: true } },
      order: { createdAt: 'DESC' },
    });
  }
}
