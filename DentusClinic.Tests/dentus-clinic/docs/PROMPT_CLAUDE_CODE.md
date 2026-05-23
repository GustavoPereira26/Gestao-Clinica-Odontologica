# PROMPT — Claude Code: Estrutura Inicial do Projeto Dentu's Clinic

---

Você é um engenheiro de software sênior especialista em C# e ASP.NET Core.
Vou te passar o contexto completo do projeto e quero que você crie toda a estrutura inicial.

---

## CONTEXTO DO PROJETO

Sistema de gerenciamento para clínica odontológica chamada **Dentu's Clinic**.
Projeto acadêmico (PIM) do curso de Análise e Desenvolvimento de Sistemas — UNIP.

---

## STACK OBRIGATÓRIA

- Linguagem: **C#**
- Framework: **ASP.NET Core (.NET 10)**
- Arquitetura: **API REST**
- Banco de dados: **SQL Server**
- ORM: **Entity Framework Core** (abordagem Code First)
- Autenticação: **JWT Bearer Token**
- Documentação: **Swagger (Swashbuckle)**
- Hash de senha: **BCrypt.Net-Next**
- Validação: **FluentValidation**

---

## ARQUITETURA DO PROJETO (MVC ADAPTADO PARA API)

```
HTTP Request → Controller → Service → AppDbContext → SQL Server
```

Separação em camadas obrigatória:
- **Controllers** → recebem requisições, chamam Services, retornam respostas padronizadas
- **Services** → contêm toda a lógica de negócio
- **Interfaces** → contratos das Services (para injeção de dependência)
- **Models** → entidades do banco de dados (mapeadas pelo EF Core)
- **DTOs** → objetos de transferência (Request e Response separados)
- **Data** → AppDbContext e Mappings (Fluent API)

---

## ESTRUTURA DE PASTAS A CRIAR

```
dentus-clinic/
│
├── backend/
│   └── DentusClinic.API/
│       ├── Controllers/
│       ├── Models/
│       ├── DTOs/
│       │   ├── Request/
│       │   └── Response/
│       ├── Services/
│       ├── Interfaces/
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   └── Mappings/
│       ├── Migrations/
│       ├── Middleware/
│       │   └── ErrorHandlingMiddleware.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       └── Program.cs
│
├── frontend/
│   └── (pasta vazia por enquanto, apenas criar)
│
├── docs/
│   ├── PROJETO.md
│   ├── BACKEND.md
│   └── DATABASE.md
│
├── .gitignore
└── README.md
```

---

## ENTIDADES (MODELS) — 10 tabelas

Criar um arquivo .cs por entidade dentro de `Models/`:

### Login
```csharp
Id (int, PK)
Email (string, obrigatório, único)
Senha (string, obrigatório — armazenar hash BCrypt)
TipoAcesso (string — valores: "ADM", "Dentista", "Secretaria")
```
Relacionamentos: 1 Login → 1 Funcionario, 1 Login → 1 Dentista

### Especialidade
```csharp
Id (int, PK)
Nome (string, obrigatório)
```
Relacionamentos: 1 Especialidade → N Dentistas

### Funcionario
```csharp
Id (int, PK)
Nome (string, obrigatório)
Cpf (string, obrigatório, único)
DataNascimento (DateOnly)
Telefone (string)
Cargo (string — "Secretaria" ou "ADM")
IdAcesso (int, FK → Login)
```

### Dentista
```csharp
Id (int, PK)
Nome (string, obrigatório)
Cpf (string, obrigatório, único)
Cro (string, obrigatório, único)
Telefone (string)
IdEspecialidade (int, FK → Especialidade)
IdAcesso (int, FK → Login)
```

### Paciente
```csharp
Id (int, PK)
Nome (string, obrigatório)
Cpf (string, obrigatório, único)
Telefone (string)
Email (string)
DataNascimento (DateOnly)
Endereco (string)
```
Relacionamentos: 1 Paciente → N Consultas, 1 Paciente → 1 Prontuario

### Consulta
```csharp
Id (int, PK)
DataConsulta (DateOnly, obrigatório)
HoraConsulta (TimeOnly, obrigatório)
Retorno (bool, default false)
Status (string — "Agendada", "Aguardando", "EmAtendimento", "Concluida", "Cancelada")
IdDentista (int, FK → Dentista)
IdPaciente (int, FK → Paciente)
```

### Atendimento
```csharp
Id (int, PK)
IdConsulta (int, FK → Consulta, único — relação 1:1)
Descricao (string)
ProcedimentoRealizado (string)
DataAtendimento (DateOnly, obrigatório)
Observacao (string)
```

### Prontuario
```csharp
Id (int, PK)
IdPaciente (int, FK → Paciente, único — relação 1:1)
DataAbertura (DateOnly, default = hoje)
```

### Servico
```csharp
Id (int, PK)
Nome (string, obrigatório)
```

### Planos
```csharp
Id (int, PK)
IdProntuario (int, FK → Prontuario)
IdServico (int, FK → Servico)
Descricao (string)
Condicao (string)
Status (string — "Ativo", "Concluido", "Cancelado")
Observacao (string)
```

---

## CONTROLLERS E ROTAS

Criar um controller por recurso com os métodos CRUD padrão:

| Controller              | Rota base               |
|-------------------------|--------------------------|
| AuthController          | /api/auth               |
| PacienteController      | /api/pacientes          |
| FuncionarioController   | /api/funcionarios       |
| DentistaController      | /api/dentistas          |
| EspecialidadeController | /api/especialidades     |
| ConsultaController      | /api/consultas          |
| AtendimentoController   | /api/atendimentos       |
| ProntuarioController    | /api/prontuarios        |
| PlanosController        | /api/planos             |
| ServicoController       | /api/servicos           |

Padrão de endpoints por controller (exemplo com Paciente):
```
GET    /api/pacientes           → lista todos
GET    /api/pacientes/{id}      → busca por ID
POST   /api/pacientes           → cadastra novo
PUT    /api/pacientes/{id}      → edita existente
DELETE /api/pacientes/{id}      → remove (apenas ADM)
```

Para Consulta, adicionar também:
```
PUT /api/consultas/{id}/chegada    → registra chegada do paciente
PUT /api/consultas/{id}/cancelar   → cancela a consulta
```

Para AuthController:
```
POST /api/auth/login   → recebe email + senha, retorna JWT
```

---

## PADRÃO DE RESPOSTA DA API

Todas as respostas devem usar este wrapper:

```csharp
public class ApiResponse<T>
{
    public bool Sucesso { get; set; }
    public string Mensagem { get; set; }
    public T? Dados { get; set; }
}
```

Exemplo de retorno de sucesso:
```json
{ "sucesso": true, "mensagem": "Paciente cadastrado com sucesso.", "dados": { } }
```

Exemplo de retorno de erro:
```json
{ "sucesso": false, "mensagem": "CPF já cadastrado no sistema.", "dados": null }
```

---

## AUTENTICAÇÃO JWT

- Endpoint de login: `POST /api/auth/login`
- Recebe: `{ "email": "...", "senha": "..." }`
- Retorna: `{ "token": "eyJ..." }`
- Token deve conter claims: `Id`, `Nome`, `TipoAcesso`
- Usar `[Authorize]` em todos os controllers
- Usar `[Authorize(Roles = "ADM")]` para rotas restritas ao administrador

---

## REGRAS DE NEGÓCIO OBRIGATÓRIAS NAS SERVICES

Implementar validações nas Services (não nos Controllers):

1. Paciente deve estar cadastrado para agendar consulta
2. Dentista não pode ter duas consultas no mesmo horário na mesma data
3. CPF não pode ser duplicado em nenhuma entidade
4. CRO do dentista deve ser único
5. Exclusão de paciente apenas para perfil ADM
6. Cancelamento e alteração de consultas apenas para Secretaria e ADM
7. Atendimento só pode ser registrado vinculado a uma consulta existente
8. Prontuário é criado automaticamente ao cadastrar um novo paciente
9. Consultas canceladas não são deletadas — apenas têm o status alterado

---

## CONFIGURAÇÕES OBRIGATÓRIAS NO Program.cs

1. Registrar DbContext com SQL Server
2. Registrar todas as Services e Interfaces via injeção de dependência
3. Configurar JWT Authentication
4. Configurar Swagger com suporte a Bearer Token
5. Configurar CORS para liberar o frontend (localhost:3000 e localhost:5500)
6. Adicionar middleware de tratamento global de erros

---

## appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentusClinicDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "DentusClinic@SecretKey#2026!SuperSegura",
    "Issuer": "DentusClinic.API",
    "Audience": "DentusClinic.Client",
    "ExpiracaoHoras": 8
  }
}
```

---

## PACOTES NUGET A INSTALAR

```
Microsoft.EntityFrameworkCore.SqlServer
Microsoft.EntityFrameworkCore.Tools
Microsoft.AspNetCore.Authentication.JwtBearer
Swashbuckle.AspNetCore
BCrypt.Net-Next
FluentValidation.AspNetCore
```

---

## SEED DE DADOS INICIAIS

Criar um método de seed no AppDbContext ou em uma classe separada `DataSeeder.cs` com:

- 5 especialidades: Clínica Geral, Ortodontia, Endodontia, Periodontia, Implantodontia
- 8 serviços: Consulta de Rotina, Limpeza, Restauração, Extração, Canal, Ortodontia, Clareamento, Raio-X
- 1 login ADM inicial: email `admin@dentusclinic.com`, senha `Admin@123` (já em hash BCrypt)

---

## O QUE QUERO QUE VOCÊ FAÇA

1. Crie toda a estrutura de pastas descrita acima
2. Crie todos os Models (10 entidades) com Data Annotations básicas
3. Crie o AppDbContext com todos os DbSets e configurações Fluent API
4. Crie as Interfaces de todas as Services
5. Crie as Services com implementação básica (CRUD) e as regras de negócio listadas
6. Crie todos os Controllers com os endpoints descritos
7. Crie DTOs de Request e Response para cada entidade
8. Configure o Program.cs completo
9. Configure o appsettings.json
10. Crie o ErrorHandlingMiddleware
11. Crie a classe ApiResponse<T>
12. Instale todos os pacotes NuGet necessários
13. Crie a primeira Migration chamada "InitialCreate"
14. Crie o .gitignore adequado para projetos .NET
15. Crie um README.md básico explicando como rodar o projeto

Ao finalizar, me mostre:
- A estrutura de pastas criada
- Os comandos para rodar o projeto
- O comando para aplicar as migrations no banco

---

## CONVENÇÕES DE CÓDIGO

- Nomes de classes, métodos e propriedades: **PascalCase** (inglês)
- Nomes de variáveis locais: **camelCase** (inglês)
- Comentários e mensagens de retorno da API: **português**
- Async/await em **todas** as operações com banco de dados
- Nunca retornar entidades diretamente — sempre usar DTOs
