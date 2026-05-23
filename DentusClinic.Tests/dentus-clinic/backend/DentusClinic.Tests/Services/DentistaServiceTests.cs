using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Moq;

namespace DentusClinic.Tests.Services;

public class DentistaServiceTests
{
    private readonly Mock<IDentistaRepository> _dentistaRepositoryMock;
    private readonly Mock<ILoginRepository> _loginRepositoryMock;
    private readonly DentistaService _service;

    public DentistaServiceTests()
    {
        _dentistaRepositoryMock = new Mock<IDentistaRepository>();
        _loginRepositoryMock = new Mock<ILoginRepository>();
        _service = new DentistaService(_dentistaRepositoryMock.Object, _loginRepositoryMock.Object);
    }

    // ─── CadastrarAsync ───────────────────────────────────────────────────────

    [Fact]
    public async Task CadastrarAsync_DeveCriarDentista_QuandoDadosValidos()
    {
        // Arrange
        var request = new DentistaRequest
        {
            Nome = "Dr. Ricardo Alves",
            Cpf = "111.222.333-44",
            Cro = "SP-12345",
            Email = "ricardo@dentusclinic.com",
            Senha = "Senha@123",
            Telefone = "11999999999",
            IdEspecialidade = 1
        };

        var dentistaSalvo = new Dentista
        {
            Id = 1,
            Nome = "Dr. Ricardo Alves",
            Cpf = "111.222.333-44",
            Cro = "SP-12345",
            IdEspecialidade = 1,
            Login = new Login { Email = "ricardo@dentusclinic.com" },
            Especialidade = new Especialidade { Nome = "Clínica Geral" }
        };

        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _dentistaRepositoryMock.Setup(r => r.ExisteCroAsync(request.Cro, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Login>())).Returns(Task.CompletedTask);
        _dentistaRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Dentista>())).Returns(Task.CompletedTask);
        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(It.IsAny<int>())).ReturnsAsync(dentistaSalvo);

        // Act
        var resultado = await _service.CadastrarAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("Dr. Ricardo Alves");
        resultado.Cro.Should().Be("SP-12345");
    }

    [Fact]
    public async Task CadastrarAsync_DeveCriarLoginAutomaticamente_QuandoCadastrado()
    {
        // Arrange
        var request = new DentistaRequest
        {
            Nome = "Dra. Ana Costa",
            Cpf = "555.666.777-88",
            Cro = "RJ-99999",
            Email = "ana@dentusclinic.com",
            Senha = "Senha@123",
            IdEspecialidade = 2
        };

        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _dentistaRepositoryMock.Setup(r => r.ExisteCroAsync(request.Cro, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Login>())).Returns(Task.CompletedTask);
        _dentistaRepositoryMock.Setup(r => r.AdicionarAsync(It.IsAny<Dentista>())).Returns(Task.CompletedTask);
        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(It.IsAny<int>())).ReturnsAsync(
            new Dentista { Nome = "Dra. Ana Costa", Login = new Login(), Especialidade = new Especialidade() }
        );

        // Act
        await _service.CadastrarAsync(request);

        // Assert — login deve ser criado uma vez
        _loginRepositoryMock.Verify(r => r.AdicionarAsync(It.IsAny<Login>()), Times.Once);
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoCpfDuplicado()
    {
        // Arrange
        var request = new DentistaRequest { Cpf = "111.222.333-44", Nome = "Teste" };
        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CPF já cadastrado no sistema.");
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoCroDuplicado()
    {
        // Arrange
        var request = new DentistaRequest { Cpf = "111.222.333-44", Cro = "SP-12345", Nome = "Teste" };

        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _dentistaRepositoryMock.Setup(r => r.ExisteCroAsync(request.Cro, null)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CRO já cadastrado no sistema.");
    }

    [Fact]
    public async Task CadastrarAsync_DeveLancarExcecao_QuandoEmailDuplicado()
    {
        // Arrange
        var request = new DentistaRequest
        {
            Cpf = "111.222.333-44",
            Cro = "SP-12345",
            Email = "duplicado@email.com",
            Nome = "Teste"
        };

        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, null)).ReturnsAsync(false);
        _dentistaRepositoryMock.Setup(r => r.ExisteCroAsync(request.Cro, null)).ReturnsAsync(false);
        _loginRepositoryMock.Setup(r => r.ExisteEmailAsync(request.Email)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.CadastrarAsync(request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("E-mail já cadastrado no sistema.");
    }

    // ─── BuscarPorIdAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarDentista_QuandoEncontrado()
    {
        // Arrange
        var dentista = new Dentista
        {
            Id = 1,
            Nome = "Dr. Paulo",
            Cpf = "000.111.222-33",
            Cro = "MG-55555",
            Login = new Login { Email = "paulo@email.com" },
            Especialidade = new Especialidade { Nome = "Ortodontia" }
        };
        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(dentista);

        // Act
        var resultado = await _service.BuscarPorIdAsync(1);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Dr. Paulo");
        resultado.NomeEspecialidade.Should().Be("Ortodontia");
    }

    [Fact]
    public async Task BuscarPorIdAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Dentista?)null);

        // Act
        var resultado = await _service.BuscarPorIdAsync(99);

        // Assert
        resultado.Should().BeNull();
    }

    // ─── EditarAsync ──────────────────────────────────────────────────────────

    [Fact]
    public async Task EditarAsync_DeveLancarExcecao_QuandoCpfJaUsadoPorOutro()
    {
        // Arrange
        var dentista = new Dentista
        {
            Id = 1, Nome = "Dr. X", Cpf = "111.111.111-11", Cro = "SP-00001",
            Login = new Login { Email = "x@email.com" },
            Especialidade = new Especialidade()
        };
        var request = new DentistaRequest { Cpf = "999.999.999-99", Cro = "SP-00001", Nome = "Dr. X" };

        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(dentista);
        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, 1)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.EditarAsync(1, request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CPF já cadastrado no sistema.");
    }

    [Fact]
    public async Task EditarAsync_DeveLancarExcecao_QuandoCroJaUsadoPorOutro()
    {
        // Arrange
        var dentista = new Dentista
        {
            Id = 1, Nome = "Dr. X", Cpf = "111.111.111-11", Cro = "SP-00001",
            Login = new Login { Email = "x@email.com" },
            Especialidade = new Especialidade()
        };
        var request = new DentistaRequest { Cpf = "111.111.111-11", Cro = "SP-99999", Nome = "Dr. X" };

        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(dentista);
        _dentistaRepositoryMock.Setup(r => r.ExisteCpfAsync(request.Cpf, 1)).ReturnsAsync(false);
        _dentistaRepositoryMock.Setup(r => r.ExisteCroAsync(request.Cro, 1)).ReturnsAsync(true);

        // Act
        var acao = async () => await _service.EditarAsync(1, request);

        // Assert
        await acao.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("CRO já cadastrado no sistema.");
    }

    [Fact]
    public async Task EditarAsync_DeveRetornarNull_QuandoNaoEncontrado()
    {
        // Arrange
        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Dentista?)null);

        // Act
        var resultado = await _service.EditarAsync(99, new DentistaRequest());

        // Assert
        resultado.Should().BeNull();
    }

    // ─── RemoverAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoverAsync_DeveRemoverDentistaELogin_QuandoEncontrado()
    {
        // Arrange
        var login = new Login { Id = 1, Email = "dentista@email.com" };
        var dentista = new Dentista
        {
            Id = 1, Nome = "Dr. Y",
            Login = login,
            Especialidade = new Especialidade()
        };

        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(1)).ReturnsAsync(dentista);
        _dentistaRepositoryMock.Setup(r => r.RemoverAsync(dentista)).Returns(Task.CompletedTask);
        _loginRepositoryMock.Setup(r => r.RemoverAsync(login)).Returns(Task.CompletedTask);

        // Act
        var resultado = await _service.RemoverAsync(1);

        // Assert
        resultado.Should().BeTrue();
        _dentistaRepositoryMock.Verify(r => r.RemoverAsync(dentista), Times.Once);
        _loginRepositoryMock.Verify(r => r.RemoverAsync(login), Times.Once);
    }

    [Fact]
    public async Task RemoverAsync_DeveRetornarFalse_QuandoNaoEncontrado()
    {
        // Arrange
        _dentistaRepositoryMock.Setup(r => r.BuscarPorIdAsync(99)).ReturnsAsync((Dentista?)null);

        // Act
        var resultado = await _service.RemoverAsync(99);

        // Assert
        resultado.Should().BeFalse();
    }
}
