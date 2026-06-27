import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { Slot } from '../slots/slot.entity';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let slotRepository: Record<string, jest.Mock>;
  let appointmentRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    slotRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    appointmentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Slot), useValue: slotRepository },
        { provide: getRepositoryToken(Appointment), useValue: appointmentRepository },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  describe('CT-04 — criar consulta em slot disponível', () => {
    it('deve criar appointment com status SCHEDULED e marcar slot como booked', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: futureDate,
        isBooked: false,
        doctor: null,
        appointment: null,
      } as Slot;

      const mockAppointment: Appointment = {
        id: 1,
        slotId: 1,
        patientId: 1,
        status: AppointmentStatus.SCHEDULED,
        createdAt: new Date(),
        slot: mockSlot,
        patient: null,
      } as Appointment;

      slotRepository.findOne.mockResolvedValue(mockSlot);
      slotRepository.save.mockResolvedValue({ ...mockSlot, isBooked: true });
      appointmentRepository.create.mockReturnValue(mockAppointment);
      appointmentRepository.save.mockResolvedValue(mockAppointment);

      const result = await service.create({ slotId: 1, patientId: 1 });

      expect(result.status).toBe(AppointmentStatus.SCHEDULED);
      expect(slotRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isBooked: true }),
      );
    });
  });

  describe('CT-05 — rejeitar agendamento em slot já ocupado', () => {
    it('deve lançar ConflictException quando slot já está bookado', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: futureDate,
        isBooked: true,
        doctor: null,
        appointment: null,
      } as Slot;

      slotRepository.findOne.mockResolvedValue(mockSlot);

      await expect(
        service.create({ slotId: 1, patientId: 1 }),
      ).rejects.toThrow(ConflictException);

      expect(appointmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CT-06 — rejeitar agendamento em horário no passado', () => {
    it('deve lançar BadRequestException quando slot está no passado', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: pastDate,
        isBooked: false,
        doctor: null,
        appointment: null,
      } as Slot;

      slotRepository.findOne.mockResolvedValue(mockSlot);

      await expect(
        service.create({ slotId: 1, patientId: 1 }),
      ).rejects.toThrow(BadRequestException);

      expect(appointmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CT-07 — cancelar consulta com sucesso', () => {
    it('deve mudar status para CANCELLED e liberar o slot', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: futureDate,
        isBooked: true,
        doctor: null,
        appointment: null,
      } as Slot;

      const mockAppointment: Appointment = {
        id: 1,
        slotId: 1,
        patientId: 1,
        status: AppointmentStatus.SCHEDULED,
        createdAt: new Date(),
        slot: mockSlot,
        patient: null,
      } as Appointment;

      appointmentRepository.findOne.mockResolvedValue(mockAppointment);
      slotRepository.save.mockResolvedValue({ ...mockSlot, isBooked: false });
      appointmentRepository.save.mockResolvedValue({
        ...mockAppointment,
        status: AppointmentStatus.CANCELLED,
      });

      const result = await service.cancel(1);

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(slotRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isBooked: false }),
      );
    });
  });

  describe('CT-08 — rejeitar cancelamento de consulta no passado', () => {
    it('deve lançar BadRequestException quando o horário já passou', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: pastDate,
        isBooked: true,
        doctor: null,
        appointment: null,
      } as Slot;

      const mockAppointment: Appointment = {
        id: 1,
        slotId: 1,
        patientId: 1,
        status: AppointmentStatus.SCHEDULED,
        createdAt: new Date(),
        slot: mockSlot,
        patient: null,
      } as Appointment;

      appointmentRepository.findOne.mockResolvedValue(mockAppointment);

      await expect(service.cancel(1)).rejects.toThrow(BadRequestException);

      expect(appointmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CT-09 — rejeitar cancelamento de consulta inexistente', () => {
    it('deve lançar NotFoundException quando appointment não existe', async () => {
      appointmentRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel(999)).rejects.toThrow(NotFoundException);

      expect(slotRepository.save).not.toHaveBeenCalled();
      expect(appointmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CT-10 — rejeitar criação com slot inexistente', () => {
    it('deve lançar NotFoundException quando slot não existe', async () => {
      slotRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ slotId: 999, patientId: 1 }),
      ).rejects.toThrow(NotFoundException);

      expect(appointmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CT-11 — listar consultas por paciente', () => {
    it('deve retornar as consultas de um paciente', async () => {
      const mockAppointments: Appointment[] = [
        { id: 1, slotId: 1, patientId: 1, status: AppointmentStatus.SCHEDULED, createdAt: new Date(), slot: null, patient: null } as Appointment,
        { id: 2, slotId: 2, patientId: 1, status: AppointmentStatus.CANCELLED, createdAt: new Date(), slot: null, patient: null } as Appointment,
      ];

      appointmentRepository.find.mockResolvedValue(mockAppointments);

      const result = await service.findByPatient(1);

      expect(result).toHaveLength(2);
      expect(appointmentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { patientId: 1 } }),
      );
    });
  });
});
