using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Enums;
using DentusClinic.API.Repositories.Interfaces;
using DentusClinic.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace DentusClinic.API.Services;

public class AuthService : IAuthService
{
    private readonly ILoginRepository _loginRepository;
    private readonly IFuncionarioRepository _funcionarioRepository;
    private readonly IDentistaRepository _dentistaRepository;
    private readonly IConfiguration _config;

    public AuthService(
        ILoginRepository loginRepository,
        IFuncionarioRepository funcionarioRepository,
        IDentistaRepository dentistaRepository,
        IConfiguration config)
    {
        _loginRepository = loginRepository;
        _funcionarioRepository = funcionarioRepository;
        _dentistaRepository = dentistaRepository;
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var login = await _loginRepository.BuscarPorEmailAsync(request.Email);

        if (login is null || !BCrypt.Net.BCrypt.Verify(request.Senha, login.Senha))
            return null;

        string nome = login.Email; // fallback

        // Busca o nome do usuário conforme o tipo de acesso
        if (login.TipoAcesso == TiposAcessoEnum.ADMINISTRADOR ||
            login.TipoAcesso == TiposAcessoEnum.RECEPCIONISTA)
        {
            var func = await _funcionarioRepository.BuscarPorLoginIdAsync(login.Id);
            if (func is not null) nome = func.Nome;
        }
        else if (login.TipoAcesso == TiposAcessoEnum.DENTISTA)
        {
            var dent = await _dentistaRepository.BuscarPorLoginIdAsync(login.Id);
            if (dent is not null) nome = dent.Nome;
        }

        var token = GerarToken(
            (int)login.Id,
            nome,
            login.TipoAcesso.ToString()
        );

        return new LoginResponse
        {
            Token = token,
            TipoAcesso = login.TipoAcesso.ToString(),
            Nome = nome
        };
    }

    private string GerarToken(int id, string nome, string tipoAcesso)
    {
        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")!;
        var issuer = _config["JwtSettings:Issuer"]!;
        var audience = _config["JwtSettings:Audience"]!;
        var expiracaoHoras = int.Parse(_config["JwtSettings:ExpiracaoHoras"]!);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("Id", id.ToString()),
            new Claim("Nome", nome),
            new Claim(ClaimTypes.Role, tipoAcesso)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiracaoHoras),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
