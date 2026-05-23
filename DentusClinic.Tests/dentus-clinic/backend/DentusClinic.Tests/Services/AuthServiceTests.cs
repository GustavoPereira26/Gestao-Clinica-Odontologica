using DentusClinic.API.DTOs.Request;
using DentusClinic.API.Enums;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;

namespace DentusClinic.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<ILoginRepository> _loginRepositoryMock;
    private readonly Mock<IFuncionarioRepository> _funcionarioRepositoryMock;
    private readonly Mock<IDentistaRepository> _dentistaRepositoryMock;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _loginRepositoryMock = new Mock<ILoginRepository>();
        _funcionarioRepositoryMock = new Mock<IFuncionarioRepository>();
        _dentistaRepositoryMock = new Mock<IDentistaRepository>();

        // Configuração mínima necessária para gerar o JWT
        var configValues = new Dictionary<string, string?>
        {
            { "JwtSettings:Issuer", "DentusClinic.API" },
            { "JwtSettings:Audience", "DentusClinic.Client" },
            { "JwtSettings:ExpiracaoHoras", "8" }
        };
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();

        // Chave JWT necessária para GerarToken
        Environment.SetEnvironmentVariable("JWT_SECRET_KEY", "DentusClinic@SecretKey#Teste!SuperSegura123");

        _service = new AuthService(
            _loginRepositoryMock.Object,
            _funcionarioRepositoryMock.Object,
            _dentistaRepositoryMock.Object,
            config
        );
    }

    // ─── LoginAsync ───────────────────────────────────────────────────────────

    [Fact]
    public async Task LoginAsync_DeveRetornarToken_QuandoCredenciaisValidas()
    {
        // Arrange
        var senhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var login = new Login
        {
            Id = 1,
            Email = "admin@dentusclinic.com",
            Senha = senhaHash,
            TipoAcesso = TiposAcessoEnum.ADMINISTRADOR
        };
        var funcionario = new Funcionario { Id = 1, Nome = "Administrador", IdAcesso = 1 };

        _loginRepositoryMock.Setup(r => r.BuscarPorEmailAsync("admin@dentusclinic.com")).ReturnsAsync(login);
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorLoginIdAsync(1)).ReturnsAsync(funcionario);

        var request = new LoginRequest { Email = "admin@dentusclinic.com", Senha = "Admin@123" };

        // Act
        var resultado = await _service.LoginAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Token.Should().NotBeNullOrEmpty();
        resultado.TipoAcesso.Should().Be("ADMINISTRADOR");
        resultado.Nome.Should().Be("Administrador");
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarNull_QuandoEmailNaoEncontrado()
    {
        // Arrange
        _loginRepositoryMock.Setup(r => r.BuscarPorEmailAsync("inexistente@email.com")).ReturnsAsync((Login?)null);

        var request = new LoginRequest { Email = "inexistente@email.com", Senha = "qualquer" };

        // Act
        var resultado = await _service.LoginAsync(request);

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarNull_QuandoSenhaInvalida()
    {
        // Arrange
        var senhaHash = BCrypt.Net.BCrypt.HashPassword("SenhaCorreta@123");
        var login = new Login
        {
            Id = 1,
            Email = "usuario@email.com",
            Senha = senhaHash,
            TipoAcesso = TiposAcessoEnum.SECRETARIA
        };

        _loginRepositoryMock.Setup(r => r.BuscarPorEmailAsync("usuario@email.com")).ReturnsAsync(login);

        var request = new LoginRequest { Email = "usuario@email.com", Senha = "SenhaErrada@999" };

        // Act
        var resultado = await _service.LoginAsync(request);

        // Assert
        resultado.Should().BeNull();
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarNomeFuncionario_QuandoTipoSECRETARIA()
    {
        // Arrange
        var senhaHash = BCrypt.Net.BCrypt.HashPassword("Senha@123");
        var login = new Login
        {
            Id = 2,
            Email = "secretaria@dentusclinic.com",
            Senha = senhaHash,
            TipoAcesso = TiposAcessoEnum.SECRETARIA
        };
        var funcionario = new Funcionario { Id = 2, Nome = "Fernanda Lima", IdAcesso = 2 };

        _loginRepositoryMock.Setup(r => r.BuscarPorEmailAsync("secretaria@dentusclinic.com")).ReturnsAsync(login);
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorLoginIdAsync(2)).ReturnsAsync(funcionario);

        var request = new LoginRequest { Email = "secretaria@dentusclinic.com", Senha = "Senha@123" };

        // Act
        var resultado = await _service.LoginAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Fernanda Lima");
        resultado.TipoAcesso.Should().Be("SECRETARIA");
    }

    [Fact]
    public async Task LoginAsync_DeveRetornarNomeDentista_QuandoTipoDentista()
    {
        // Arrange
        var senhaHash = BCrypt.Net.BCrypt.HashPassword("Dentista@123");
        var login = new Login
        {
            Id = 3,
            Email = "dentista@dentusclinic.com",
            Senha = senhaHash,
            TipoAcesso = TiposAcessoEnum.DENTISTA
        };
        var dentista = new Dentista { Id = 3, Nome = "Dr. Ricardo Alves", IdAcesso = 3 };

        _loginRepositoryMock.Setup(r => r.BuscarPorEmailAsync("dentista@dentusclinic.com")).ReturnsAsync(login);
        _dentistaRepositoryMock.Setup(r => r.BuscarPorLoginIdAsync(3)).ReturnsAsync(dentista);

        var request = new LoginRequest { Email = "dentista@dentusclinic.com", Senha = "Dentista@123" };

        // Act
        var resultado = await _service.LoginAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("Dr. Ricardo Alves");
        resultado.TipoAcesso.Should().Be("DENTISTA");
    }

    [Fact]
    public async Task LoginAsync_DeveUsarEmailComoNome_QuandoFuncionarioNaoEncontrado()
    {
        // Arrange
        var senhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var login = new Login
        {
            Id = 1,
            Email = "admin@dentusclinic.com",
            Senha = senhaHash,
            TipoAcesso = TiposAcessoEnum.ADMINISTRADOR
        };

        _loginRepositoryMock.Setup(r => r.BuscarPorEmailAsync("admin@dentusclinic.com")).ReturnsAsync(login);
        _funcionarioRepositoryMock.Setup(r => r.BuscarPorLoginIdAsync(1)).ReturnsAsync((Funcionario?)null);

        var request = new LoginRequest { Email = "admin@dentusclinic.com", Senha = "Admin@123" };

        // Act
        var resultado = await _service.LoginAsync(request);

        // Assert
        resultado.Should().NotBeNull();
        resultado!.Nome.Should().Be("admin@dentusclinic.com");
    }
}
