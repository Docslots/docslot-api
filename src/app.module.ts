import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { SlotsModule } from './slots/slots.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'docslot.sqlite',
      synchronize: true,
      autoLoadEntities: true,
    }),
    DoctorsModule,
    PatientsModule,
    SlotsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
