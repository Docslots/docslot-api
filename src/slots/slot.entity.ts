import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Doctor } from '../doctors/doctor.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorId: number;

  @Column('datetime')
  dateTime: Date;

  @Column({ default: false })
  isBooked: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.slots)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @OneToOne(() => Appointment, (appointment) => appointment.slot)
  appointment: Appointment;
}
