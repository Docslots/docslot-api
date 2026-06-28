import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotsService } from '../src/slots/slots.service';
import { SlotsModule } from '../src/slots/slots.module';
import { DoctorsModule } from '../src/doctors/doctors.module';
import { AppointmentsModule } from '../src/appointments/appointments.module';
import { PatientsModule } from '../src/patients/patients.module';
import { Doctor } from '../src/doctors/doctor.entity';

describe('SlotsService — Teste de Integração (CT-20)', () => {
  let service: SlotsService;
  let module: TestingModule;
  let doctorRepo: Repository<Doctor>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          synchronize: true,
          autoLoadEntities: true,
          retryAttempts: 0,
        }),
        SlotsModule,
        DoctorsModule,
        AppointmentsModule,
        PatientsModule,
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
    doctorRepo = module.get<Repository<Doctor>>(getRepositoryToken(Doctor));
  }, 10000);

  afterAll(async () => {
    await module.close();
  });

  it('[CT-20] Deve rejeitar slot duplicado com ConflictException via banco real', async () => {
    const doctor = await doctorRepo.save(
      doctorRepo.create({ name: 'Dr. Teste', specialty: 'Teste' }),
    );

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateTimeStr = futureDate.toISOString();

    const firstSlot = await service.create(doctor.id, dateTimeStr);
    expect(firstSlot).toBeDefined();
    expect(firstSlot.isBooked).toBe(false);

    await expect(service.create(doctor.id, dateTimeStr)).rejects.toThrow(
      ConflictException,
    );
  });
});
