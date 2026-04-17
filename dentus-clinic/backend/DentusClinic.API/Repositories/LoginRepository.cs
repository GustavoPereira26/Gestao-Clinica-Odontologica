using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class LoginRepository : ILoginRepository
{
    private readonly AppDbContext _context;

    public LoginRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Login?> BuscarPorEmailAsync(string email)
        => await _context.Logins.FirstOrDefaultAsync(l => l.Email == email);

    public async Task<bool> ExisteEmailAsync(string email)
        => await _context.Logins.AnyAsync(l => l.Email == email);

    public async Task AdicionarAsync(Login login)
    {
        _context.Logins.Add(login);
        await _context.SaveChangesAsync();
    }

    public async Task RemoverAsync(Login login)
    {
        _context.Logins.Remove(login);
        await _context.SaveChangesAsync();
    }
}
