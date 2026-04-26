# BACKEND.md — Dentu's Clinic: Arquitetura da API

## Visão Geral

API REST desenvolvida em **C# com ASP.NET Core (.NET 10)**.
Segue o padrão **MVC adaptado para API**: Controllers → Services → Repository (via EF Core) → SQL Server.

---

## Arquitetura em Camadas

```
HTTP Request
    ↓
[Controller]         → Recebe a requisição, valida DTO, chama Service
    ↓
[Service]            → Contém as regras de negócio
    ↓
[AppDbContext]       → Entity Framework Core (acesso ao banco)
    ↓
[SQL Server]         → Persistência dos dados
```

---

## Entidades (Models)

Cada entidade abaixo corresponde a uma tabela no banco de dados.
Ver DATABASE.md para colunas e relacionamentos detalhados.

### Login
Armazena credenciais de acesso ao sistema.
- Relacionada com: `Funcionario`, `Dentista`
- Atributos principais: `Id`, `Email`, `Senha` (hash), `TipoAcesso`

### Funcionario
Representa secretárias e administradores da clínica.
- Relacionado com: `Login`
- Atributos principais: `Id`, `Nome`, `Cpf`, `DataNascimento`, `Telefone`, `Cargo`, `IdAcesso`

### Especialidade
Tipos de especialidades odontológicas (ex: ortodontia, endodontia).
- Relacionada com: `Dentista`
- Atributos principais: `Id`, `Nome`

### Dentista
Profissionais responsáveis pelos atendimentos.
- Relacionado com: `Login`, `Especialidade`, `Consulta`
- Atributos principais: `Id`, `Nome`, `Cpf`, `Cro`, `Telefone`, `IdEspecialidade`, `IdAcesso`

### Paciente
Pacientes atendidos pela clínica.
- Relacionado com: `Consulta`, `Prontuario`
- Atributos principais: `Id`, `Nome`, `Cpf`, `Telefone`, `Email`, `DataNascimento`, `Endereco`

### Consulta
Agendamentos realizados na clínica.
- Relacionada com: `Paciente`, `Dentista`, `Atendimento`
- Atributos principais: `Id`, `DataConsulta`, `HoraConsulta`, `Retorno`, `Status`, `IdDentista`, `IdPaciente`

### Atendimento
Registro do que foi realizado em cada consulta.
- Relacionado com: `Consulta` (1:1)
- Atributos principais: `Id`, `IdConsulta`, `Descricao`, `ProcedimentoRealizado`, `DataAtendimento`, `Observacao`

### Prontuario
Pasta clínica do paciente no sistema.
- Relacionado com: `Paciente` (1:1), `Planos`
- Atributos principais: `Id`, `IdPaciente`, `DataAbertura`

### Planos
Planos de tratamento definidos pelo dentista.
- Relacionado com: `Prontuario`, `Servico`
- Atributos principais: `Id`, `IdProntuario`, `IdServico`, `Descricao`, `Condicao`, `Status`, `Observacao`

### Servico
Tipos de serviços odontológicos oferecidos pela clínica.
- Relacionado com: `Planos`
- Atributos principais: `Id`, `Servico`

---

## Controllers e Rotas

| Controller              | Rota base              | Perfil permitido         |
|-------------------------|------------------------|--------------------------|
| AuthController          | `/api/auth`            | Público                  |
| PacienteController      | `/api/pacientes`       | ADM, Secretaria, Dentista|
| FuncionarioController   | `/api/funcionarios`    | ADM                      |
| DentistaController      | `/api/dentistas`       | ADM                      |
| EspecialidadeController | `/api/especialidades`  | ADM                      |
| ConsultaController      | `/api/consultas`       | ADM, Secretaria, Dentista|
| AtendimentoController   | `/api/atendimentos`    | Dentista                 |
| ProntuarioController    | `/api/prontuarios`     | Dentista, Secretaria     |
| PlanosController        | `/api/planos`          | Dentista                 |
| ServicoController       | `/api/servicos`        | ADM                      |

### Padrão de endpoints por Controller (exemplo: Paciente)

```
GET    /api/pacientes          → Lista todos os pacientes
GET    /api/pacientes/{id}     → Busca paciente por ID
POST   /api/pacientes          → Cadastra novo paciente
PUT    /api/pacientes/{id}     → Edita paciente existente
DELETE /api/pacientes/{id}     → Remove paciente (apenas ADM)
```

---

## Autenticação e Autorização

- **Método**: JWT Bearer Token
- **Login**: `POST /api/auth/login` → recebe email + senha, retorna token JWT
- **Token**: inclui claims de `Id`, `Nome`, `TipoAcesso`
- **Perfis**: `ADM`, `Dentista`, `Secretaria`
- Usar `[Authorize(Roles = "ADM")]` nos controllers para restringir acesso

---

## Requisitos Funcionais Mapeados

| Código | Funcionalidade                                | Controller / Método         |
|--------|-----------------------------------------------|-----------------------------|
| RF01   | Cadastro de pacientes                         | POST /api/pacientes         |
| RF02   | Edição de pacientes                           | PUT /api/pacientes/{id}     |
| RF03   | Exclusão de pacientes (ADM)                   | DELETE /api/pacientes/{id}  |
| RF04   | Cadastro de funcionários/dentistas            | POST /api/funcionarios      |
| RF05   | Edição de funcionários                        | PUT /api/funcionarios/{id}  |
| RF06   | Exclusão de funcionários (ADM)                | DELETE /api/funcionarios/{id}|
| RF07   | Perfis de acesso por tipo de usuário          | AuthController + JWT claims |
| RF08   | Agendamento de consultas                      | POST /api/consultas         |
| RF09   | Visualização da agenda                        | GET /api/consultas          |
| RF10   | Alteração de consultas                        | PUT /api/consultas/{id}     |
| RF11   | Cancelamento de consultas                     | PUT /api/consultas/{id}/cancelar |
| RF12   | Registro de chegada do paciente               | PUT /api/consultas/{id}/chegada  |
| RF13   | Notificação ao dentista (paciente aguardando) | Via status na consulta      |
| RF14   | Registro de plano de tratamento               | POST /api/planos            |
| RF15   | Histórico de atendimentos                     | GET /api/atendimentos       |
| RF16   | Visualização do histórico do paciente         | GET /api/pacientes/{id}/historico |
| RF17   | Consulta de informações de pacientes          | GET /api/pacientes/{id}     |
| RF18   | Lista de funcionários                         | GET /api/funcionarios       |
| RF19   | Login com autenticação                        | POST /api/auth/login        |

---

## Regras de Negócio Implementadas nas Services

| Código | Regra                                                                 | Service responsável   |
|--------|-----------------------------------------------------------------------|-----------------------|
| RN01   | Paciente deve estar cadastrado para agendar consulta                  | ConsultaService       |
| RN02   | Cada consulta tem apenas um dentista                                  | ConsultaService       |
| RN03   | Dentista não pode ter duas consultas no mesmo horário                 | ConsultaService       |
| RN04   | Apenas funcionários autenticados acessam o sistema                    | AuthService + JWT     |
| RN05   | SECRETARIA gerencia agendamentos e cadastros                       | Autorização por perfil|
| RN06   | Atendimento deve estar vinculado a uma consulta existente             | AtendimentoService    |
| RN07   | Sistema mantém histórico de atendimentos por paciente                 | AtendimentoService    |
| RN08   | Informações dos pacientes devem ser mantidas organizadas              | PacienteService       |
| RN09   | Cancelamento/alteração de consultas é feito por funcionários autorizados | ConsultaService    |
| RN10   | Registro completo: paciente, dentista e consulta identificados        | ConsultaService       |

---

## Requisitos Não Funcionais Técnicos

| Código | Requisito                                      | Implementação                              |
|--------|------------------------------------------------|--------------------------------------------|
| RNF02  | Segurança das informações dos pacientes        | JWT + HTTPS + hash de senha (BCrypt)       |
| RNF03  | Acesso apenas a usuários autenticados          | `[Authorize]` em todos os controllers      |
| RNF04  | Tempo de resposta adequado                     | Async/await em todas as operações          |
| RNF05  | Compatível com navegadores modernos            | CORS configurado no Program.cs             |
| RNF06  | Integridade dos dados                          | Validações via FluentValidation + EF Core  |
| RNF07  | Fácil manutenção do código                     | Separação em camadas + injeção de dependência |
| RNF08  | Escalabilidade futura                          | Interfaces + padrão Repository/Service     |

---

## Pacotes NuGet Recomendados

```xml
<!-- Entity Framework Core com SQL Server -->
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" />

<!-- Autenticação JWT -->
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />

<!-- Documentação da API -->
<PackageReference Include="Swashbuckle.AspNetCore" />

<!-- Hash de senha -->
<PackageReference Include="BCrypt.Net-Next" />

<!-- Validação de DTOs -->
<PackageReference Include="FluentValidation.AspNetCore" />
```

---

## Configuração de CORS (Program.cs)

O front-end estará em uma origem diferente da API.
Configurar CORS para permitir requisições do front durante o desenvolvimento:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontEnd", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

---

## Padrão de Resposta da API

Padronizar todas as respostas com o seguinte formato:

```json
{
  "sucesso": true,
  "mensagem": "Paciente cadastrado com sucesso.",
  "dados": { }
}
```

Em caso de erro:

```json
{
  "sucesso": false,
  "mensagem": "CPF já cadastrado no sistema.",
  "dados": null
}
```
