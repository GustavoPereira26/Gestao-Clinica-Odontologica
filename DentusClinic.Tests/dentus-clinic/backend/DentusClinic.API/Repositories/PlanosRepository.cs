using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class PlanosRepository : IPlanosRepository
{
    private readonly AppDbContext _contexto;

    public PlanosRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Planos>> ListarTodosAsync()
        => await _contexto.Planos.Include(p => p.Servico).ToListAsync();

    public async Task<Planos?> BuscarPorIdAsync(int id)
        => await _contexto.Planos.Include(p => p.Servico).FirstOrDefaultAsync(p => p.Id == id);

    public async Task AdicionarAsync(Planos plano)
    {
        _contexto.Planos.Add(plano);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Planos plano)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Planos plano)
    {
        _contexto.Planos.Remove(plano);
        await _contexto.SaveChangesAsync();
    }
}
