import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsModule } from '../src/doctors/doctors.module';
import { PatientsModule } from '../src/patients/patients.module';
import { SlotsModule } from '../src/slots/slots.module';
import { AppointmentsModule } from '../src/appointments/appointments.module';

describe('DocSlot API (e2e)', () => {
  let app: INestApplication;
  let doctorId: number;
  let patientId: number;
  let slotId: number;
  let appointmentId: number;
  const pastDate = new Date();
  const futureDate = new Date();

  beforeAll(async () => {
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          synchronize: true,
          autoLoadEntities: true,
        }),
        DoctorsModule,
        PatientsModule,
        SlotsModule,
        AppointmentsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Doctors', () => {
    it('E2E-01 POST /doctors — deve cadastrar médico com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/doctors')
        .send({ name: 'Dr. João Silva', specialty: 'Cardiologia' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Dr. João Silva');
      expect(res.body.specialty).toBe('Cardiologia');
      doctorId = res.body.id;
    });

    it('POST /doctors — deve rejeitar nome muito curto', async () => {
      await request(app.getHttpServer())
        .post('/doctors')
        .send({ name: 'AB', specialty: 'Cardiologia' })
        .expect(400);
    });

    it('POST /doctors — deve rejeitar campo extra', async () => {
      await request(app.getHttpServer())
        .post('/doctors')
        .send({ name: 'Dr. Teste', specialty: 'Teste', extra: true })
        .expect(400);
    });

    it('GET /doctors — deve listar médicos', async () => {
      const res = await request(app.getHttpServer())
        .get('/doctors')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /doctors/:id — deve buscar médico por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/doctors/${doctorId}`)
        .expect(200);

      expect(res.body.id).toBe(doctorId);
    });

    it('GET /doctors/:id — deve retornar objeto vazio para ID inexistente', async () => {
      const res = await request(app.getHttpServer())
        .get('/doctors/999')
        .expect(200);

      expect(res.body).toEqual({});
    });
  });

  describe('Patients', () => {
    it('E2E-02 POST /patients — deve cadastrar paciente com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'Maria Oliveira', phone: '(11) 99999-8888' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Maria Oliveira');
      expect(res.body.phone).toBe('(11) 99999-8888');
      patientId = res.body.id;
    });

    it('POST /patients — deve rejeitar nome muito curto', async () => {
      await request(app.getHttpServer())
        .post('/patients')
        .send({ name: 'AB', phone: '(11) 99999-8888' })
        .expect(400);
    });

    it('GET /patients/:id — deve buscar paciente por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .expect(200);

      expect(res.body.id).toBe(patientId);
    });

    it('GET /patients/:id — deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/patients/999')
        .expect(404);
    });
  });

  describe('Slots', () => {
    it('E2E-03 POST /doctors/:doctorId/slots — deve criar slot com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post(`/doctors/${doctorId}/slots`)
        .send({ dateTime: futureDate.toISOString() })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.isBooked).toBe(false);
      expect(res.body.doctorId).toBe(doctorId);
      slotId = res.body.id;
    });

    it('E2E-05 POST /doctors/:doctorId/slots — deve rejeitar slot duplicado', async () => {
      await request(app.getHttpServer())
        .post(`/doctors/${doctorId}/slots`)
        .send({ dateTime: futureDate.toISOString() })
        .expect(409);
    });

    it('POST /doctors/:doctorId/slots — deve rejeitar dateTime inválido', async () => {
      await request(app.getHttpServer())
        .post(`/doctors/${doctorId}/slots`)
        .send({ dateTime: 'invalido' })
        .expect(400);
    });

    it('GET /doctors/:doctorId/slots — deve listar slots do médico', async () => {
      const res = await request(app.getHttpServer())
        .get(`/doctors/${doctorId}/slots`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Appointments', () => {
    it('E2E-04 POST /appointments — deve agendar consulta com sucesso', async () => {
      const res = await request(app.getHttpServer())
        .post('/appointments')
        .send({ slotId, patientId })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('SCHEDULED');
      expect(res.body.slotId).toBe(slotId);
      expect(res.body.patientId).toBe(patientId);
      appointmentId = res.body.id;
    });

    it('E2E-06 POST /appointments — deve rejeitar slot já ocupado', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .send({ slotId, patientId })
        .expect(409);
    });

    it('POST /appointments — deve rejeitar slot inexistente', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .send({ slotId: 999, patientId })
        .expect(404);
    });

    it('E2E-07 POST /appointments — deve rejeitar slot no passado', async () => {
      const pastSlotRes = await request(app.getHttpServer())
        .post(`/doctors/${doctorId}/slots`)
        .send({ dateTime: pastDate.toISOString() })
        .expect(201);

      await request(app.getHttpServer())
        .post('/appointments')
        .send({ slotId: pastSlotRes.body.id, patientId })
        .expect(400);
    });

    it('E2E-08 PATCH /appointments/:id/cancel — deve cancelar consulta', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}/cancel`)
        .expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });

    it('PATCH /appointments/:id/cancel — deve rejeitar consulta inexistente', async () => {
      await request(app.getHttpServer())
        .patch('/appointments/999/cancel')
        .expect(404);
    });
  });

  describe('Listagem com filtros', () => {
    it('E2E-10 GET /doctors/:doctorId/slots?available=true — deve listar só slots disponíveis', async () => {
      const res = await request(app.getHttpServer())
        .get(`/doctors/${doctorId}/slots?available=true`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      for (const slot of res.body) {
        expect(slot.isBooked).toBe(false);
      }
    });

    it('E2E-11 GET /patients/:id/appointments — deve listar consultas do paciente', async () => {
      const res = await request(app.getHttpServer())
        .get(`/patients/${patientId}/appointments`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const cancelled = res.body.find((a: any) => a.id === appointmentId);
      expect(cancelled).toBeDefined();
      expect(cancelled.status).toBe('CANCELLED');
      expect(cancelled.slot).toBeDefined();
      expect(cancelled.slot.doctor).toBeDefined();
    });

    it('GET /patients/:id/appointments — deve retornar array vazio p/ paciente sem consultas', async () => {
      const res = await request(app.getHttpServer())
        .get('/patients/999/appointments')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
