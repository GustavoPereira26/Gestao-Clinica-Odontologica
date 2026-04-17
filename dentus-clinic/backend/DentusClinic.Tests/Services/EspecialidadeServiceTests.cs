using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class EspecialidadeServiceTests
{
    private readonly Mock<IEspecialidadeRepository> _especialidadeRepositoryMock;
    private readonly EspecialidadeService _service;

    public EspecialidadeServiceTests()
    {
        _especialidadeRepositoryMock = new Mock<IEspecialidadeRepository>();
        _service = new EspecialidadeService(_especialidadeRepositoryMock.Object);
    }

    // ─── ListarTodosAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task ListarTodosAsync_DeveRetornarLista_QuandoExistemEspecialidades()
    {
        // Arrange
        var lista = new List<Especialidade>
        {
            new() { Id = 1, Nome = "Ortodontia" },
            new() { Id = 2, Nome = "Endodontia" }
        };
        _especialidadeRepositoryMock.Setup(r => r.ListarTodosAsync()).ReturnsAsync(lista);

        // Act
        var resultado = await _service.ListarTodosAsync();

        // Assert
        resultado.Should().HaveCount(2);
        resultado.First().Nome.Should().Be("Ortodontia");
    }

    [Fact]
    public async Task ListarTodosAsync_DeveRetornarListaVazia_QuandoNaoExistemEspecialidades()
    {
        // Arrange
        _especialidadeRepositoryMock.Setup(r => r.ListarTodosAsync()).ReturnsAsync(new List<Especialidade>());

        // Act
        var resultado = await _service.ListarTodosAsync();

        // Assert
        resultado.Should().BeEmpty();
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarEspecialidade_QuandoEncontrada()
    {
        // Arrange
        var especialidade = new Especialidade { Id = 1, Nome = "Periodontia" };
        _especialidadeRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(especialidade);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Periodontia");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrada()
    {
        // Arrange
        _especialidadeRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Especialidade?)null);

        // Act
        var resultado = await _service.BuscarPorIdAsync(99);

        // Assert
        resultado.Should().BeNull();
    }

    // ─── CadastrarAsync ───────────────────────────────────────────────────────

    [Fact]
    public async Task CadastrarAsync_DeveCadastrar_QuandoDadosValidos()
    {
        // Arrange
        var request = new EspecialidadeRequest { Nome = "Implantodontia" };
        _especialidadeRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Especialidade>())).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.CadastrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("Implantodontia");
    }

    // ─── EditarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task EditarAsync_DeveAtualizar_QuandoEncontrada()
    {
        // Arrange
        var especialidade = new Especialidade { Id = 1, Nome = "Antiga" };
        var request = new EspecialidadeRequest { Nome = "Nova" };

        _especialidadeRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(especialidade);
        _especialidadeRepositoryMock.Setup(r => r.AtualizarAsync(especialidade)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.EditarAsync(1, request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Nova");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoNaoEncontrada()
    {
        // Arrange
        _especialidadeRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Especialidade?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new EspecialidadeRequest());

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRetornarTrue_QuandoEncontrada()
    {
        // Arrange
        var especialidade = new Especialidade { Id = 1, Nome = "Ortodontia" };
        _especialidadeRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(especialidade);
        _especialidadeRepositoryMock.Setup(r => r.RemoverAsync(especialidade)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoNaoEncontrada()
    {
        // Arrange
        _especialidadeRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Especialidade?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
