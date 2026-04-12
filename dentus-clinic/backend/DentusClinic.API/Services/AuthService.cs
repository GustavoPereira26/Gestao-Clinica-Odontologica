using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DentusClinic.API.Data;
using DentusClinic.API.DTOs.Request;
using DentusClinic.API.DTOs.Response;
using DentusClinic.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DentusClinic.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var login = await _context.Logins
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (login is null || !BCrypt.Net.BCrypt.Verify(request.Senha, login.Senha))
            return null;

        string nome = login.TipoAcesso;

        if (login.TipoAcesso == "ADM" || login.TipoAcesso == "Secretaria")
        {
            var func = await _context.Funcionarios.FirstOrDefaultAsync(x => x.IdAcesso == login.Id);
            if (func is not null) nome = func.Nome;
        }
        else if (login.TipoAcesso == "Dentista")
        {
            var dent = await _context.Dentistas.FirstOrDefaultAsync(x => x.IdAcesso == login.Id);
            if (dent is not null) nome = dent.Nome;
        }

        var token = GerarToken(login.Id, nome, login.TipoAcesso);

        return new LoginResponse
        {
            Token = token,
            TipoAcesso = login.TipoAcesso,
            Nome = nome
        };
    }

    private string GerarToken(int id, string nome, string tipoAcesso)
    {
        var secretKey = _config["JwtSettings:SecretKey"]!;
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
