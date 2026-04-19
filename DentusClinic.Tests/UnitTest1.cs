using Xunit;
using FluentAssertions;
using DentusClinic.API.Services;
using DentusClinic.API.Models;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Data;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.Tests;

public class ConsultaServiceTests
{
    private AppDbContext CriarBancoEmMemoria()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    // RN01 — Paciente deve estar cadastrado para agendar consulta
    [Fact(DisplayName = "RN01 - Deve lançar erro ao agendar consulta com paciente inexistente")]
    public async Task AgendarConsulta_PacienteInexistente_DeveLancarExcecao()
    {
        var db = CriarBancoEmMemoria();
        var service = new ConsultaService(db);

        var dto = new ConsultaRequest
        {
            IdPaciente = 999,
            IdDentista = 1,
            DataConsulta = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            HoraConsulta = new TimeOnly(10, 0)
        };

        var acao = async () => await service.AgendarAsync(dto);

        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Paciente*");
    }

    // RN03 — Dentista não pode ter duas consultas no mesmo horário
    [Fact(DisplayName = "RN03 - Deve lançar erro ao agendar consulta em horário já ocupado")]
    public async Task AgendarConsulta_HorarioOcupado_DeveLancarExcecao()
    {
        var db = CriarBancoEmMemoria();

        db.Pacientes.Add(new Paciente { Id = 1, Nome = "João Silva", Cpf = "111.111.111-11" });
        db.Dentistas.Add(new Dentista { Id = 1, Nome = "Dr. Carlos", Cpf = "222.222.222-22", Cro = "SP-001" });
        db.Consultas.Add(new Consulta
        {
            Id = 1,
            IdPaciente = 1,
            IdDentista = 1,
            DataConsulta = new DateOnly(2026, 6, 10),
            HoraConsulta = new TimeOnly(10, 0),
            Status = "Agendada"
        });
        await db.SaveChangesAsync();

        var service = new ConsultaService(db);

        var dto = new ConsultaRequest
        {
            IdPaciente = 1,
            IdDentista = 1,
            DataConsulta = new DateOnly(2026, 6, 10),
            HoraConsulta = new TimeOnly(10, 0)
        };

        var acao = async () => await service.AgendarAsync(dto);

        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*horário*");
    }

    [Fact(DisplayName = "RN03 - Deve permitir agendar consulta em horário diferente para o mesmo dentista")]
    public async Task AgendarConsulta_HorarioDiferente_DevePermitir()
    {
        var db = CriarBancoEmMemoria();

        db.Pacientes.Add(new Paciente { Id = 1, Nome = "João Silva", Cpf = "111.111.111-11" });
        db.Dentistas.Add(new Dentista { Id = 1, Nome = "Dr. Carlos", Cpf = "222.222.222-22", Cro = "SP-001" });
        db.Consultas.Add(new Consulta
        {
            Id = 1,
            IdPaciente = 1,
            IdDentista = 1,
            DataConsulta = new DateOnly(2026, 6, 10),
            HoraConsulta = new TimeOnly(10, 0),
            Status = "Agendada"
        });
        await db.SaveChangesAsync();

        var service = new ConsultaService(db);

        var dto = new ConsultaRequest
        {
            IdPaciente = 1,
            IdDentista = 1,
            DataConsulta = new DateOnly(2026, 6, 10),
            HoraConsulta = new TimeOnly(14, 0)
        };

        var resultado = await service.AgendarAsync(dto);

        resultado.Should().NotBeNull();
        resultado.Status.Should().Be("Agendada");
    }

    // RN07 — Consultas canceladas não são deletadas
    [Fact(DisplayName = "RN07 - Cancelamento deve alterar status para Cancelada sem deletar o registro")]
    public async Task CancelarConsulta_DeveAlterarStatusSemDeletar()
    {
        var db = CriarBancoEmMemoria();

        db.Consultas.Add(new Consulta
        {
            Id = 1,
            IdPaciente = 1,
            IdDentista = 1,
            DataConsulta = new DateOnly(2026, 6, 10),
            HoraConsulta = new TimeOnly(10, 0),
            Status = "Agendada"
        });
        await db.SaveChangesAsync();

        var service = new ConsultaService(db);
        var resultado = await service.CancelarAsync(1);

        resultado.Should().BeTrue();

        var consulta = await db.Consultas.FindAsync(1);
        consulta.Should().NotBeNull();
        consulta!.Status.Should().Be("Cancelada");
    }

    // RF12 — Registro de chegada
    [Fact(DisplayName = "RF12 - Registro de chegada deve atualizar status para Aguardando")]
    public async Task RegistrarChegada_DeveAtualizarStatusParaAguardando()
    {
        var db = CriarBancoEmMemoria();

        db.Consultas.Add(new Consulta
        {
            Id = 1,
            IdPaciente = 1,
            IdDentista = 1,
            DataConsulta = new DateOnly(2026, 6, 10),
            HoraConsulta = new TimeOnly(10, 0),
            Status = "Agendada"
        });
        await db.SaveChangesAsync();

        var service = new ConsultaService(db);
        var resultado = await service.RegistrarChegadaAsync(1);

        resultado.Should().BeTrue();

        var consulta = await db.Consultas.FindAsync(1);
        consulta!.Status.Should().Be("Aguardando");
    }

    [Fact(DisplayName = "RF12 - Deve retornar false ao registrar chegada de consulta inexistente")]
    public async Task RegistrarChegada_ConsultaInexistente_DeveRetornarFalse()
    {
        var db = CriarBancoEmMemoria();
        var service = new ConsultaService(db);

        var resultado = await service.RegistrarChegadaAsync(999);

        resultado.Should().BeFalse();
    }
}

public class PacienteServiceTests
{
    private AppDbContext CriarBancoEmMemoria()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    // RN08 — Prontuário criado automaticamente ao cadastrar paciente
    [Fact(DisplayName = "RN08 - Deve criar prontuário automaticamente ao cadastrar paciente")]
    public async Task CadastrarPaciente_DeveCriarProntuarioAutomaticamente()
    {
        var db = CriarBancoEmMemoria();
        var service = new PacienteService(db);

        var dto = new PacienteRequest
        {
            Nome = "Maria Souza",
            Cpf = "333.333.333-33",
            Telefone = "(15) 99999-0001",
            DataNascimento = new DateOnly(1990, 1, 1)
        };

        var resultado = await service.CadastrarAsync(dto);

        resultado.Should().NotBeNull();

        var prontuario = db.Prontuarios.FirstOrDefault(p => p.IdPaciente == resultado.Id);
        prontuario.Should().NotBeNull();
    }

    // RF01 — CPF duplicado
    [Fact(DisplayName = "RF01 - Deve lançar erro ao cadastrar paciente com CPF duplicado")]
    public async Task CadastrarPaciente_CpfDuplicado_DeveLancarExcecao()
    {
        var db = CriarBancoEmMemoria();

        db.Pacientes.Add(new Paciente
        {
            Id = 1,
            Nome = "Carlos Lima",
            Cpf = "444.444.444-44"
        });
        await db.SaveChangesAsync();

        var service = new PacienteService(db);

        var dto = new PacienteRequest
        {
            Nome = "Outro Nome",
            Cpf = "444.444.444-44",
            DataNascimento = new DateOnly(1990, 1, 1)
        };

        var acao = async () => await service.CadastrarAsync(dto);

        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*CPF*");
    }

    // RF02 — Edição de paciente inexistente
    [Fact(DisplayName = "RF02 - Deve retornar null ao editar paciente inexistente")]
    public async Task EditarPaciente_Inexistente_DeveRetornarNull()
    {
        var db = CriarBancoEmMemoria();
        var service = new PacienteService(db);

        var dto = new PacienteEditarRequest { Nome = "Nome Novo" };

        var resultado = await service.EditarAsync(999, dto);

        resultado.Should().BeNull();
    }

    // RF03 — Remoção de paciente
    [Fact(DisplayName = "RF03 - Deve remover paciente existente com sucesso")]
    public async Task RemoverPaciente_Existente_DeveRetornarTrue()
    {
        var db = CriarBancoEmMemoria();

        db.Pacientes.Add(new Paciente { Id = 1, Nome = "Ana Lima", Cpf = "555.555.555-55" });
        await db.SaveChangesAsync();

        var service = new PacienteService(db);
        var resultado = await service.RemoverAsync(1);

        resultado.Should().BeTrue();
        db.Pacientes.Find(1).Should().BeNull();
    }

    [Fact(DisplayName = "RF03 - Deve retornar false ao tentar remover paciente inexistente")]
    public async Task RemoverPaciente_Inexistente_DeveRetornarFalse()
    {
        var db = CriarBancoEmMemoria();
        var service = new PacienteService(db);

        var resultado = await service.RemoverAsync(999);

        resultado.Should().BeFalse();
    }
}