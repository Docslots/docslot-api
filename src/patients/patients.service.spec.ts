import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from './patient.entity';

describe('PatientsService', () => {
  let service: PatientsService;
  let patientRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    patientRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: getRepositoryToken(Patient), useValue: patientRepository },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  describe('CT-18 — criar paciente com sucesso', () => {
    it('deve criar paciente com name e phone', async () => {
      const mockPatient: Patient = {
        id: 1,
        name: 'Maria Oliveira',
        phone: '(11) 99999-8888',
        appointments: [],
      } as Patient;

      patientRepository.create.mockReturnValue(mockPatient);
      patientRepository.save.mockResolvedValue(mockPatient);

      const result = await service.create({ name: 'Maria Oliveira', phone: '(11) 99999-8888' });

      expect(result.name).toBe('Maria Oliveira');
      expect(result.phone).toBe('(11) 99999-8888');
      expect(patientRepository.create).toHaveBeenCalledWith({
        name: 'Maria Oliveira',
        phone: '(11) 99999-8888',
      });
    });
  });

  describe('CT-19 — buscar paciente inexistente', () => {
    it('deve lançar NotFoundException quando paciente não existe', async () => {
      patientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('deve retornar paciente quando encontrado', async () => {
      const mockPatient: Patient = {
        id: 1,
        name: 'Maria Oliveira',
        phone: '(11) 99999-8888',
        appointments: [],
      } as Patient;

      patientRepository.findOne.mockResolvedValue(mockPatient);

      const result = await service.findOne(1);

      expect(result).not.toBeNull();
      expect(result.id).toBe(1);
    });
  });
});
