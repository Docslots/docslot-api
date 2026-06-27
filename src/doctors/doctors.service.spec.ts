import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { Doctor } from './doctor.entity';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let doctorRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    doctorRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        { provide: getRepositoryToken(Doctor), useValue: doctorRepository },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
  });

  describe('CT-16 — criar médico com sucesso', () => {
    it('deve criar médico com name e specialty', async () => {
      const mockDoctor: Doctor = {
        id: 1,
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        slots: [],
      } as Doctor;

      doctorRepository.create.mockReturnValue(mockDoctor);
      doctorRepository.save.mockResolvedValue(mockDoctor);

      const result = await service.create({ name: 'Dr. João Silva', specialty: 'Cardiologia' });

      expect(result.name).toBe('Dr. João Silva');
      expect(result.specialty).toBe('Cardiologia');
      expect(doctorRepository.create).toHaveBeenCalledWith({
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
      });
    });
  });

  describe('CT-17 — buscar médico por ID', () => {
    it('deve retornar médico quando encontrado', async () => {
      const mockDoctor: Doctor = {
        id: 1,
        name: 'Dr. João Silva',
        specialty: 'Cardiologia',
        slots: [],
      } as Doctor;

      doctorRepository.findOne.mockResolvedValue(mockDoctor);

      const result = await service.findOne(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
    });

    it('deve retornar null quando médico não existe', async () => {
      doctorRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});
