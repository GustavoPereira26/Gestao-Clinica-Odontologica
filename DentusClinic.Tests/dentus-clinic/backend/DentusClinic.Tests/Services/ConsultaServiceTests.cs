using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class ConsultaServiceTests
{
    private readonly Mock<IConsultaRepository> _consultaRepositoryMock;
    private readonly Mock<IPacienteRepository> _pacienteRepositoryMock;
    private readonly ConsultaService _service;

    public ConsultaServiceTests()
    {
        _consultaRepositoryMock = new Mock<IConsultaRepository>();
        _pacienteRepositoryMock = new Mock<IPacienteRepository>();
        _service = new ConsultaService(_consultaRepositoryMock.Object, _pacienteRepositoryMock.Object);
    }

    // ─── AgendarAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task AgendarAsync_DeveAgendar_QuandoDadosValidos()
    {
        // Arrange
        var data = new DateOnly(2026, 5, 10);
        var hora = new TimeOnly(9, 0);

        var paciente = new Paciente { Id = 1, Nome = "João" };
        var request = new ConsultaRequest
        {
            IdPaciente = 1,
            IdDentista = 2,
            DataConsulta = data,
            HoraConsulta = hora,
            Retorno = false
        };

        var consultaSalva = new Consulta
        {
            Id = 1,
            IdPaciente = 1,
            IdDentista = 2,
            DataConsulta = data,
            HoraConsulta = hora,
            Status = "Agendada",
            Paciente = paciente,
            Dentista = new Dentista { Id = 2, Nome = "Dr. Carlos" }
        };

        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(paciente);
        _consultaRepositoryMock.Setup(r => r.ExisteConflitoAsync(2, data, hora, null)).ReturnsAsync(false);
        _consultaRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Consulta>())).Returns(Task.CompletedTask);
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(It.IsAny<int>())).ReturnsAsync(consultaSalva);

        // Act
        var resultado = await _service.AgendarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Status.Should().Be("Agendada");
        resultado.NomePaciente.Should().Be("João");
    }

    [Fact]
    public async Task AgendarAsync_DeveLancarExcecao_QuandoPacienteNaoEncontrado()
    {
        // Arrange
        var request = new ConsultaRequest { IdPaciente = 99, IdDentista = 1 };
        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Paciente?)null);

        // Act
        var acao = async () => await _service.AgendarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Paciente não encontrado.");
    }

    [Fact]
    public async Task AgendarAsync_DeveLancarExcecao_QuandoConflitoDeHorario()
    {
        // Arrange
        var data = new DateOnly(2026, 5, 10);
        var hora = new TimeOnly(9, 0);

        var request = new ConsultaRequest
        {
            IdPaciente = 1,
            IdDentista = 2,
            DataConsulta = data,
            HoraConsulta = hora
        };

        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(new Paciente { Id = 1 });
        _consultaRepositoryMock.Setup(r => r.ExisteConflitoAsync(2, data, hora, null)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.AgendarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Dentista já possui consulta agendada nesse horário.");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Consulta?)null);

        // Act
        var resultado = await _service.BuscarPorIdAsync(99);

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RegistrarChegadaAsync ────────────────────────────────────────────────

    [Fact]
    public async Task RegistrarChegadaAsync_DeveAtualizarStatus_QuandoConsultaEncontrada()
    {
        // Arrange
        var consulta = new Consulta { Id = 1, Status = "Agendada" };
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(consulta);
        _consultaRepositoryMock.Setup(r => r.AtualizarAsync(consulta)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RegistrarChegadaAsync(1);

        // Assert
        resultado.Should().BeTrue();
        consulta.Status.Should().Be("Aguardando");
    }

    [Fact]
    public async Task RegistrarChegadaAsync_DeveRetornarFalse_QuandoConsultaNaoEncontrada()
    {
        // Arrange
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Consulta?)null);

        // Act
        var resultado = await _service.RegistrarChegadaAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }

    // ─── CancelarAsync ────────────────────────────────────────────────────────

    [Fact]
    public async Task CancelarAsync_DeveAtualizarStatus_QuandoConsultaEncontrada()
    {
        // Arrange
        var consulta = new Consulta { Id = 1, Status = "Agendada" };
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(consulta);
        _consultaRepositoryMock.Setup(r => r.AtualizarAsync(consulta)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.CancelarAsync(1);

        // Assert
        resultado.Should().BeTrue();
        consulta.Status.Should().Be("Cancelada");
    }

    [Fact]
    public async Task CancelarAsync_DeveRetornarFalse_QuandoConsultaNaoEncontrada()
    {
        // Arrange
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Consulta?)null);

        // Act
        var resultado = await _service.CancelarAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }

    // ─── EditarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task EditarAsync_DeveLancarExcecao_QuandoConflitoDeHorario()
    {
        // Arrange
        var data = new DateOnly(2026, 5, 10);
        var hora = new TimeOnly(9, 0);

        var consulta = new Consulta
        {
            Id = 1,
            IdDentista = 2,
            DataConsulta = data,
            HoraConsulta = hora,
            Paciente = new Paciente { Nome = "João" },
            Dentista = new Dentista { Nome = "Dr. Carlos" }
        };

        var request = new ConsultaRequest
        {
            IdPaciente = 1,
            IdDentista = 2,
            DataConsulta = data,
            HoraConsulta = hora
        };

        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(consulta);
        _consultaRepositoryMock.Setup(r => r.ExisteConflitoAsync(2, data, hora, 1)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.EditarAsync(1, request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Dentista já possui consulta agendada nesse horário.");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoConsultaNaoEncontrada()
    {
        // Arrange
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Consulta?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new ConsultaRequest());

        // Assert
        resultado.Should().BeNull();
    }
}
