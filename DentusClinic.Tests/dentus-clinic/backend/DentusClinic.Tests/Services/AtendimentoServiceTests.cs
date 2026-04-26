using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class AtendimentoServiceTests
{
    private readonly Mock<IAtendimentoRepository> _atendimentoRepositoryMock;
    private readonly Mock<IConsultaRepository> _consultaRepositoryMock;
    private readonly AtendimentoService _service;

    public AtendimentoServiceTests()
    {
        _atendimentoRepositoryMock = new Mock<IAtendimentoRepository>();
        _consultaRepositoryMock = new Mock<IConsultaRepository>();
        _service = new AtendimentoService(_atendimentoRepositoryMock.Object, _consultaRepositoryMock.Object);
    }

    // ─── RegistrarAsync ───────────────────────────────────────────────────────

    [Fact]
    public async Task RegistrarAsync_DeveRegistrar_QuandoDadosValidos()
    {
        // Arrange
        var consulta = new Consulta { Id = 1, Status = "EmAtendimento" };
        var request = new AtendimentoRequest
        {
            IdConsulta = 1,
            Descricao = "Consulta de rotina",
            ProcedimentoRealizado = "Limpeza",
            DataAtendimento = new DateOnly(2026, 5, 10),
            Observacao = "Sem observações"
        };

        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(consulta);
        _atendimentoRepositoryMock.Setup(r => r.ExistePorConsultaAsync(1)).ReturnsAsync(false);
        _atendimentoRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Atendimento>())).Returns(Task.CompletedTask);
        _consultaRepositoryMock.Setup(r => r.AtualizarAsync(consulta)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RegistrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.IdConsulta.Should().Be(1);
        resultado.Descricao.Should().Be("Consulta de rotina");
    }

    [Fact]
    public async Task RegistrarAsync_DeveAtualizarStatusConsulta_ParaConcluida()
    {
        // Arrange
        var consulta = new Consulta { Id = 1, Status = "EmAtendimento" };
        var request = new AtendimentoRequest
        {
            IdConsulta = 1,
            DataAtendimento = new DateOnly(2026, 5, 10)
        };

        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(consulta);
        _atendimentoRepositoryMock.Setup(r => r.ExistePorConsultaAsync(1)).ReturnsAsync(false);
        _atendimentoRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Atendimento>())).Returns(Task.CompletedTask);
        _consultaRepositoryMock.Setup(r => r.AtualizarAsync(consulta)).Returns(Task.CompletedTask);

        // Act
        await _service.RegistrarAsync(request);

        // Assert — status da consulta deve ter sido atualizado
        consulta.Status.Should().Be("Concluida");
        _consultaRepositoryMock.Verify(r => r.AtualizarAsync(consulta), Times.Once);
    }

    [Fact]
    public async Task RegistrarAsync_DeveLancarExcecao_QuandoConsultaNaoEncontrada()
    {
        // Arrange
        var request = new AtendimentoRequest { IdConsulta = 99 };
        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Consulta?)null);

        // Act
        var acao = async () => await _service.RegistrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Consulta não encontrada.");
    }

    [Fact]
    public async Task RegistrarAsync_DeveLancarExcecao_QuandoAtendimentoDuplicadoNaConsulta()
    {
        // Arrange
        var consulta = new Consulta { Id = 1, Status = "EmAtendimento" };
        var request = new AtendimentoRequest { IdConsulta = 1 };

        _consultaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(consulta);
        _atendimentoRepositoryMock.Setup(r => r.ExistePorConsultaAsync(1)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.RegistrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Já existe um atendimento registrado para esta consulta.");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarAtendimento_QuandoEncontrado()
    {
        // Arrange
        var atendimento = new Atendimento { Id = 1, IdConsulta = 1, Descricao = "Limpeza" };
        _atendimentoRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(atendimento);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Id.Should().Be(1);
        resultado.Descricao.Should().Be("Limpeza");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _atendimentoRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Atendimento?)null);

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
        var atendimento = new Atendimento { Id = 1, IdConsulta = 1, Descricao = "Antiga" };
        var request = new AtendimentoRequest
        {
            IdConsulta = 1,
            Descricao = "Nova descrição",
            ProcedimentoRealizado = "Canal",
            DataAtendimento = new DateOnly(2026, 5, 10),
            Observacao = "Retorno em 7 dias"
        };

        _atendimentoRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(atendimento);
        _atendimentoRepositoryMock.Setup(r => r.AtualizarAsync(atendimento)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.EditarAsync(1, request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Descricao.Should().Be("Nova descrição");
        resultado.ProcedimentoRealizado.Should().Be("Canal");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _atendimentoRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Atendimento?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new AtendimentoRequest());

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRetornarTrue_QuandoEncontrado()
    {
        // Arrange
        var atendimento = new Atendimento { Id = 1 };
        _atendimentoRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(atendimento);
        _atendimentoRepositoryMock.Setup(r => r.RemoverAsync(atendimento)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoNaoEncontrado()
    {
        // Arrange
        _atendimentoRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Atendimento?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
