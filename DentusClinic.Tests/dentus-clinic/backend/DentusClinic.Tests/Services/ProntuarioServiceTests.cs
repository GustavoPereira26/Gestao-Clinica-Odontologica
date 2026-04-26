using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class ProntuarioServiceTests
{
    private readonly Mock<IProntuarioRepository> _prontuarioRepositoryMock;
    private readonly ProntuarioService _service;

    public ProntuarioServiceTests()
    {
        _prontuarioRepositoryMock = new Mock<IProntuarioRepository>();
        _service = new ProntuarioService(_prontuarioRepositoryMock.Object);
    }

    // ─── ListarTodosAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task ListarTodosAsync_DeveRetornarLista_QuandoExistemProntuarios()
    {
        // Arrange
        var lista = new List<Prontuario>
        {
            new() { Id = 1, IdPaciente = 1, DataAbertura = new DateOnly(2026, 1, 10), Paciente = new Paciente { Nome = "João" } },
            new() { Id = 2, IdPaciente = 2, DataAbertura = new DateOnly(2026, 2, 15), Paciente = new Paciente { Nome = "Maria" } }
        };
        _prontuarioRepositoryMock.Setup(r => r.ListarTodosAsync()).ReturnsAsync(lista);

        // Act
        var resultado = await _service.ListarTodosAsync();

        // Assert
        resultado.Should().HaveCount(2);
        resultado.First().NomePaciente.Should().Be("João");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarProntuario_QuandoEncontrado()
    {
        // Arrange
        var prontuario = new Prontuario
        {
            Id = 1,
            IdPaciente = 1,
            DataAbertura = new DateOnly(2026, 3, 5),
            Paciente = new Paciente { Nome = "Carlos" }
        };
        _prontuarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(prontuario);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.NomePaciente.Should().Be("Carlos");
        resultado.DataAbertura.Should().Be(new DateOnly(2026, 3, 5));
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _prontuarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Prontuario?)null);

        // Act
        var resultado = await _service.BuscarPorIdAsync(99);

        // Assert
        resultado.Should().BeNull();
    }

    // ─── BuscarPorPacienteAsync ───────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorPacienteAsync_DeveRetornarProntuario_QuandoEncontrado()
    {
        // Arrange
        var prontuario = new Prontuario
        {
            Id = 1,
            IdPaciente = 5,
            DataAbertura = new DateOnly(2026, 4, 1),
            Paciente = new Paciente { Nome = "Ana Paula" }
        };
        _prontuarioRepositoryMock.Setup(r => r.BuscarPorPacienteAsync(5)).ReturnsAsync(prontuario);

        // Act
        var resultado = await _service.BuscarPorPacienteAsync(5);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.IdPaciente.Should().Be(5);
        resultado.NomePaciente.Should().Be("Ana Paula");
    }

    [Fact]
    public async Task BuscarPorPacienteAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _prontuarioRepositoryMock.Setup(r => r.BuscarPorPacienteAsync(99)).ReturnsAsync((Prontuario?)null);

        // Act
        var resultado = await _service.BuscarPorPacienteAsync(99);

        // Assert
        resultado.Should().BeNull();
    }
}
