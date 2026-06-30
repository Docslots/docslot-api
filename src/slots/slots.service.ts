import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './slot.entity';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async create(doctorId: number, dateTime: string): Promise<Slot> {
    const slotDate = new Date(dateTime);

    if (slotDate < new Date()) {
      throw new BadRequestException('Cannot create a slot in the past');
    }

    const existing = await this.slotRepository.findOne({
      where: { doctorId, dateTime: slotDate },
    });
    if (existing) {
      throw new ConflictException('Doctor already has a slot at this date/time');
    }

    const slot = this.slotRepository.create({
      doctorId,
      dateTime: new Date(dateTime),
      isBooked: false,
    });
    return this.slotRepository.save(slot);
  }

  async findByDoctor(doctorId: number, availableOnly?: boolean): Promise<Slot[]> {
    const where: any = { doctorId };
    if (availableOnly === true) {
      where.isBooked = false;
    }
    return this.slotRepository.find({
      where,
      relations: { appointment: true },
      order: { dateTime: 'ASC' },
    });
  }

  findOne(id: number): Promise<Slot | null> {
    return this.slotRepository.findOne({
      where: { id },
      relations: { doctor: true, appointment: true },
    });
  }

  save(slot: Slot): Promise<Slot> {
    return this.slotRepository.save(slot);
  }
}
