using DentusClinic.API.Enums;
using DentusClinic.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // ─── 1. ESPECIALIDADES (upsert por Nome) ───────────────────────────
        var especialidadesNomes = new[]
        {
            "Clínica Geral", "Ortodontia", "Endodontia", "Periodontia", "Implantodontia"
        };
        foreach (var nome in especialidadesNomes)
        {
            if (!await context.Especialidades.AnyAsync(e => e.Nome == nome))
                context.Especialidades.Add(new Especialidade { Nome = nome });
        }
        await context.SaveChangesAsync();

        // Carrega especialidades para uso nos próximos blocos
        var espClinicaGeral   = await context.Especialidades.FirstOrDefaultAsync(e => e.Nome == "Clínica Geral");
        var espOrtodontia     = await context.Especialidades.FirstOrDefaultAsync(e => e.Nome == "Ortodontia");
        var espEndodontia     = await context.Especialidades.FirstOrDefaultAsync(e => e.Nome == "Endodontia");
        var espPeriodontia    = await context.Especialidades.FirstOrDefaultAsync(e => e.Nome == "Periodontia");
        var espImplantodontia = await context.Especialidades.FirstOrDefaultAsync(e => e.Nome == "Implantodontia");

        // ─── 2. SERVIÇOS (upsert por Nome, com IdEspecialidade correto) ────────
        // Cada serviço vinculado à especialidade correspondente
        var servicosMock = new[]
        {
            ("Consulta de Rotina",  espClinicaGeral?.Id),
            ("Limpeza",             espClinicaGeral?.Id),
            ("Restauração",        espClinicaGeral?.Id),
            ("Extração",           espClinicaGeral?.Id),
            ("Canal",               espEndodontia?.Id),
            ("Ortodontia",          espOrtodontia?.Id),
            ("Clareamento",         espClinicaGeral?.Id),
            ("Raio-X",              espClinicaGeral?.Id),
            ("Limpeza Periodontal", espPeriodontia?.Id),
            ("Implante",            espImplantodontia?.Id)
        };
        foreach (var (nome, idEsp) in servicosMock)
        {
            if (!await context.Servicos.AnyAsync(s => s.Nome == nome))
                context.Servicos.Add(new Servico { Nome = nome, IdEspecialidade = idEsp });
        }
        await context.SaveChangesAsync();

        // ─── 3. LOGINS (upsert por e-mail) ───────────────────────────────
        var loginsMock = new[]
        {
            ("admin@dentusclinic.com",         "Admin@123",       TiposAcessoEnum.ADMINISTRADOR),
            ("ana.souza@dentusclinic.com",      "Dentista@123",    TiposAcessoEnum.DENTISTA),
            ("carlos.lima@dentusclinic.com",    "Dentista@123",    TiposAcessoEnum.DENTISTA),
            ("mariana.faria@dentusclinic.com",  "Dentista@123",    TiposAcessoEnum.DENTISTA),
            ("julia.mendes@dentusclinic.com",   "Secretaria@123",  TiposAcessoEnum.SECRETARIA)
        };
        foreach (var (email, senha, tipo) in loginsMock)
        {
            if (!await context.Logins.AnyAsync(l => l.Email == email))
                context.Logins.Add(new Login
                {
                    Email = email,
                    Senha = BCrypt.Net.BCrypt.HashPassword(senha),
                    TipoAcesso = tipo
                });
        }
        await context.SaveChangesAsync();

        // ─── 4. FUNCIONÁRIOS (upsert por CPF) ─────────────────────────────
        if (!await context.Funcionarios.AnyAsync(f => f.Cpf == "32165498700"))
        {
            var loginSecretaria = await context.Logins
                .FirstOrDefaultAsync(l => l.Email == "julia.mendes@dentusclinic.com");
            if (loginSecretaria != null)
            {
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
        }

        // ─── 5. DENTISTAS (upsert por CRO) ───────────────────────────────
        if (!await context.Dentistas.AnyAsync())
        {
            var loginAna     = await context.Logins.FirstOrDefaultAsync(l => l.Email == "ana.souza@dentusclinic.com");
            var loginCarlos  = await context.Logins.FirstOrDefaultAsync(l => l.Email == "carlos.lima@dentusclinic.com");
            var loginMariana = await context.Logins.FirstOrDefaultAsync(l => l.Email == "mariana.faria@dentusclinic.com");

            if (espClinicaGeral != null && loginAna != null)
                context.Dentistas.Add(new Dentista
                {
                    Nome = "Dra. Ana Souza",
                    Cpf = "45678912300",
                    Telefone = "(11) 98765-4321",
                    DataNascimento = new DateOnly(1985, 3, 15),
                    Cro = "SP-12345",
                    IdEspecialidade = espClinicaGeral.Id,
                    IdAcesso = loginAna.Id
                });

            if (espOrtodontia != null && loginCarlos != null)
                context.Dentistas.Add(new Dentista
                {
                    Nome = "Dr. Carlos Lima",
                    Cpf = "78912345600",
                    Telefone = "(11) 97654-3210",
                    DataNascimento = new DateOnly(1980, 7, 22),
                    Cro = "SP-67890",
                    IdEspecialidade = espOrtodontia.Id,
                    IdAcesso = loginCarlos.Id
                });

            if (espEndodontia != null && loginMariana != null)
                context.Dentistas.Add(new Dentista
                {
                    Nome = "Dra. Mariana Faria",
                    Cpf = "12345678900",
                    Telefone = "(11) 96543-2109",
                    DataNascimento = new DateOnly(1990, 11, 5),
                    Cro = "SP-11223",
                    IdEspecialidade = espEndodontia.Id,
                    IdAcesso = loginMariana.Id
                });

            await context.SaveChangesAsync();
        }

        // ─── 6. PACIENTES (upsert por CPF) ───────────────────────────────
        var pacientesMock = new[]
        {
            ("Lucas Oliveira",  "98765432100", "(11) 91111-2222", new DateOnly(1992,  6, 10), "lucas.oliveira@email.com",  "Rua das Flores, 123 - Sorocaba/SP"),
            ("Fernanda Costa",  "65432109800", "(11) 92222-3333", new DateOnly(1998,  1, 25), "fernanda.costa@email.com",  "Av. Brasil, 456 - Sorocaba/SP"),
            ("Roberto Alves",   "32109876500", "(11) 93333-4444", new DateOnly(1975,  9, 14), "roberto.alves@email.com",   "Rua XV de Novembro, 789 - Sorocaba/SP"),
            ("Camila Rocha",    "10987654300", "(11) 94444-5555", new DateOnly(2001,  3, 30), "camila.rocha@email.com",    "Rua da Paz, 321 - Sorocaba/SP"),
            ("Thiago Pereira",  "21098765400", "(11) 95555-6666", new DateOnly(1988, 12,  5), "thiago.pereira@email.com",  "Alameda Santos, 654 - Sorocaba/SP")
        };
        foreach (var (nome, cpf, tel, nasc, email, endereco) in pacientesMock)
        {
            if (!await context.Pacientes.AnyAsync(p => p.Cpf == cpf))
                context.Pacientes.Add(new Paciente
                {
                    Nome = nome, Cpf = cpf, Telefone = tel,
                    DataNascimento = nasc, Email = email,
                    Endereco = endereco, Ativo = true
                });
        }
        await context.SaveChangesAsync();

        // ─── 7. CONSULTAS ────────────────────────────────────────────────
        if (!await context.Consultas.AnyAsync())
        {
            var dentistaCG   = await context.Dentistas.FirstOrDefaultAsync(d => d.Cro == "SP-12345");
            var dentistaOrto = await context.Dentistas.FirstOrDefaultAsync(d => d.Cro == "SP-67890");
            var dentistaEndo = await context.Dentistas.FirstOrDefaultAsync(d => d.Cro == "SP-11223");

            var pLucas    = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "98765432100");
            var pFernanda = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "65432109800");
            var pRoberto  = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "32109876500");
            var pCamila   = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "10987654300");
            var pThiago   = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "21098765400");

            var svcRotina      = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Consulta de Rotina");
            var svcLimpeza     = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Limpeza");
            var svcRestauracao = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Restauração");
            var svcCanal       = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Canal");
            var svcOrtodontia  = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Ortodontia");

            if (dentistaCG != null && dentistaOrto != null && dentistaEndo != null
                && pLucas != null && pFernanda != null && pRoberto != null
                && pCamila != null && pThiago != null)
            {
                context.Consultas.AddRange(
                    new Consulta
                    {
                        DataConsulta = new DateOnly(2025, 5, 10), HoraConsulta = new TimeOnly(9, 0),
                        Retorno = false, Status = "Concluida",
                        IdDentista = dentistaCG.Id, IdPaciente = pLucas.Id, IdServico = svcLimpeza?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = new DateOnly(2025, 5, 15), HoraConsulta = new TimeOnly(10, 30),
                        Retorno = false, Status = "Concluida",
                        IdDentista = dentistaOrto.Id, IdPaciente = pFernanda.Id, IdServico = svcOrtodontia?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = new DateOnly(2025, 5, 20), HoraConsulta = new TimeOnly(14, 0),
                        Retorno = false, Status = "Concluida",
                        IdDentista = dentistaEndo.Id, IdPaciente = pRoberto.Id, IdServico = svcCanal?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = new DateOnly(2025, 5, 22), HoraConsulta = new TimeOnly(8, 0),
                        Retorno = true, Status = "Concluida",
                        IdDentista = dentistaCG.Id, IdPaciente = pLucas.Id, IdServico = svcRestauracao?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = new DateOnly(2025, 5, 28), HoraConsulta = new TimeOnly(11, 0),
                        Retorno = false, Status = "Cancelada",
                        IdDentista = dentistaOrto.Id, IdPaciente = pCamila.Id, IdServico = svcOrtodontia?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(2)), HoraConsulta = new TimeOnly(9, 0),
                        Retorno = false, Status = "Agendada",
                        IdDentista = dentistaCG.Id, IdPaciente = pCamila.Id, IdServico = svcLimpeza?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(3)), HoraConsulta = new TimeOnly(10, 0),
                        Retorno = false, Status = "Agendada",
                        IdDentista = dentistaEndo.Id, IdPaciente = pThiago.Id, IdServico = svcCanal?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(5)), HoraConsulta = new TimeOnly(14, 30),
                        Retorno = true, Status = "Agendada",
                        IdDentista = dentistaOrto.Id, IdPaciente = pFernanda.Id, IdServico = svcOrtodontia?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = DateOnly.FromDateTime(DateTime.Today), HoraConsulta = new TimeOnly(8, 30),
                        Retorno = false, Status = "EmAtendimento",
                        IdDentista = dentistaCG.Id, IdPaciente = pRoberto.Id, IdServico = svcRotina?.Id
                    },
                    new Consulta
                    {
                        DataConsulta = DateOnly.FromDateTime(DateTime.Today), HoraConsulta = new TimeOnly(9, 30),
                        Retorno = false, Status = "Aguardando",
                        IdDentista = dentistaOrto.Id, IdPaciente = pThiago.Id, IdServico = svcOrtodontia?.Id
                    }
                );
                await context.SaveChangesAsync();
            }
        }

        // ─── 8. ATENDIMENTOS ─────────────────────────────────────────────
        if (!await context.Atendimentos.AnyAsync())
        {
            var consultasConcluidas = await context.Consultas
                .Where(c => c.Status == "Concluida")
                .ToListAsync();

            if (consultasConcluidas.Count >= 4)
            {
                context.Atendimentos.AddRange(
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
                );
                await context.SaveChangesAsync();
            }
        }

        // ─── 9. PRONTUÁRIOS e PLANOS ─────────────────────────────────────
        if (!await context.Prontuarios.AnyAsync())
        {
            var pLucas    = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "98765432100");
            var pRoberto  = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "32109876500");
            var pFernanda = await context.Pacientes.FirstOrDefaultAsync(p => p.Cpf == "65432109800");

            var svcCanal       = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Canal");
            var svcOrtodontia  = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Ortodontia");
            var svcLimpeza     = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Limpeza");
            var svcClareamento = await context.Servicos.FirstOrDefaultAsync(s => s.Nome == "Clareamento");

            if (pLucas != null)
                context.Prontuarios.Add(new Prontuario
                {
                    IdPaciente = pLucas.Id,
                    DataAbertura = new DateOnly(2024, 1, 15),
                    DataUltimaAtualizacao = new DateOnly(2025, 5, 22),
                    Planos = new List<Planos>
                    {
                        new Planos
                        {
                            IdServico = svcLimpeza?.Id,
                            Descricao = "Profilaxia semestral",
                            Condicao = "Acúmulo de tártaro moderado",
                            Status = "Concluido", Dente = "Arcada completa",
                            DataCriacao = new DateOnly(2024, 1, 15),
                            DataAtualizacao = new DateOnly(2025, 5, 10)
                        },
                        new Planos
                        {
                            IdServico = svcClareamento?.Id,
                            Descricao = "Clareamento dental a laser",
                            Condicao = "Manchas superficiais por café",
                            Status = "Ativo", Dente = "Arcada superior",
                            DataCriacao = new DateOnly(2025, 5, 22),
                            Observacao = "Paciente optou por clareamento caseiro como complemento."
                        }
                    }
                });

            if (pRoberto != null)
                context.Prontuarios.Add(new Prontuario
                {
                    IdPaciente = pRoberto.Id,
                    DataAbertura = new DateOnly(2024, 3, 10),
                    DataUltimaAtualizacao = new DateOnly(2025, 5, 20),
                    Planos = new List<Planos>
                    {
                        new Planos
                        {
                            IdServico = svcCanal?.Id,
                            Descricao = "Tratamento endodôntico dente 36",
                            Condicao = "Pulpite irreversível",
                            Status = "Ativo", Dente = "36",
                            DataCriacao = new DateOnly(2025, 5, 20),
                            Observacao = "Aguardando segunda sessão para obturação."
                        }
                    }
                });

            if (pFernanda != null)
                context.Prontuarios.Add(new Prontuario
                {
                    IdPaciente = pFernanda.Id,
                    DataAbertura = new DateOnly(2023, 8, 5),
                    DataUltimaAtualizacao = new DateOnly(2025, 5, 15),
                    Planos = new List<Planos>
                    {
                        new Planos
                        {
                            IdServico = svcOrtodontia?.Id,
                            Descricao = "Tratamento ortodôntico com aparelho metálico",
                            Condicao = "Apinhamento dentário moderado",
                            Status = "Ativo", Dente = "Arcada completa",
                            DataCriacao = new DateOnly(2023, 8, 5),
                            DataAtualizacao = new DateOnly(2025, 5, 15),
                            Observacao = "Previsão de alta em 12 meses."
                        }
                    }
                });

            await context.SaveChangesAsync();
        }
    }
}
