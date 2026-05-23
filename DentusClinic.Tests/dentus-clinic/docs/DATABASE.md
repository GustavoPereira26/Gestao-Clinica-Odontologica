# DATABASE.md — Dentu's Clinic: Banco de Dados

## Visão Geral

- **SGBD**: Microsoft SQL Server
- **ORM**: Entity Framework Core (.NET 10)
- **Abordagem**: Code First (modelos em C# geram o banco via Migrations)

---

## Entidades e Tabelas

### Login
```sql
CREATE TABLE Login (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Email       VARCHAR(100) NOT NULL UNIQUE,
    Senha       VARCHAR(255) NOT NULL,        -- Hash BCrypt
    TipoAcesso  VARCHAR(20)  NOT NULL         -- 'ADM', 'Dentista', 'Secretaria'
);
```

---

### Especialidade
```sql
CREATE TABLE Especialidade (
    Id   INT PRIMARY KEY IDENTITY(1,1),
    Nome VARCHAR(100) NOT NULL
);
```

---

### Funcionario
```sql
CREATE TABLE Funcionario (
    Id             INT PRIMARY KEY IDENTITY(1,1),
    Nome           VARCHAR(100) NOT NULL,
    Cpf            VARCHAR(14)  NOT NULL UNIQUE,
    DataNascimento DATE         NOT NULL,
    Telefone       VARCHAR(20),
    Cargo          VARCHAR(50)  NOT NULL,     -- 'Secretaria', 'ADM'
    IdAcesso       INT          NOT NULL,
    FOREIGN KEY (IdAcesso) REFERENCES Login(Id)
);
```

---

### Dentista
```sql
CREATE TABLE Dentista (
    Id               INT PRIMARY KEY IDENTITY(1,1),
    Nome             VARCHAR(100) NOT NULL,
    Cpf              VARCHAR(14)  NOT NULL UNIQUE,
    Cro              VARCHAR(20)  NOT NULL UNIQUE,
    Telefone         VARCHAR(20),
    IdEspecialidade  INT          NOT NULL,
    IdAcesso         INT          NOT NULL,
    FOREIGN KEY (IdEspecialidade) REFERENCES Especialidade(Id),
    FOREIGN KEY (IdAcesso)        REFERENCES Login(Id)
);
```

---

### Paciente
```sql
CREATE TABLE Paciente (
    Id             INT PRIMARY KEY IDENTITY(1,1),
    Nome           VARCHAR(100) NOT NULL,
    Cpf            VARCHAR(14)  NOT NULL UNIQUE,
    Telefone       VARCHAR(20),
    Email          VARCHAR(100),
    DataNascimento DATE,
    Endereco       VARCHAR(255)
);
```

---

### Consulta
```sql
CREATE TABLE Consulta (
    Id            INT PRIMARY KEY IDENTITY(1,1),
    DataConsulta  DATE        NOT NULL,
    HoraConsulta  TIME        NOT NULL,
    Retorno       BIT         NOT NULL DEFAULT 0,  -- 0 = não, 1 = sim
    Status        VARCHAR(20) NOT NULL DEFAULT 'Agendada',
    -- Status possíveis: 'Agendada', 'Aguardando', 'EmAtendimento', 'Concluida', 'Cancelada'
    IdDentista    INT         NOT NULL,
    IdPaciente    INT         NOT NULL,
    FOREIGN KEY (IdDentista)  REFERENCES Dentista(Id),
    FOREIGN KEY (IdPaciente)  REFERENCES Paciente(Id)
);
```

---

### Atendimento
```sql
CREATE TABLE Atendimento (
    Id                    INT PRIMARY KEY IDENTITY(1,1),
    IdConsulta            INT          NOT NULL UNIQUE,  -- 1:1 com Consulta
    Descricao             VARCHAR(500),
    ProcedimentoRealizado VARCHAR(255),
    DataAtendimento       DATE         NOT NULL,
    Observacao            VARCHAR(500),
    FOREIGN KEY (IdConsulta) REFERENCES Consulta(Id)
);
```

---

### Prontuario
```sql
CREATE TABLE Prontuario (
    Id           INT PRIMARY KEY IDENTITY(1,1),
    IdPaciente   INT  NOT NULL UNIQUE,  -- 1:1 com Paciente
    DataAbertura DATE NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (IdPaciente) REFERENCES Paciente(Id)
);
```

---

### Servico
```sql
CREATE TABLE Servico (
    Id      INT PRIMARY KEY IDENTITY(1,1),
    Servico VARCHAR(100) NOT NULL   -- ex: 'Limpeza', 'Extração', 'Canal', 'Restauração'
);
```

---

### Planos
```sql
CREATE TABLE Planos (
    Id            INT PRIMARY KEY IDENTITY(1,1),
    IdProntuario  INT          NOT NULL,
    IdServico     INT          NOT NULL,
    Descricao     VARCHAR(500),
    Condicao      VARCHAR(255),
    Status        VARCHAR(20)  NOT NULL DEFAULT 'Ativo',  -- 'Ativo', 'Concluido', 'Cancelado'
    Observacao    VARCHAR(500),
    FOREIGN KEY (IdProntuario) REFERENCES Prontuario(Id),
    FOREIGN KEY (IdServico)    REFERENCES Servico(Id)
);
```

---

## Diagrama de Relacionamentos (Texto)

```
Login ──────────────── Funcionario   (1:1)
Login ──────────────── Dentista      (1:1)
Especialidade ────────  Dentista     (1:N)

Paciente ─────────────  Consulta     (1:N)
Dentista ─────────────  Consulta     (1:N)
Consulta ─────────────  Atendimento  (1:1)

Paciente ─────────────  Prontuario   (1:1)
Prontuario ───────────  Planos       (1:N)
Servico ──────────────  Planos       (1:N)
```

---

## Configuração do DbContext (C#)

```csharp
// Data/AppDbContext.cs
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Login>        Logins        { get; set; }
    public DbSet<Funcionario>  Funcionarios  { get; set; }
    public DbSet<Especialidade> Especialidades { get; set; }
    public DbSet<Dentista>     Dentistas     { get; set; }
    public DbSet<Paciente>     Pacientes     { get; set; }
    public DbSet<Consulta>     Consultas     { get; set; }
    public DbSet<Atendimento>  Atendimentos  { get; set; }
    public DbSet<Prontuario>   Prontuarios   { get; set; }
    public DbSet<Planos>       Planos        { get; set; }
    public DbSet<Servico>      Servicos      { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Aplicar configurações de mapeamento de cada entidade
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
```

---

## Connection String (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DentusClinicDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

---

## Comandos EF Core (Migrations)

```bash
# Criar a primeira migration
dotnet ef migrations add InitialCreate --project DentusClinic.API

# Aplicar ao banco de dados
dotnet ef database update --project DentusClinic.API

# Reverter última migration
dotnet ef migrations remove --project DentusClinic.API
```

---

## Dados Iniciais Sugeridos (Seed)

```sql
-- Serviços odontológicos básicos
INSERT INTO Servico (Servico) VALUES
    ('Consulta de Rotina'),
    ('Limpeza'),
    ('Restauração'),
    ('Extração'),
    ('Canal (Endodontia)'),
    ('Ortodontia'),
    ('Clareamento'),
    ('Raio-X');

-- Especialidades
INSERT INTO Especialidade (Nome) VALUES
    ('Clínica Geral'),
    ('Ortodontia'),
    ('Endodontia'),
    ('Periodontia'),
    ('Implantodontia');

-- Login ADM inicial
INSERT INTO Login (Email, Senha, TipoAcesso) VALUES
    ('admin@dentusclinic.com', '<hash_bcrypt>', 'ADM');
```

---

## Observações Importantes

- Senhas nunca são armazenadas em texto puro — usar **BCrypt** para hash
- O campo `Status` da `Consulta` controla o fluxo de atendimento do dia
- O `Prontuario` é criado automaticamente ao cadastrar um novo `Paciente`
- A exclusão de um `Paciente` (apenas ADM) deve remover em cascata: Prontuário → Planos
- Consultas canceladas **não** são removidas, apenas têm o status alterado para `'Cancelada'`
- Índices recomendados: `Paciente.Cpf`, `Dentista.Cro`, `Consulta.DataConsulta + IdDentista`
