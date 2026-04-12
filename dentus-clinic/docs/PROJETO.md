# PROJETO.md — Dentu's Clinic: Visão Geral

## Descrição
Sistema de gerenciamento para clínica odontológica chamada **Dentu's Clinic**.
Desenvolvido como Projeto Integrador Multidisciplinar (PIM) do 3º semestre do curso
de Análise e Desenvolvimento de Sistemas — UNIP.

---

## Stack Tecnológica

| Camada      | Tecnologia                          |
|-------------|--------------------------------------|
| Back-end    | C# / ASP.NET Core (.NET 10) — API REST |
| Banco       | SQL Server (Entity Framework Core)  |
| Front-end   | A definir (HTML/CSS/JS ou framework) |
| Arquitetura | MVC no back / SPA ou páginas no front |

---

## Estrutura de Pastas do Projeto (Monorepo)

```
dentus-clinic/
│
├── backend/                          # API REST em ASP.NET Core
│   ├── DentusClinic.API/             # Projeto principal da API
│   │   ├── Controllers/              # Endpoints HTTP (recebe requisições)
│   │   ├── Models/                   # Entidades do banco de dados
│   │   ├── DTOs/                     # Objetos de transferência de dados
│   │   ├── Services/                 # Regras de negócio
│   │   ├── Interfaces/               # Contratos das services
│   │   ├── Data/                     # DbContext e configurações EF Core
│   │   │   ├── AppDbContext.cs
│   │   │   └── Mappings/             # Configurações Fluent API por entidade
│   │   ├── Migrations/               # Migrations do EF Core
│   │   ├── Middleware/               # Middlewares customizados (ex: tratamento de erros)
│   │   ├── appsettings.json          # Configurações gerais
│   │   ├── appsettings.Development.json
│   │   └── Program.cs                # Ponto de entrada da aplicação
│   │
│   └── DentusClinic.Tests/           # Projeto de testes (xUnit)
│
├── frontend/                         # Interface do usuário (a definir tecnologia)
│   ├── pages/                        # Telas/páginas
│   ├── components/                   # Componentes reutilizáveis
│   ├── assets/                       # Imagens, fontes, ícones
│   └── styles/                       # CSS / estilos globais
│
├── docs/                             # Documentação do projeto
│   ├── PROJETO.md                    # Este arquivo
│   ├── BACKEND.md                    # Contexto da API e arquitetura
│   └── DATABASE.md                   # Contexto do banco de dados
│
├── .gitignore
└── README.md
```

---

## Perfis de Usuário (Atores do Sistema)

| Perfil      | Descrição                                                  |
|-------------|-------------------------------------------------------------|
| ADM         | Acesso total: gerencia usuários, relatórios e configurações |
| Secretaria  | Cadastra pacientes, gerencia agenda e agendamentos          |
| Dentista    | Acessa agenda, registra atendimentos e prontuários          |

---

## Fluxo Geral de Atendimento

```
Paciente chega → Recepcionista registra chegada
→ Dentista é notificado → Consulta realizada
→ Dentista registra atendimento + plano de tratamento
→ Prontuário atualizado → Retorno agendado (se necessário)
```

---

## Convenções do Projeto

- **Idioma do código**: inglês (nomes de variáveis, classes, métodos)
- **Idioma das respostas da API**: português
- **Padrão de rotas**: `/api/{recurso}` (ex: `/api/pacientes`, `/api/consultas`)
- **Autenticação**: JWT Bearer Token
- **Versionamento**: Git (GitHub)
- **IDE**: Visual Studio / VS Code

---

## Regras Gerais Importantes

- Todo acesso ao sistema exige autenticação (login + senha)
- Cada perfil tem permissões distintas (ver BACKEND.md)
- Nenhuma consulta pode ser agendada sem paciente cadastrado
- Dentista não pode ter dois agendamentos no mesmo horário
- Exclusão de pacientes é restrita ao perfil ADM
- O sistema mantém histórico de todos os atendimentos
