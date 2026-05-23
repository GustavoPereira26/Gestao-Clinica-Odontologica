using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class LoginRepository : ILoginRepository
{
    private readonly AppDbContext _contexto;

    public LoginRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<Login?> BuscarPorEmailAsync(string email)
        => await _contexto.Logins.FirstOrDefaultAsync(l => l.Email == email);

    public async Task<bool> ExisteEmailAsync(string email)
        => await _contexto.Logins.AnyAsync(l => l.Email == email);

    public async Task AdicionarAsync(Login login)
    {
        _contexto.Logins.Add(login);
        await _contexto.SaveChangesAsync();
    }

    public async Task RemoverAsync(Login login)
    {
        _contexto.Logins.Remove(login);
        await _contexto.SaveChangesAsync();
    }
}
