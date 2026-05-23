# Dentu's Clinic — API REST

Sistema de gerenciamento para clínica odontológica.  
Projeto acadêmico (PIM) — ADS UNIP.

## Stack

- C# / ASP.NET Core (.NET 10)
- SQL Server + Entity Framework Core (Code First)
- JWT Bearer Token
- Swagger (Swashbuckle)

## Como rodar

### Pré-requisitos

- .NET 10 SDK
- SQL Server (local ou Docker)

### 1. Configurar a connection string

Edite `backend/DentusClinic.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=DentusClinicDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

### 2. Aplicar as migrations

```bash
cd backend/DentusClinic.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### 3. Rodar o projeto

```bash
dotnet run
```

A API estará disponível em: `https://localhost:7000` (ou porta configurada)  
Swagger: `https://localhost:7000/swagger`

## Login inicial (seed)

| Campo | Valor |
|-------|-------|
| Email | admin@dentusclinic.com |
| Senha | Admin@123 |

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/login | Autenticação |
| GET | /api/pacientes | Lista pacientes |
| POST | /api/pacientes | Cadastra paciente |
| GET | /api/consultas | Lista consultas |
| POST | /api/consultas | Agenda consulta |
| PUT | /api/consultas/{id}/chegada | Registra chegada |
| PUT | /api/consultas/{id}/cancelar | Cancela consulta |
