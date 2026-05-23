# CLAUDE.md — Dentu's Clinic

> Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto.
> Ele contém tudo que você precisa saber antes de tocar em qualquer arquivo.

---

## O que é este projeto?

Sistema de gerenciamento para a clínica odontológica fictícia **Dentu's Clinic**.
Projeto acadêmico (PIM — 3º semestre) do curso de Análise e Desenvolvimento de Sistemas da UNIP.

Documentação completa está na pasta `docs/`:
- `docs/PROJETO.md` → visão geral, stack, estrutura de pastas, convenções
- `docs/BACKEND.md` → arquitetura da API, entidades, controllers, regras de negócio
- `docs/DATABASE.md` → tabelas, relacionamentos, migrations, seed

**Leia os arquivos em `docs/` antes de qualquer tarefa.**

---

## Stack

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Back-end   | C# / ASP.NET Core (.NET 10) — API REST  |
| Banco      | SQL Server + Entity Framework Core      |
| Auth       | JWT Bearer Token                        |
| Front-end  | A definir (pasta `frontend/` reservada) |

---

## Estrutura de pastas

```
dentus-clinic/
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
│       ├── appsettings.json
│       └── Program.cs
├── frontend/
├── docs/
│   ├── PROJETO.md
│   ├── BACKEND.md
│   └── DATABASE.md
├── CLAUDE.md        ← você está aqui
├── .gitignore
└── README.md
```

---

## Convenções obrigatórias

- **Classes, métodos, propriedades**: PascalCase em inglês (`PacienteService`, `GetById`)
- **Variáveis locais**: camelCase em inglês (`pacienteExistente`, `tokenJwt`)
- **Mensagens da API e comentários**: português (`"Paciente não encontrado."`)
- **Async/await**: obrigatório em todas as operações com banco de dados
- **Nunca retornar entidades diretamente**: sempre usar DTOs de Response
- **Nunca colocar regras de negócio no Controller**: toda lógica vai na Service

---

## Padrão de resposta da API

Toda resposta usa o wrapper `ApiResponse<T>`:

```json
{ "sucesso": true,  "mensagem": "Operação realizada.", "dados": { } }
{ "sucesso": false, "mensagem": "CPF já cadastrado.",  "dados": null }
```

---

## Perfis de acesso (Roles JWT)

| Role        | Permissões                                              |
|-------------|----------------------------------------------------------|
| `ADM`       | Acesso total — gerencia usuários, exclusões e relatórios |
| `Secretaria`| Cadastra pacientes, gerencia agenda e agendamentos       |
| `Dentista`  | Acessa agenda, registra atendimentos e prontuários       |

Usar `[Authorize(Roles = "ADM")]` para rotas restritas.

---

## Regras de negócio críticas

1. Paciente deve estar cadastrado antes de agendar consulta
2. Dentista não pode ter duas consultas no mesmo horário/data
3. CPF deve ser único em todas as entidades
4. CRO do dentista deve ser único
5. Exclusão de paciente → apenas perfil ADM
6. Consultas canceladas → nunca deletar, apenas mudar status para `"Cancelada"`
7. Prontuário → criado automaticamente ao cadastrar um novo paciente
8. Atendimento → sempre vinculado a uma consulta existente

---

## Entidades do banco (10 tabelas)

`Login` · `Funcionario` · `Especialidade` · `Dentista` · `Paciente`
`Consulta` · `Atendimento` · `Prontuario` · `Planos` · `Servico`

Detalhes completos de cada entidade em `docs/DATABASE.md`.

---

## Como rodar o projeto

```bash
# 1. Entrar na pasta da API
cd backend/DentusClinic.API

# 2. Restaurar pacotes
dotnet restore

# 3. Aplicar migrations no banco
dotnet ef database update

# 4. Rodar a API
dotnet run
```

API disponível em: `https://localhost:7000` (ou porta definida no launchSettings.json)
Swagger disponível em: `https://localhost:7000/swagger`

---

## Pacotes NuGet instalados

```
Microsoft.EntityFrameworkCore.SqlServer
Microsoft.EntityFrameworkCore.Tools
Microsoft.AspNetCore.Authentication.JwtBearer
Swashbuckle.AspNetCore
BCrypt.Net-Next
FluentValidation.AspNetCore
```

---

## Tarefas comuns — como pedir ao Claude Code

| O que fazer                        | Como pedir                                                   |
|------------------------------------|--------------------------------------------------------------|
| Criar nova entidade                | "Crie o model, DTO, interface, service e controller para X"  |
| Adicionar endpoint                 | "Adicione o endpoint Y no controller Z seguindo o padrão"    |
| Criar migration                    | "Crie uma migration chamada X para a alteração feita em Y"   |
| Corrigir bug                       | "Veja o erro abaixo e corrija mantendo as convenções"        |
| Adicionar validação                | "Adicione validação FluentValidation no DTO X"               |
| Criar seed de dados                | "Adicione seed para a entidade X com os dados Y"             |
