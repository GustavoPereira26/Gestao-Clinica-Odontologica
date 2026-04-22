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
    private readonly IConfiguration _configuracao;

    public AuthService(
        ILoginRepository loginRepository,
        IFuncionarioRepository funcionarioRepository,
        IDentistaRepository dentistaRepository,
        IConfiguration configuracao)
    {
        _loginRepository = loginRepository;
        _funcionarioRepository = funcionarioRepository;
        _dentistaRepository = dentistaRepository;
        _configuracao = configuracao;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var login = await _loginRepository.BuscarPorEmailAsync(request.Email);

        if (login is null || !BCrypt.Net.BCrypt.Verify(request.Senha, login.Senha))
            return null;

        string nome = login.Email; // fallback

        // Busca o nome do usuário conforme o tipo de acesso
        if (login.TipoAcesso == TiposAcessoEnum.ADMINISTRADOR ||
            login.TipoAcesso == TiposAcessoEnum.SECRETARIA)
        {
            var funcionario = await _funcionarioRepository.BuscarPorLoginIdAsync(login.Id);
            if (funcionario is not null) nome = funcionario.Nome;
        }
        else if (login.TipoAcesso == TiposAcessoEnum.DENTISTA)
        {
            var dentista = await _dentistaRepository.BuscarPorLoginIdAsync(login.Id);
            if (dentista is not null) nome = dentista.Nome;
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
        var chaveSecreta = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")!;
        var emissor = _configuracao["JwtSettings:Issuer"]!;
        var audiencia = _configuracao["JwtSettings:Audience"]!;
        var expiracaoHoras = int.Parse(_configuracao["JwtSettings:ExpiracaoHoras"]!);

        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chaveSecreta));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("Id", id.ToString()),
            new Claim("Nome", nome),
            new Claim(ClaimTypes.Role, tipoAcesso)
        };

        var token = new JwtSecurityToken(
            issuer: emissor,
            audience: audiencia,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiracaoHoras),
            signingCredentials: credenciais
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
