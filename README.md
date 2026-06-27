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
# Todos os testes
npm run test

# Modo watch (re-executa ao salvar)
npm run test:watch

# Com cobertura
npm run test:cov
```

### Estrutura

Os testes ficam ao lado do código-fonte (`*.spec.ts`), seguindo o padrão NestJS:

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

**Total: 16 testes unitários** — todos mockam os repositórios TypeORM com `jest.fn()`, sem banco de dados real, executando em < 1s.

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
