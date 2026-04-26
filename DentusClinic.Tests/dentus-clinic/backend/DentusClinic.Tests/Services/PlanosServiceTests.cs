using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class PlanosServiceTests
{
    private readonly Mock<IPlanosRepository> _planosRepositoryMock;
    private readonly PlanosService _service;

    public PlanosServiceTests()
    {
        _planosRepositoryMock = new Mock<IPlanosRepository>();
        _service = new PlanosService(_planosRepositoryMock.Object);
    }

    // ─── ListarTodosAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task ListarTodosAsync_DeveRetornarLista_QuandoExistemPlanos()
    {
        // Arrange
        var lista = new List<Planos>
        {
            new() { Id = 1, IdProntuario = 1, IdServico = 1, Status = "Ativo", Servico = new Servico { Nome = "Limpeza" } },
            new() { Id = 2, IdProntuario = 1, IdServico = 2, Status = "Concluido", Servico = new Servico { Nome = "Canal" } }
        };
        _planosRepositoryMock.Setup(r => r.ListarTodosAsync()).ReturnsAsync(lista);

        // Act
        var resultado = await _service.ListarTodosAsync();

        // Assert
        resultado.Should().HaveCount(2);
        resultado.First().NomeServico.Should().Be("Limpeza");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarPlano_QuandoEncontrado()
    {
        // Arrange
        var plano = new Planos
        {
            Id = 1, IdProntuario = 1, IdServico = 1,
            Descricao = "Plano de limpeza",
            Status = "Ativo",
            Servico = new Servico { Nome = "Limpeza" }
        };
        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(plano);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Descricao.Should().Be("Plano de limpeza");
        resultado.NomeServico.Should().Be("Limpeza");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Planos?)null);

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
        var request = new PlanosRequest
        {
            IdProntuario = 1,
            IdServico = 1,
            Descricao = "Tratamento completo",
            Condicao = "Boa",
            Status = "Ativo",
            Observacao = "Sem observações"
        };

        var planoSalvo = new Planos
        {
            Id = 1,
            IdProntuario = 1,
            IdServico = 1,
            Descricao = "Tratamento completo",
            Status = "Ativo",
            Servico = new Servico { Nome = "Limpeza" }
        };

        _planosRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Planos>())).Returns(Task.CompletedTask);
        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(It.IsAny<int>())).ReturnsAsync(planoSalvo);

        // Act
        var resultado = await _service.CadastrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Descricao.Should().Be("Tratamento completo");
        resultado.Status.Should().Be("Ativo");
    }

    // ─── EditarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task EditarAsync_DeveAtualizar_QuandoEncontrado()
    {
        // Arrange
        var plano = new Planos
        {
            Id = 1, IdProntuario = 1, IdServico = 1,
            Status = "Ativo", Servico = new Servico { Nome = "Limpeza" }
        };
        var request = new PlanosRequest
        {
            IdProntuario = 1, IdServico = 2,
            Descricao = "Atualizado",
            Status = "Concluido"
        };
        var planoAtualizado = new Planos
        {
            Id = 1, IdProntuario = 1, IdServico = 2,
            Descricao = "Atualizado", Status = "Concluido",
            Servico = new Servico { Nome = "Canal" }
        };

        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(plano);
        _planosRepositoryMock.Setup(r => r.AtualizarAsync(plano)).Returns(Task.CompletedTask);
        _planosRepositoryMock.SetupSequence(r => r.BuscarPorIdAsync(1))
            .ReturnsAsync(plano)
            .ReturnsAsync(planoAtualizado);

        // Act
        var resultado = await _service.EditarAsync(1, request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Status.Should().Be("Concluido");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Planos?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new PlanosRequest());

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRetornarTrue_QuandoEncontrado()
    {
        // Arrange
        var plano = new Planos { Id = 1, Status = "Ativo", Servico = new Servico() };
        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(plano);
        _planosRepositoryMock.Setup(r => r.RemoverAsync(plano)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoNaoEncontrado()
    {
        // Arrange
        _planosRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Planos?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
