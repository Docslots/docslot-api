import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { Slot } from './slot.entity';

describe('SlotsService', () => {
  let service: SlotsService;
  let slotRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    slotRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SlotsService,
        { provide: getRepositoryToken(Slot), useValue: slotRepository },
      ],
    }).compile();

    service = module.get<SlotsService>(SlotsService);
  });

  describe('CT-12 — criar slot com sucesso', () => {
    it('deve criar slot com isBooked false', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateTimeStr = futureDate.toISOString();

      slotRepository.findOne.mockResolvedValue(null);

      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: futureDate,
        isBooked: false,
        doctor: null,
        appointment: null,
      } as Slot;

      slotRepository.create.mockReturnValue(mockSlot);
      slotRepository.save.mockResolvedValue(mockSlot);

      const result = await service.create(1, dateTimeStr);

      expect(result.isBooked).toBe(false);
      expect(slotRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ doctorId: 1, isBooked: false }),
      );
    });
  });

  describe('CT-13 — rejeitar slot duplicado para mesmo médico', () => {
    it('deve lançar ConflictException quando mesmo horário já existe', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateTimeStr = futureDate.toISOString();

      const existingSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: futureDate,
        isBooked: false,
        doctor: null,
        appointment: null,
      } as Slot;

      slotRepository.findOne.mockResolvedValue(existingSlot);

      await expect(service.create(1, dateTimeStr)).rejects.toThrow(ConflictException);

      expect(slotRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('CT-14 — listar slots com filtro available', () => {
    it('deve retornar apenas slots não bookados quando available=true', async () => {
      const availableSlots: Slot[] = [
        { id: 1, doctorId: 1, dateTime: new Date(), isBooked: false, doctor: null, appointment: null } as Slot,
        { id: 2, doctorId: 1, dateTime: new Date(), isBooked: false, doctor: null, appointment: null } as Slot,
      ];

      slotRepository.find.mockResolvedValue(availableSlots);

      const result = await service.findByDoctor(1, true);

      expect(result).toHaveLength(2);
      expect(slotRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { doctorId: 1, isBooked: false },
        }),
      );
    });

    it('deve retornar todos os slots quando available não for informado', async () => {
      const allSlots: Slot[] = [
        { id: 1, doctorId: 1, dateTime: new Date(), isBooked: false, doctor: null, appointment: null } as Slot,
        { id: 2, doctorId: 1, dateTime: new Date(), isBooked: true, doctor: null, appointment: null } as Slot,
      ];

      slotRepository.find.mockResolvedValue(allSlots);

      const result = await service.findByDoctor(1);

      expect(result).toHaveLength(2);
      expect(slotRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { doctorId: 1 },
        }),
      );
    });
  });

  describe('CT-15 — buscar slot por ID', () => {
    it('deve retornar slot com relations quando encontrado', async () => {
      const mockSlot: Slot = {
        id: 1,
        doctorId: 1,
        dateTime: new Date(),
        isBooked: false,
        doctor: { id: 1, name: 'Dr. João', specialty: 'Cardiologia', slots: [] },
        appointment: null,
      } as unknown as Slot;

      slotRepository.findOne.mockResolvedValue(mockSlot);

      const result = await service.findOne(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.doctor).toBeDefined();
      expect(slotRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          relations: { doctor: true, appointment: true },
        }),
      );
    });

    it('deve retornar null quando slot não existe', async () => {
      slotRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});
