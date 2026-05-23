using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class ServicoServiceTests
{
    private readonly Mock<IServicoRepository> _servicoRepositoryMock;
    private readonly ServicoService _service;

    public ServicoServiceTests()
    {
        _servicoRepositoryMock = new Mock<IServicoRepository>();
        _service = new ServicoService(_servicoRepositoryMock.Object);
    }

    // ─── ListarTodosAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task ListarTodosAsync_DeveRetornarLista_QuandoExistemServicos()
    {
        // Arrange
        var lista = new List<Servico>
        {
            new() { Id = 1, Nome = "Limpeza" },
            new() { Id = 2, Nome = "Extração" },
            new() { Id = 3, Nome = "Canal" }
        };
        _servicoRepositoryMock.Setup(r => r.ListarTodosAsync()).ReturnsAsync(lista);

        // Act
        var resultado = await _service.ListarTodosAsync();

        // Assert
        resultado.Should().HaveCount(3);
        resultado.First().Nome.Should().Be("Limpeza");
    }

    [Fact]
    public async Task ListarTodosAsync_DeveRetornarListaVazia_QuandoNaoExistemServicos()
    {
        // Arrange
        _servicoRepositoryMock.Setup(r => r.ListarTodosAsync()).ReturnsAsync(new List<Servico>());

        // Act
        var resultado = await _service.ListarTodosAsync();

        // Assert
        resultado.Should().BeEmpty();
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarServico_QuandoEncontrado()
    {
        // Arrange
        var servico = new Servico { Id = 1, Nome = "Clareamento" };
        _servicoRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(servico);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Clareamento");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _servicoRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Servico?)null);

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
        var request = new ServicoRequest { Nome = "Restauração" };
        _servicoRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Servico>())).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.CadastrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("Restauração");
    }

    // ─── EditarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task EditarAsync_DeveAtualizar_QuandoEncontrado()
    {
        // Arrange
        var servico = new Servico { Id = 1, Nome = "Antigo" };
        var request = new ServicoRequest { Nome = "Novo" };

        _servicoRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(servico);
        _servicoRepositoryMock.Setup(r => r.AtualizarAsync(servico)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.EditarAsync(1, request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Novo");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _servicoRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Servico?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new ServicoRequest());

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRetornarTrue_QuandoEncontrado()
    {
        // Arrange
        var servico = new Servico { Id = 1, Nome = "Limpeza" };
        _servicoRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(servico);
        _servicoRepositoryMock.Setup(r => r.RemoverAsync(servico)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoNaoEncontrado()
    {
        // Arrange
        _servicoRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Servico?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
