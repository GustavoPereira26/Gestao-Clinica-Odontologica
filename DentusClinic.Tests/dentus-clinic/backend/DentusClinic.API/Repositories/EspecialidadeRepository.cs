using DentusClinic.API.Data;
using DentusClinic.API.Models;
using DentusClinic.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DentusClinic.API.Repositories;

public class EspecialidadeRepository : IEspecialidadeRepository
{
    private readonly AppDbContext _contexto;

    public EspecialidadeRepository(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IEnumerable<Especialidade>> ListarTodosAsync()
        => await _contexto.Especialidades.ToListAsync();

    public async Task<Especialidade?> BuscarPorIdAsync(int id)
        => await _contexto.Especialidades.FindAsync(id);

    public async Task AdicionarAsync(Especialidade especialidade)
    {
        _contexto.Especialidades.Add(especialidade);
        await _contexto.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Especialidade especialidade)
        => await _contexto.SaveChangesAsync();

    public async Task RemoverAsync(Especialidade especialidade)
    {
        _contexto.Especialidades.Remove(especialidade);
        await _contexto.SaveChangesAsync();
    }
}
