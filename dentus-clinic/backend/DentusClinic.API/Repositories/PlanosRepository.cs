using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class PlanosRepository : IPlanosRepository
{
    private readonly AppDbContext _context;

    public PlanosRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Planos>> ListarTodosAsync()
        => await _context.Planos.Include(p => p.Servico).ToListAsync();

    public async Task<Planos?> BuscarPorIdAsync(int id)
        => await _context.Planos.Include(p => p.Servico).FirstOrDefaultAsync(p => p.Id == id);

    public async Task AdicionarAsync(Planos plano)
    {
        _context.Planos.Add(plano);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Planos plano)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Planos plano)
    {
        _context.Planos.Remove(plano);
        await _context.SaveChangesAsync();
    }
}
