using DentusClinic.API.Enums;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // ─── 1. ESPECIALIDADES ───────────────────────────────────────────
        if (!await context.Especialidades.AnyAsync())
        {
            context.Especialidades.AddRange(
                new Especialidade { Nome = "Clínica Geral" },
                new Especialidade { Nome = "Ortodontia" },
                new Especialidade { Nome = "Endodontia" },
                new Especialidade { Nome = "Periodontia" },
                new Especialidade { Nome = "Implantodontia" }
            );
            await context.SaveChangesAsync();
        }

        // ─── 2. SERVIÇOS ─────────────────────────────────────────────────
        if (!await context.Servicos.AnyAsync())
        {
            context.Servicos.AddRange(
                new Servico { Nome = "Consulta de Rotina" },
                new Servico { Nome = "Limpeza" },
                new Servico { Nome = "Restauração" },
                new Servico { Nome = "Extração" },
                new Servico { Nome = "Canal" },
                new Servico { Nome = "Ortodontia" },
                new Servico { Nome = "Clareamento" },
                new Servico { Nome = "Raio-X" }
            );
            await context.SaveChangesAsync();
        }

        // ─── 3. LOGINS ───────────────────────────────────────────────────
        if (!await context.Logins.AnyAsync())
        {
            var logins = new List<Login>
            {
                new Login
                {
                    Email = "admin@dentusclinic.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    TipoAcesso = TiposAcessoEnum.ADMINISTRADOR
                },
                // Dentistas
                new Login
                {
                    Email = "ana.souza@dentusclinic.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("Dentista@123"),
                    TipoAcesso = TiposAcessoEnum.DENTISTA
                },
                new Login
                {
                    Email = "carlos.lima@dentusclinic.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("Dentista@123"),
                    TipoAcesso = TiposAcessoEnum.DENTISTA
                },
                new Login
                {
                    Email = "mariana.faria@dentusclinic.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("Dentista@123"),
                    TipoAcesso = TiposAcessoEnum.DENTISTA
                },
                // Secretária
                new Login
                {
                    Email = "julia.mendes@dentusclinic.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("Secretaria@123"),
                    TipoAcesso = TiposAcessoEnum.SECRETARIA
                }
            };

            context.Logins.AddRange(logins);
            await context.SaveChangesAsync();
        }

        // ─── 4. FUNCIONÁRIOS ─────────────────────────────────────────────
        if (!await context.Funcionarios.AnyAsync())
        {
            var loginSecretaria = await context.Logins
                .FirstAsync(l => l.Email == "julia.mendes@dentusclinic.com");

            context.Funcionarios.Add(new Funcionario
            {
                Nome = "Júlia Mendes",
                Cpf = "32165498700",
                Telefone = "(11) 91234-5678",
                DataNascimento = new DateOnly(1995, 4, 20),
                Cargo = "Secretária",
                IdAcesso = loginSecretaria.Id
            });
            await context.SaveChangesAsync();
        }

        // ─── 5. DENTISTAS ────────────────────────────────────────────────
        if (!await context.Dentistas.AnyAsync())
        {
            var espClinica = await context.Especialidades.FirstAsync(e => e.Nome == "Clínica Geral");
            var espOrtodontia = await context.Especialidades.FirstAsync(e => e.Nome == "Ortodontia");
            var espEndodontia = await context.Especialidades.FirstAsync(e => e.Nome == "Endodontia");

            var loginAna = await context.Logins.FirstAsync(l => l.Email == "ana.souza@dentusclinic.com");
            var loginCarlos = await context.Logins.FirstAsync(l => l.Email == "carlos.lima@dentusclinic.com");
            var loginMariana = await context.Logins.FirstAsync(l => l.Email == "mariana.faria@dentusclinic.com");

            context.Dentistas.AddRange(
                new Dentista
                {
                    Nome = "Dra. Ana Souza",
                    Cpf = "45678912300",
                    Telefone = "(11) 98765-4321",
                    DataNascimento = new DateOnly(1985, 3, 15),
                    Cro = "SP-12345",
                    IdEspecialidade = espClinica.Id,
                    IdAcesso = loginAna.Id
                },
                new Dentista
                {
                    Nome = "Dr. Carlos Lima",
                    Cpf = "78912345600",
                    Telefone = "(11) 97654-3210",
                    DataNascimento = new DateOnly(1980, 7, 22),
                    Cro = "SP-67890",
                    IdEspecialidade = espOrtodontia.Id,
                    IdAcesso = loginCarlos.Id
                },
                new Dentista
                {
                    Nome = "Dra. Mariana Faria",
                    Cpf = "12345678900",
                    Telefone = "(11) 96543-2109",
                    DataNascimento = new DateOnly(1990, 11, 5),
                    Cro = "SP-11223",
                    IdEspecialidade = espEndodontia.Id,
                    IdAcesso = loginMariana.Id
                }
            );
            await context.SaveChangesAsync();
        }

        // ─── 6. PACIENTES ────────────────────────────────────────────────
        if (!await context.Pacientes.AnyAsync())
        {
            context.Pacientes.AddRange(
                new Paciente
                {
                    Nome = "Lucas Oliveira",
                    Cpf = "98765432100",
                    Telefone = "(11) 91111-2222",
                    DataNascimento = new DateOnly(1992, 6, 10),
                    Email = "lucas.oliveira@email.com",
                    Endereco = "Rua das Flores, 123 - Sorocaba/SP",
                    Ativo = true
                },
                new Paciente
                {
                    Nome = "Fernanda Costa",
                    Cpf = "65432109800",
                    Telefone = "(11) 92222-3333",
                    DataNascimento = new DateOnly(1998, 1, 25),
                    Email = "fernanda.costa@email.com",
                    Endereco = "Av. Brasil, 456 - Sorocaba/SP",
                    Ativo = true
                },
                new Paciente
                {
                    Nome = "Roberto Alves",
                    Cpf = "32109876500",
                    Telefone = "(11) 93333-4444",
                    DataNascimento = new DateOnly(1975, 9, 14),
                    Email = "roberto.alves@email.com",
                    Endereco = "Rua XV de Novembro, 789 - Sorocaba/SP",
                    Ativo = true
                },
                new Paciente
                {
                    Nome = "Camila Rocha",
                    Cpf = "10987654300",
                    Telefone = "(11) 94444-5555",
                    DataNascimento = new DateOnly(2001, 3, 30),
                    Email = "camila.rocha@email.com",
                    Endereco = "Rua da Paz, 321 - Sorocaba/SP",
                    Ativo = true
                },
                new Paciente
                {
                    Nome = "Thiago Pereira",
                    Cpf = "21098765400",
                    Telefone = "(11) 95555-6666",
                    DataNascimento = new DateOnly(1988, 12, 5),
                    Email = "thiago.pereira@email.com",
                    Endereco = "Alameda Santos, 654 - Sorocaba/SP",
                    Ativo = true
                }
            );
            await context.SaveChangesAsync();
        }

        // ─── 7. CONSULTAS ────────────────────────────────────────────────
        if (!await context.Consultas.AnyAsync())
        {
            var dentistaCG   = await context.Dentistas.FirstAsync(d => d.Cro == "SP-12345");
            var dentistaOrto = await context.Dentistas.FirstAsync(d => d.Cro == "SP-67890");
            var dentistaEndo = await context.Dentistas.FirstAsync(d => d.Cro == "SP-11223");

            var pLucas    = await context.Pacientes.FirstAsync(p => p.Cpf == "98765432100");
            var pFernanda = await context.Pacientes.FirstAsync(p => p.Cpf == "65432109800");
            var pRoberto  = await context.Pacientes.FirstAsync(p => p.Cpf == "32109876500");
            var pCamila   = await context.Pacientes.FirstAsync(p => p.Cpf == "10987654300");
            var pThiago   = await context.Pacientes.FirstAsync(p => p.Cpf == "21098765400");

            var svcRotina    = await context.Servicos.FirstAsync(s => s.Nome == "Consulta de Rotina");
            var svcLimpeza   = await context.Servicos.FirstAsync(s => s.Nome == "Limpeza");
            var svcRestauracao = await context.Servicos.FirstAsync(s => s.Nome == "Restauração");
            var svcCanal     = await context.Servicos.FirstAsync(s => s.Nome == "Canal");
            var svcOrtodontia = await context.Servicos.FirstAsync(s => s.Nome == "Ortodontia");

            var consultas = new List<Consulta>
            {
                // Concluídas (passado)
                new Consulta
                {
                    DataConsulta = new DateOnly(2025, 5, 10),
                    HoraConsulta = new TimeOnly(9, 0),
                    Retorno = false,
                    Status = "Concluida",
                    IdDentista = dentistaCG.Id,
                    IdPaciente = pLucas.Id,
                    IdServico = svcLimpeza.Id
                },
                new Consulta
                {
                    DataConsulta = new DateOnly(2025, 5, 15),
                    HoraConsulta = new TimeOnly(10, 30),
                    Retorno = false,
                    Status = "Concluida",
                    IdDentista = dentistaOrto.Id,
                    IdPaciente = pFernanda.Id,
                    IdServico = svcOrtodontia.Id
                },
                new Consulta
                {
                    DataConsulta = new DateOnly(2025, 5, 20),
                    HoraConsulta = new TimeOnly(14, 0),
                    Retorno = false,
                    Status = "Concluida",
                    IdDentista = dentistaEndo.Id,
                    IdPaciente = pRoberto.Id,
                    IdServico = svcCanal.Id
                },
                new Consulta
                {
                    DataConsulta = new DateOnly(2025, 5, 22),
                    HoraConsulta = new TimeOnly(8, 0),
                    Retorno = true,
                    Status = "Concluida",
                    IdDentista = dentistaCG.Id,
                    IdPaciente = pLucas.Id,
                    IdServico = svcRestauracao.Id
                },
                // Cancelada
                new Consulta
                {
                    DataConsulta = new DateOnly(2025, 5, 28),
                    HoraConsulta = new TimeOnly(11, 0),
                    Retorno = false,
                    Status = "Cancelada",
                    IdDentista = dentistaOrto.Id,
                    IdPaciente = pCamila.Id,
                    IdServico = svcOrtodontia.Id
                },
                // Futuras / Agendadas
                new Consulta
                {
                    DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                    HoraConsulta = new TimeOnly(9, 0),
                    Retorno = false,
                    Status = "Agendada",
                    IdDentista = dentistaCG.Id,
                    IdPaciente = pCamila.Id,
                    IdServico = svcLimpeza.Id
                },
                new Consulta
                {
                    DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
                    HoraConsulta = new TimeOnly(10, 0),
                    Retorno = false,
                    Status = "Agendada",
                    IdDentista = dentistaEndo.Id,
                    IdPaciente = pThiago.Id,
                    IdServico = svcCanal.Id
                },
                new Consulta
                {
                    DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
                    HoraConsulta = new TimeOnly(14, 30),
                    Retorno = true,
                    Status = "Agendada",
                    IdDentista = dentistaOrto.Id,
                    IdPaciente = pFernanda.Id,
                    IdServico = svcOrtodontia.Id
                },
                // Hoje — Em atendimento / Aguardando
                new Consulta
                {
                    DataConsulta = DateOnly.FromDateTime(DateTime.Today),
                    HoraConsulta = new TimeOnly(8, 30),
                    Retorno = false,
                    Status = "EmAtendimento",
                    IdDentista = dentistaCG.Id,
                    IdPaciente = pRoberto.Id,
                    IdServico = svcRotina.Id
                },
                new Consulta
                {
                    DataConsulta = DateOnly.FromDateTime(DateTime.Today),
                    HoraConsulta = new TimeOnly(9, 30),
                    Retorno = false,
                    Status = "Aguardando",
                    IdDentista = dentistaOrto.Id,
                    IdPaciente = pThiago.Id,
                    IdServico = svcOrtodontia.Id
                }
            };

            context.Consultas.AddRange(consultas);
            await context.SaveChangesAsync();
        }

        // ─── 8. ATENDIMENTOS (para consultas concluídas) ─────────────────
        if (!await context.Atendimentos.AnyAsync())
        {
            var consultasConcluidas = await context.Consultas
                .Where(c => c.Status == "Concluida")
                .ToListAsync();

            var atendimentos = new List<Atendimento>
            {
                new Atendimento
                {
                    IdConsulta = consultasConcluidas[0].Id,
                    Descricao = "Limpeza completa com remoção de tártaro.",
                    ProcedimentoRealizado = "Profilaxia e aplicação de flúor.",
                    DataAtendimento = consultasConcluidas[0].DataConsulta,
                    Observacao = "Paciente orientado sobre higiene bucal. Retorno em 6 meses."
                },
                new Atendimento
                {
                    IdConsulta = consultasConcluidas[1].Id,
                    Descricao = "Manutenção do aparelho ortodôntico.",
                    ProcedimentoRealizado = "Troca de elásticos e ajuste dos fios.",
                    DataAtendimento = consultasConcluidas[1].DataConsulta,
                    Observacao = "Tratamento em andamento. Próxima manutenção em 30 dias."
                },
                new Atendimento
                {
                    IdConsulta = consultasConcluidas[2].Id,
                    Descricao = "Tratamento de canal no dente 36.",
                    ProcedimentoRealizado = "Extirpação pulpar, instrumentação e curativo.",
                    DataAtendimento = consultasConcluidas[2].DataConsulta,
                    Observacao = "Segunda sessão necessária para obturação."
                },
                new Atendimento
                {
                    IdConsulta = consultasConcluidas[3].Id,
                    Descricao = "Restauração no dente 14.",
                    ProcedimentoRealizado = "Restauração em resina composta classe II.",
                    DataAtendimento = consultasConcluidas[3].DataConsulta,
                    Observacao = "Paciente orientado a evitar alimentos duros por 24h."
                }
            };

            context.Atendimentos.AddRange(atendimentos);
            await context.SaveChangesAsync();
        }

        // ─── 9. PRONTUÁRIOS e PLANOS DE TRATAMENTO ───────────────────────
        if (!await context.Prontuarios.AnyAsync())
        {
            var pLucas   = await context.Pacientes.FirstAsync(p => p.Cpf == "98765432100");
            var pRoberto = await context.Pacientes.FirstAsync(p => p.Cpf == "32109876500");
            var pFernanda = await context.Pacientes.FirstAsync(p => p.Cpf == "65432109800");

            var svcCanal      = await context.Servicos.FirstAsync(s => s.Nome == "Canal");
            var svcOrtodontia = await context.Servicos.FirstAsync(s => s.Nome == "Ortodontia");
            var svcLimpeza    = await context.Servicos.FirstAsync(s => s.Nome == "Limpeza");
            var svcClareamento = await context.Servicos.FirstAsync(s => s.Nome == "Clareamento");

            var prontuarioLucas = new Prontuario
            {
                IdPaciente = pLucas.Id,
                DataAbertura = new DateOnly(2024, 1, 15),
                DataUltimaAtualizacao = new DateOnly(2025, 5, 22),
                Planos = new List<Planos>
                {
                    new Planos
                    {
                        IdServico = svcLimpeza.Id,
                        Descricao = "Profilaxia semestral",
                        Condicao = "Acúmulo de tártaro moderado",
                        Status = "Concluido",
                        Dente = "Arcada completa",
                        DataCriacao = new DateOnly(2024, 1, 15),
                        DataAtualizacao = new DateOnly(2025, 5, 10)
                    },
                    new Planos
                    {
                        IdServico = svcClareamento.Id,
                        Descricao = "Clareamento dental a laser",
                        Condicao = "Manchas superficiais por café",
                        Status = "Ativo",
                        Dente = "Arcada superior",
                        DataCriacao = new DateOnly(2025, 5, 22),
                        Observacao = "Paciente optou por clareamento caseiro como complemento."
                    }
                }
            };

            var prontuarioRoberto = new Prontuario
            {
                IdPaciente = pRoberto.Id,
                DataAbertura = new DateOnly(2024, 3, 10),
                DataUltimaAtualizacao = new DateOnly(2025, 5, 20),
                Planos = new List<Planos>
                {
                    new Planos
                    {
                        IdServico = svcCanal.Id,
                        Descricao = "Tratamento endodôntico dente 36",
                        Condicao = "Pulpite irreversível",
                        Status = "Ativo",
                        Dente = "36",
                        DataCriacao = new DateOnly(2025, 5, 20),
                        Observacao = "Aguardando segunda sessão para obturação."
                    }
                }
            };

            var prontuarioFernanda = new Prontuario
            {
                IdPaciente = pFernanda.Id,
                DataAbertura = new DateOnly(2023, 8, 5),
                DataUltimaAtualizacao = new DateOnly(2025, 5, 15),
                Planos = new List<Planos>
                {
                    new Planos
                    {
                        IdServico = svcOrtodontia.Id,
                        Descricao = "Tratamento ortodôntico com aparelho metálico",
                        Condicao = "Apinhamento dentário moderado",
                        Status = "Ativo",
                        Dente = "Arcada completa",
                        DataCriacao = new DateOnly(2023, 8, 5),
                        DataAtualizacao = new DateOnly(2025, 5, 15),
                        Observacao = "Previsão de alta em 12 meses."
                    }
                }
            };

            context.Prontuarios.AddRange(prontuarioLucas, prontuarioRoberto, prontuarioFernanda);
            await context.SaveChangesAsync();
        }
    }
}
