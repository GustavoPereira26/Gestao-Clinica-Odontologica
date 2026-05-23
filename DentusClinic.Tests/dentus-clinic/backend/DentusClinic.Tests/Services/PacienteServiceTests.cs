using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class PacienteServiceTests
{
    private readonly Mock<IPacienteRepository> _pacienteRepositoryMock;
    private readonly Mock<IProntuarioRepository> _prontuarioRepositoryMock;
    private readonly PacienteService _service;

    public PacienteServiceTests()
    {
        _pacienteRepositoryMock = new Mock<IPacienteRepository>();
        _prontuarioRepositoryMock = new Mock<IProntuarioRepository>();
        _service = new PacienteService(_pacienteRepositoryMock.Object, _prontuarioRepositoryMock.Object);
    }

    // ─── CadastrarAsync ───────────────────────────────────────────────────────

    [Fact]
    public async Task CadastrarAsync_DeveCriarPaciente_QuandoDadosValidos()
    {
        // Arrange
        var request = new PacienteRequest
        {
            Nome = "João Silva",
            Cpf = "123.456.789-00",
            Email = "joao@email.com",
            Telefone = "11999999999",
            DataNascimento = new DateOnly(1990, 1, 1),
            Endereco = "Rua A, 123"
        };

        _pacienteRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _pacienteRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Paciente>())).Returns(Task.CompletedTask);
        _prontuarioRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Prontuario>())).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.CadastrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("João Silva");
        resultado.Cpf.Should().Be("123.456.789-00");
    }

    [Fact]
    public async Task CadastrarAsync_DeveCriarProntuarioAutomaticamente_QuandoPacienteCadastrado()
    {
        // Arrange
        var request = new PacienteRequest
        {
            Nome = "Maria Souza",
            Cpf = "987.654.321-00",
            Email = "maria@email.com",
            Telefone = "11988888888",
            DataNascimento = new DateOnly(1985, 5, 15),
            Endereco = "Rua B, 456"
        };

        _pacienteRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _pacienteRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Paciente>())).Returns(Task.CompletedTask);
        _prontuarioRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Prontuario>())).Returns(Task.CompletedTask);

        // Act
        await _service.CadastrarAsync(request);

        // Assert — prontuário deve ser criado uma vez
        _prontuarioRepositoryMock.Verify(r => r.AdicionarAsync(It.IsAny<Prontuario>()), Times.Once);
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoCpfDuplicado()
    {
        // Arrange
        var request = new PacienteRequest { Cpf = "123.456.789-00", Nome = "Teste" };

        _pacienteRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CPF já cadastrado no sistema.");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarPaciente_QuandoEncontrado()
    {
        // Arrange
        var paciente = new Paciente { Id = 1, Nome = "Carlos Lima", Cpf = "111.222.333-44" };
        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(paciente);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Id.Should().Be(1);
        resultado.Nome.Should().Be("Carlos Lima");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Paciente?)null);

        // Act
        var resultado = await _service.BuscarPorIdAsync(99);

        // Assert
        resultado.Should().BeNull();
    }

    // ─── EditarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task EditarAsync_DeveAtualizar_QuandoDadosValidos()
    {
        // Arrange
        var paciente = new Paciente { Id = 1, Nome = "Ana Paula", Cpf = "555.666.777-88" };
        var request = new PacienteRequest
        {
            Nome = "Ana Paula Atualizada",
            Cpf = "555.666.777-88",
            Email = "ana@email.com",
            Telefone = "11977777777",
            DataNascimento = new DateOnly(1992, 3, 20),
            Endereco = "Rua C, 789"
        };

        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(paciente);
        _pacienteRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, 1)).ReturnsAsync(false);
        _pacienteRepositoryMock.Setup(r => r.AtualizarAsync(paciente)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.EditarAsync(1, request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Ana Paula Atualizada");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoIdInexistente()
    {
        // Arrange
        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Paciente?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new PacienteRequest());

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task EditarAsync_DeveLancarExcecao_QuandoCpfJaUsadoPorOutro()
    {
        // Arrange
        var paciente = new Paciente { Id = 1, Nome = "Pedro", Cpf = "000.111.222-33" };
        var request = new PacienteRequest { Cpf = "999.888.777-66", Nome = "Pedro" };

        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(paciente);
        _pacienteRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, 1)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.EditarAsync(1, request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CPF já cadastrado no sistema.");
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRetornarTrue_QuandoPacienteEncontrado()
    {
        // Arrange
        var paciente = new Paciente { Id = 1, Nome = "Lucas" };
        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(paciente);
        _pacienteRepositoryMock.Setup(r => r.RemoverAsync(paciente)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoPacienteNaoEncontrado()
    {
        // Arrange
        _pacienteRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Paciente?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
