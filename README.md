# DocSlot-Backend

Sistema de agendamento de consultas médicas — backend NestJS com SQLite.

## Pré-requisitos

- Node.js (LTS)
- npm

## Instalação

```bash
npm install
```

## Executar

```bash
# Desenvolvimento com hot-reload
npm run start:dev

# Produção
npm run build && npm run start:prod
```

A API estará disponível em `http://localhost:3000`.

## Testes

### Executar

```bash
# Testes unitários
npm run test

# Testes end-to-end (HTTP real + banco SQLite em memória)
npm run test:e2e

# Todos os testes
npm run test && npm run test:e2e

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com cobertura
npm run test:cov
```

### Estrutura

**Testes unitários** — ficam ao lado do código-fonte (`*.spec.ts`):

```
src/
├── appointments/
│   └── appointments.service.spec.ts    ← 8 testes
├── slots/
│   └── slots.service.spec.ts           ← 4 testes
├── doctors/
│   └── doctors.service.spec.ts         ← 2 testes
├── patients/
│   └── patients.service.spec.ts        ← 2 testes
```

**Total: 16 testes unitários** — mockam repositórios TypeORM com `jest.fn()`, sem banco real, < 1s.

**Testes end-to-end** — em `test/app.e2e-spec.ts` com banco SQLite em memória:

- 23 testes que exercitam a API HTTP real (supertest)
- Cria módulo NestJS isolado com `:memory:` database
- Cobrem todos os endpoints e regras de negócio

### O que cada teste cobre

| ID | Módulo | Cenário | Regra de Negócio |
|----|--------|---------|------------------|
| CT-04 | Appointments | Criar consulta em slot disponível | RN-01 |
| CT-05 | Appointments | Rejeitar slot já ocupado | RN-01 |
| CT-06 | Appointments | Rejeitar slot no passado | RN-03 |
| CT-07 | Appointments | Cancelar consulta com sucesso | RN-04 |
| CT-08 | Appointments | Rejeitar cancelamento no passado | RN-06 |
| CT-09 | Appointments | Rejeitar cancelamento inexistente | — |
| CT-10 | Appointments | Rejeitar criação com slot inexistente | — |
| CT-11 | Appointments | Listar consultas por paciente | RF-07 |
| CT-12 | Slots | Criar slot com sucesso | — |
| CT-13 | Slots | Rejeitar slot duplicado para mesmo médico | RN-02 |
| CT-14 | Slots | Listar slots com filtro available | RF-06 |
| CT-15 | Slots | Buscar slot por ID | — |
| CT-16 | Doctors | Criar médico com sucesso | RF-01 |
| CT-17 | Doctors | Buscar médico por ID | — |
| CT-18 | Patients | Criar paciente com sucesso | RF-02 |
| CT-19 | Patients | Buscar paciente inexistente | — |

### Testes End-to-End

| ID | Fluxo | Status esperado |
|----|-------|----------------|
| E2E-01 | Cadastrar médico | 201 |
| E2E-02 | Cadastrar paciente | 201 |
| E2E-03 | Criar slot de horário | 201 |
| E2E-04 | Agendar consulta | 201 |
| E2E-05 | Slot duplicado para mesmo médico | 409 |
| E2E-06 | Agendar slot já ocupado | 409 |
| E2E-07 | Agendar slot no passado | 400 |
| E2E-08 | Cancelar consulta | 200 |
| — | Validar nome curto (3 caracteres) | 400 |
| — | Validar campo extra no body | 400 |
| — | Listar slots com `?available=true` | Só não agendados |
| — | Listar consultas do paciente | Array com relations |

## Documentação da API

- **Scalar UI** (recomendado): http://localhost:3000/docs
- **Swagger UI**: http://localhost:3000/swagger
- **OpenAPI JSON**: http://localhost:3000/docs-json

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/doctors` | Cadastrar médico |
| GET | `/doctors` | Listar médicos |
| GET | `/doctors/:id` | Buscar médico |
| POST | `/doctors/:doctorId/slots` | Criar slot de horário |
| GET | `/doctors/:doctorId/slots?available=true` | Listar slots (com filtro opcional) |
| POST | `/appointments` | Agendar consulta |
| PATCH | `/appointments/:id/cancel` | Cancelar consulta |
| POST | `/patients` | Cadastrar paciente |
| GET | `/patients/:id` | Buscar paciente |
| GET | `/patients/:id/appointments` | Listar consultas do paciente |
