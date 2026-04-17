using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Enums;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class FuncionarioServiceTests
{
    private readonly Mock<IFuncionarioRepository> _funcionarioRepositoryMock;
    private readonly Mock<ILoginRepository> _loginRepositoryMock;
    private readonly FuncionarioService _service;

    public FuncionarioServiceTests()
    {
        _funcionarioRepositoryMock = new Mock<IFuncionarioRepository>();
        _loginRepositoryMock = new Mock<ILoginRepository>();
        _service = new FuncionarioService(_funcionarioRepositoryMock.Object, _loginRepositoryMock.Object);
    }

    // ─── CadastrarAsync ───────────────────────────────────────────────────────

    [Fact]
    public async Task CadastrarAsync_DeveCriarFuncionario_QuandoDadosValidos()
    {
        // Arrange
        var request = new FuncionarioRequest
        {
            Nome = "Fernanda Lima",
            Cpf = "111.222.333-44",
            Email = "fernanda@dentusclinic.com",
            Senha = "Senha@123",
            Cargo = "RECEPCIONISTA",
            Telefone = "11999999999",
            DataNascimento = new DateOnly(1995, 6, 20)
        };

        _funcionarioRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Login>())).Returns(Task.CompletedTask);
        _funcionarioRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Funcionario>())).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.CadastrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("Fernanda Lima");
        resultado.Cargo.Should().Be("RECEPCIONISTA");
    }

    [Fact]
    public async Task CadastrarAsync_DeveCriarLoginAutomaticamente_QuandoCadastrado()
    {
        // Arrange
        var request = new FuncionarioRequest
        {
            Nome = "Carlos ADM",
            Cpf = "555.666.777-88",
            Email = "carlos@dentusclinic.com",
            Senha = "Admin@123",
            Cargo = "ADMINISTRADOR",
            DataNascimento = new DateOnly(1988, 3, 10)
        };

        _funcionarioRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Login>())).Returns(Task.CompletedTask);
        _funcionarioRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Funcionario>())).Returns(Task.CompletedTask);

        // Act
        await _service.CadastrarAsync(request);

        // Assert — login deve ser criado uma vez
        _loginRepositoryMock.Verify(r => r.AdicionarAsync(It.IsAny<Login>()), Times.Once);
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoCpfDuplicado()
    {
        // Arrange
        var request = new FuncionarioRequest { Cpf = "111.222.333-44", Nome = "Teste" };
        _funcionarioRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CPF já cadastrado no sistema.");
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoEmailDuplicado()
    {
        // Arrange
        var request = new FuncionarioRequest
        {
            Cpf = "111.222.333-44",
            Email = "duplicado@email.com",
            Nome = "Teste"
        };

        _funcionarioRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("E-mail já cadastrado no sistema.");
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoCargoInvalido()
    {
        // Arrange
        var request = new FuncionarioRequest
        {
            Cpf = "111.222.333-44",
            Email = "teste@email.com",
            Cargo = "CARGO_INVALIDO",
            Nome = "Teste"
        };

        _funcionarioRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(false);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cargo inválido.");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarFuncionario_QuandoEncontrado()
    {
        // Arrange
        var login = new Login { Email = "func@email.com" };
        var funcionario = new Funcionario { Id = 1, Nome = "Ana", Cpf = "000.111.222-33", Login = login };
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(funcionario);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Ana");
        resultado.Email.Should().Be("func@email.com");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Funcionario?)null);

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
        var login = new Login { Email = "antes@email.com", TipoAcesso = TiposAcessoEnum.RECEPCIONISTA };
        var funcionario = new Funcionario { Id = 1, Nome = "Antes", Cpf = "111.222.333-44", Login = login };
        var request = new FuncionarioRequest
        {
            Nome = "Depois",
            Cpf = "111.222.333-44",
            Email = "depois@email.com",
            Cargo = "ADMINISTRADOR",
            DataNascimento = new DateOnly(1990, 1, 1)
        };

        _funcionarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(funcionario);
        _funcionarioRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, 1)).ReturnsAsync(false);
        _funcionarioRepositoryMock.Setup(r => r.AtualizarAsync(funcionario)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.EditarAsync(1, request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Depois");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Funcionario?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new FuncionarioRequest());

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRemoverFuncionarioELogin_QuandoEncontrado()
    {
        // Arrange
        var login = new Login { Id = 1, Email = "func@email.com" };
        var funcionario = new Funcionario { Id = 1, Nome = "Ana", Login = login };

        _funcionarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(funcionario);
        _funcionarioRepositoryMock.Setup(r => r.RemoverAsync(funcionario)).Returns(Task.CompletedTask);
        _loginRepositoryMock.Setup(r => r.RemoverAsync(login)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
        _funcionarioRepositoryMock.Verify(r => r.RemoverAsync(funcionario), Times.Once);
        _loginRepositoryMock.Verify(r => r.RemoverAsync(login), Times.Once);
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoNaoEncontrado()
    {
        // Arrange
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Funcionario?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
