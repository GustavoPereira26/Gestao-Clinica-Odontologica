using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class EspecialidadeRepository : IEspecialidadeRepository
{
    private readonly AppDbContext _context;

    public EspecialidadeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Especialidade>> ListarTodosAsync()
        => await _context.Especialidades.ToListAsync();

    public async Task<Especialidade?> BuscarPorIdAsync(int id)
        => await _context.Especialidades.FindAsync(id);

    public async Task AdicionarAsync(Especialidade especialidade)
    {
        _context.Especialidades.Add(especialidade);
        await _context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Especialidade especialidade)
        => await _context.SaveChangesAsync();

    public async Task RemoverAsync(Especialidade especialidade)
    {
        _context.Especialidades.Remove(especialidade);
        await _context.SaveChangesAsync();
    }
}
